const supabase = require('../db/supabase');

const VALID_STATUSES = ['Backlog', 'Next', 'Doing', 'Done'];

async function createTask(userId, { title, description, due_date, priority }) {
    const { data, error } = await supabase
        .from('tasks')
        .insert({
            user_id: userId,
            title,
            description,
            status: 'Backlog', // Default start state
            due_date,
            priority: priority || 'Medium'
        })
        .select()
        .single();

    if (error) throw new Error(`Failed to create task: ${error.message}`);
    return data;
}

async function updateTaskStatus(userId, { taskId, newStatus }) {
    // Validate Status Transition
    if (!VALID_STATUSES.includes(newStatus)) {
        throw new Error(`Invalid status: ${newStatus}. Must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    // TODO: Implement strict transitions if needed (e.g. Backlog -> Next only)
    // For MVP, allow jumps.

    const { data, error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)
        .eq('user_id', userId) // Security Check
        .select()
        .single();

    if (error) throw new Error(`Failed to update task: ${error.message}`);
    return data;
}

module.exports = { createTask, updateTaskStatus };
