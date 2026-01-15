const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { classifyIntent } = require('./core/classifier');
const { retrieveEvidence } = require('./core/retrieval');
const { generateCompletion } = require('./core/llm');
// Helper to handle actions (duplicated logic from bot - should refactor, but for MVP keep separate or export)
// We'll refactor action logic into a 'processQuery' core function later.
// For now, I'll inline the logic to get it working fast.

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/chat', async (req, res) => {
    const { userId, message, userContext } = req.body;
    // userContext can contain full_name, etc.

    if (!message) return res.status(400).json({ error: 'Message required' });

    try {
        // 1. Classify
        const classification = await classifyIntent(message);

        // 2. Retrieve
        let evidence = "";
        if (classification.mode === 'FACTUAL' || classification.required_buckets?.length > 0) {
            evidence = await retrieveEvidence(userId, message, classification);
        }

        // 3. Generate
        const systemPrompt = `
You are CREA, an AI Chief of Staff.
User Profile: ${userContext?.full_name || 'User'}
Mode: ${classification.mode}

EVIDENCE FOUND:
${evidence || "None"}

INSTRUCTIONS:
- Answer based on Evidence (FACTUAL) or General Knowledge (STRATEGIC).
- Output Action JSON if needed.
`.trim();

        const response = await generateCompletion(systemPrompt, message);

        // 4. Action Handling (Simplified for API - just return the text and action separately?)
        // For simplicity, we just return the raw text including the Markdown JSON.
        // The frontend can parse it if it wants animations, or the LLM output is enough.

        // Parse action for server-side execution same as bot
        const actionMatch = response.match(/```json\n([\s\S]*?)\n```/);
        let finalPayload = { text: response, action_performed: null };

        if (actionMatch) {
            try {
                const actionJson = JSON.parse(actionMatch[1]);
                if (actionJson.action === 'create_task') {
                    const { createTask } = require('./core/actions');
                    const task = await createTask(userId, actionJson.data);
                    finalPayload.action_performed = `Task Created: ${task.title}`;
                } else if (actionJson.action === 'update_task_status') {
                    const { updateTaskStatus } = require('./core/actions');
                    const task = await updateTaskStatus(userId, actionJson.data);
                    finalPayload.action_performed = `Task Updated: ${task.title} -> ${task.status}`;
                }
            } catch (e) {
                console.error('API Action Error', e);
            }
        }

        res.json({
            response: finalPayload.text,
            mode: classification.mode,
            action: finalPayload.action_performed
        });

    } catch (error) {
        console.error('API Error', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

function startServer() {
    const port = process.env.PORT || 3001; // Default to 3001 to avoid React 3000 conflict
    app.listen(port, () => {
        console.log(`✅ API Server listening on port ${port}`);
    });
}

module.exports = { startServer };
