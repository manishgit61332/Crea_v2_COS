'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Cpu } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import clsx from 'clsx';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    mode?: string;
};

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Online. I am ready to assist.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    async function handleSend() {
        if (!input.trim() || loading) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            // User ID fallback for demo if no auth
            const userId = user?.id || 'demo-user-id';

            // Call Backend API
            const res = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    message: userMsg,
                    userContext: { full_name: user?.user_metadata?.full_name }
                })
            });

            const data = await res.json();

            if (data.error) throw new Error(data.error);

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.response,
                mode: data.mode
            }]);

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Connection Error. Ensure Backend is running.' }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-white/5 rounded-lg border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="bg-brand-black p-4 border-b border-white/10 flex items-center">
                <Cpu className="w-5 h-5 text-brand-mint mr-2" />
                <h2 className="text-lg font-serif text-white">Neural Network Uplink</h2>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={clsx(
                        "flex w-full mb-4",
                        msg.role === 'user' ? "justify-end" : "justify-start"
                    )}>
                        <div className={clsx(
                            "max-w-[80%] rounded-lg p-3 flex items-start gap-3",
                            msg.role === 'user' ? "bg-brand-orange text-black" : "bg-white/10 text-white"
                        )}>
                            <div className="mt-1">
                                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div>
                                {msg.mode && (
                                    <div className="text-[10px] uppercase tracking-wider opacity-70 mb-1 font-mono">
                                        [{msg.mode} MODE]
                                    </div>
                                )}
                                <div className="whitespace-pre-wrap font-sans text-sm">
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start w-full">
                        <div className="bg-white/10 text-gray-400 rounded-lg p-3 text-xs font-mono animate-pulse">
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-brand-black border-t border-white/10">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a command or query..."
                        className="flex-1 bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-orange transition-colors"
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="bg-brand-mint text-brand-black px-4 py-2 rounded hover:bg-white transition-colors disabled:opacity-50"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
