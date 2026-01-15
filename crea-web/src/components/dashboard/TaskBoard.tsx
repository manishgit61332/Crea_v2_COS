'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Circle, Clock } from 'lucide-react';

type Task = {
    id: string;
    title: string;
    status: 'Backlog' | 'Next' | 'Doing' | 'Done';
    priority: string;
    due_date: string | null;
};

const COLUMNS = ['Backlog', 'Next', 'Doing', 'Done'];

export default function TaskBoard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    async function fetchTasks() {
        try {
            // Fetch tasks from Supabase
            // Assuming RLS allows us to see our own tasks
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setTasks(data as Task[]);
        } catch (err) {
            console.error('Error fetching tasks:', err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="text-white">Loading tasks...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full min-h-[500px]">
            {COLUMNS.map((column) => (
                <div key={column} className="bg-white/5 rounded-lg border border-white/10 flex flex-col h-full">
                    {/* Column Header */}
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h3 className="font-serif text-lg text-white">{column}</h3>
                        <span className="text-xs text-gray-500 font-mono bg-black/50 px-2 py-1 rounded-full">
                            {tasks.filter(t => t.status === column).length}
                        </span>
                    </div>

                    {/* Cards */}
                    <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                        {tasks.filter(t => t.status === column).map((task) => (
                            <div key={task.id} className="bg-brand-black p-4 rounded border border-white/10 hover:border-brand-orange transition-colors group">
                                <h4 className="text-white font-medium mb-2">{task.title}</h4>

                                <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                                    <div className="flex items-center space-x-2">
                                        {task.due_date && (
                                            <span className="flex items-center text-brand-orange">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {new Date(task.due_date).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Status Move Button (MVP) */}
                                    {column !== 'Done' && (
                                        <button className="text-gray-600 hover:text-brand-mint opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {tasks.filter(t => t.status === column).length === 0 && (
                            <div className="text-center py-8 text-gray-700 text-sm">
                                No tasks
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
