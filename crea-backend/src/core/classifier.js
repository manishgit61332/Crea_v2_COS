const { generateJSON } = require('./llm');

const SYSTEM_PROMPT = `
You are the Input Classifier for CREA, an AI Chief of Staff.
Your job is to classify the USER QUERY into one of two modes:

1. FACTUAL
   - Triggers: Questions about existing projects, tasks, deadlines, decisions, or past events.
   - Criteria: The user is asking for information that should be in the database (Source of Truth).
   - Examples: "What is the deadline for Project X?", "Did we decide to hire John?", "List my tasks."

2. STRATEGIC
   - Triggers: Brainstorming, drafting, problem-solving, creating new content from scratch.
   - Criteria: The user is asking for creative input or general knowledge.
   - Examples: "Draft an email to the client.", "How should we structure the marketing team?", "Give me ideas for a launch event."

Output must be a JSON object:
{
  "mode": "FACTUAL" | "STRATEGIC",
  "reasoning": "Brief explanation of why.",
  "required_buckets": ["TASKS", "DECISIONS", "PROJECTS", "CALENDAR", "IDENTITY"] (List relevant buckets to search if FACTUAL, empty if STRATEGIC)
}
`;

async function classifyIntent(query) {
    if (!query) return { mode: 'STRATEGIC', reasoning: 'Empty query' };

    try {
        const result = await generateJSON(SYSTEM_PROMPT, query, 'gpt-4o-mini'); // Use mini for speed
        return result;
    } catch (error) {
        console.error('Classification failed:', error);
        // Default to STRATEGIC if uncertain, or FACTUAL to be safe? 
        // Default to STRATEGIC allows conversation, but FACTUAL prevents hallucination.
        // Let's default to STRATEGIC but warn.
        return { mode: 'STRATEGIC', reasoning: 'Classification Error' };
    }
}

module.exports = { classifyIntent };
