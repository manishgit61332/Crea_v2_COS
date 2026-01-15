const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function generateCompletion(systemPrompt, userPrompt, model = 'gpt-4o') {
    try {
        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.2, // Low temp for reliability
        });
        return completion.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI Generation Error:', error);
        throw error;
    }
}

async function generateJSON(systemPrompt, userPrompt, model = 'gpt-4o') {
    try {
        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
        });
        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error('OpenAI JSON Error:', error);
        // Fallback or re-throw
        return { error: 'Failed to generate JSON' };
    }
}

async function generateEmbedding(text) {
    try {
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
            encoding_format: "float",
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error('OpenAI Embedding Error:', error);
        throw error;
    }
}

module.exports = {
    generateCompletion,
    generateJSON,
    generateEmbedding
};
