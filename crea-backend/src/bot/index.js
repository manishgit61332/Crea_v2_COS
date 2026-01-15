const { Telegraf, Scenes, session } = require('telegraf');
const supabase = require('../db/supabase');
const onboardingScene = require('./onboarding');

async function startBot() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token || token === 'your-bot-token-here') {
        console.error('⚠️  TELEGRAM_BOT_TOKEN is missing or default in .env');
        console.error('Please update .env with your actual Telegram Bot Token.');
        return;
    }

    const bot = new Telegraf(token);

    // Setup Scenes
    const stage = new Scenes.Stage([onboardingScene]);
    bot.use(session());
    bot.use(stage.middleware());

    // Middleware to check authentication and context
    bot.use(async (ctx, next) => {
        // Skip if system message or no from
        if (!ctx.from) return next();

        const telegramId = ctx.from.id;

        // 1. Fetch Profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('telegram_id', telegramId)
            .single();

        if (profile) {
            ctx.session.user = profile;
            ctx.userProfile = profile; // Alias
        }

        // 2. Identify Chat Context (Group or Private)
        const isGroup = ctx.chat?.type === 'group' || ctx.chat?.type === 'supergroup';
        ctx.isGroup = isGroup;

        // 3. Determine Organization ID
        if (isGroup) {
            // Check if this group is linked
            const { data: link } = await supabase
                .from('org_chats')
                .select('organization_id')
                .eq('telegram_chat_id', ctx.chat.id)
                .single();

            ctx.org_id = link ? link.organization_id : null;
        } else {
            // Private chat always uses user's org
            ctx.org_id = profile ? profile.organization_id : null;
        }

        return next();
    });

    // Command: Connect Group to Org
    bot.command('connect', async (ctx) => {
        if (!ctx.isGroup) return ctx.reply('This command is for Groups only.');
        if (!ctx.crea_user) return ctx.reply('I don\'t know you. DM me first to register.');
        if (!ctx.crea_user.organization_id) return ctx.reply('You don\'t belong to an Organization.');

        // Link Chat
        const { error } = await supabase.from('org_chats').insert({
            organization_id: ctx.crea_user.organization_id,
            telegram_chat_id: ctx.chat.id,
            telegram_chat_title: ctx.chat.title,
            created_by: ctx.crea_user.id
        });

        if (error) return ctx.reply(`Failed to link: ${error.message}`);
        return ctx.reply('✅ Hive Mind Connected. This group is now synced to your Organization.');
    });

    // Middleware: Gatekeeper for Unlinked Groups
    bot.use((ctx, next) => {
        if (ctx.isGroup && !ctx.org_id && !ctx.message?.text?.startsWith('/connect')) {
            // Silent ignore or helpful hint? Silent is better for groups.
            // But if explicitly mentioned:
            // if (ctx.message?.text?.includes('@' + ctx.botInfo.username)) {
            //    return ctx.reply('This frequency is unsecured. Use /connect to link to your Org.');
            // }
            return;
        }
        return next();
    });

    bot.start(async (ctx) => {
        const telegramId = ctx.from.id;

        // Check DB
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('telegram_id', telegramId)
            .single();

        if (profile) {
            ctx.session.user = profile;
            ctx.reply(`Welcome back, ${profile.full_name}. I am ready.`);
        } else {
            ctx.reply('Welcome. I don\'t recognize you.');
            ctx.scene.enter('onboarding');
        }
    });

    bot.help((ctx) => ctx.reply('I can help you manage projects, tasks, and decisions.'));

    const { classifyIntent } = require('../core/classifier');
    const { retrieveEvidence } = require('../core/retrieval');
    const { generateCompletion } = require('../core/llm'); // Needed for generation
    // We need to implement a 'generateResponse' that handles tools.
    // For MVP, we'll do a simple text generation and check for JSON tool calls in the output?
    // Or use proper function calling if we upgrade llm.js.
    // Let's stick to text generation that MIGHT include a tool call code block.

    bot.on('message', async (ctx) => {
        if (!ctx.session.user) {
            if (ctx.message.text) {
                ctx.reply('You are not authenticated. Please run /start.');
            }
            return;
        }

        const userQuery = ctx.message.text;
        if (!userQuery) return;

        ctx.sendChatAction('typing');

        try {
            const userId = ctx.session.user.id;

            // 1. Classify
            const classification = await classifyIntent(userQuery);
            // console.log(`[${userId}] Mode: ${classification.mode}`);

            // 2. Retrieve Evidence (if necessary)
            let evidence = "";
            if (classification.mode === 'FACTUAL' || classification.required_buckets?.length > 0) {
                ctx.sendChatAction('find_location'); // Visual indicator
                // Pass org_id to search scope
                evidence = await retrieveEvidence(userId, userQuery, classification, { orgId: ctx.org_id });
                if (!evidence && classification.mode === 'FACTUAL') {
                    ctx.reply("I don't have that in memory."); // Anti-Hallucination Rule
                    return;
                }
            }

            // 3. Generate Response (Context + Evidence)
            const systemPrompt = `
You are CREA, an AI Chief of Staff.
User Profile: ${ctx.session.user.full_name}
Mode: ${classification.mode}

EVIDENCE FOUND:
${evidence || "None"}

INSTRUCTIONS:
- If Mode is FACTUAL: You MUST answer ONLY based on the Evidence. If evidence is missing, say "I don't know".
- If Mode is STRATEGIC: You can use general knowledge.
- Be concise (Chief of Staff persona). Snapshot, Decision, Next Actions.
- IMPORTANT: If the user wants to CREATE a task or UPDATE a task, output a specialized Action Block at the end.
- Action Block Format: 
\`\`\`json
{ "action": "create_task", "data": { "title": "...", "due_date": "..." } }
\`\`\`
`.trim();

            const response = await generateCompletion(systemPrompt, userQuery);

            // 4. Parse Actions (Naive implementation)
            // Check for JSON block
            const actionMatch = response.match(/```json\n([\s\S]*?)\n```/);

            let finalReply = response; // Default to LLM text

            if (actionMatch) {
                try {
                    const actionJson = JSON.parse(actionMatch[1]);
                    if (actionJson.action === 'create_task') {
                        // Call Action
                        const { createTask } = require('../core/actions');
                        const task = await createTask(userId, actionJson.data);
                        finalReply = response.replace(actionMatch[0], `\n✅ Task Created: ${task.title} [Status: ${task.status}]`);
                    } else if (actionJson.action === 'update_task_status') {
                        const { updateTaskStatus } = require('../core/actions');
                        const task = await updateTaskStatus(userId, actionJson.data);
                        finalReply = response.replace(actionMatch[0], `\n🔄 Task Updated: ${task.title} is now ${task.status}`);
                    }
                    // Handle other actions...
                } catch (e) {
                    console.error('Action execution failed:', e);
                    finalReply += "\n⚠️ Failed to execute action.";
                }
            } else {
                // If Factual and no evidence, we handled it above? 
                // Logic check: LLM might still say "I found X" if evidence was passed.
            }

            ctx.reply(finalReply);

        } catch (error) {
            console.error('Processing Error:', error);
            ctx.reply('I encountered a system error.');
        }
    });

    // Launch the bot
    bot.launch().then(() => {
        console.log('✅ Telegram Bot started successfully!');
    });

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

module.exports = { startBot };
