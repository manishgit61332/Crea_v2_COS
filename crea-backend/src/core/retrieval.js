const supabase = require('../db/supabase');
const { generateEmbedding } = require('./llm');

async function retrieveEvidence(userId, query, classification, options = {}) {
    const buckets = classification.required_buckets || [];
    const promises = [];

    // 1. Vector Search
    if (buckets.includes('IDENTITY') || buckets.length === 0) {
        promises.push(searchVectors(userId, query, options.orgId).then(res =>
            res.map(r => `[MEMORY] ${r.content} (Source: ${r.metadata?.source || 'Unknown'})`)
        ));
    }

    // 2. Structured SQL Search
    const bucketMap = {
        'TASKS': searchTasks,
        'PROJECTS': searchProjects,
        'DECISIONS': searchDecisions,
        'CALENDAR': searchCalendar
    };

    for (const bucket of buckets) {
        if (bucketMap[bucket]) {
            promises.push(bucketMap[bucket](userId, query).then(res => {
                return res.map(item => `[${bucket}] ${JSON.stringify(item)}`);
            }));
        }
    }

    const results = await Promise.all(promises);
    return results.flat().join('\n');
}

async function searchVectors(userId, query, orgId) {
    const embedding = await generateEmbedding(query);

    const { data, error } = await supabase.rpc('match_memory_fragments', {
        query_embedding: embedding,
        match_threshold: 0.75,
        match_count: 5,
        filter_user_id: userId,
        filter_org_id: orgId || null
    });

    if (error) {
        console.error('Vector Search Error:', error);
        return [];
    }
    return data || [];
}

async function searchTasks(userId, query) {
    const { data } = await supabase
        .from('tasks')
        .select('title, status, due_date, priority')
        .eq('user_id', userId)
        .ilike('title', `%${query}%`)
        .limit(5);
    return data || [];
}

async function searchProjects(userId, query) {
    const { data } = await supabase
        .from('projects')
        .select('title, status, description')
        .eq('user_id', userId)
        .ilike('title', `%${query}%`)
        .limit(3);
    return data || [];
}

async function searchDecisions(userId, query) {
    const { data } = await supabase
        .from('decisions')
        .select('decision_text, context, committed_at')
        .eq('user_id', userId)
        .ilike('decision_text', `%${query}%`)
        .limit(5);
    return data || [];
}

async function searchCalendar(userId, query) {
    const { data } = await supabase
        .from('calendar_events')
        .select('title, start_at')
        .eq('user_id', userId)
        .gte('start_at', new Date().toISOString())
        .limit(5);
    return data || [];
}

module.exports = { retrieveEvidence };
