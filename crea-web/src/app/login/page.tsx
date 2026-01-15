'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { BrainCircuit } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setMsg(error.message);
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        setLoading(true);
        setMsg('');

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password
            });

            if (error) setMsg(error.message);
            else setMsg('Check your email for the confirmation link.');
        } catch (err: any) {
            setMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm shadow-2xl">
                <div className="flex justify-center mb-8">
                    <div className="bg-brand-orange/10 p-4 rounded-full">
                        <BrainCircuit className="w-12 h-12 text-brand-orange" />
                    </div>
                </div>

                <h1 className="text-3xl font-serif text-center text-white mb-2">Access Gateway</h1>
                <p className="text-center text-gray-400 mb-8 font-sans">Identify yourself to the Neural Network.</p>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Identity</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-orange transition-colors"
                            placeholder="operator@crea.ai"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Access Code</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-orange transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    {msg && (
                        <div className="p-3 bg-brand-red/20 border border-brand-red text-brand-pink text-sm rounded">
                            {msg}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-orange text-black font-bold py-3 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Authenticating...' : 'Establish Uplink'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={handleSignUp}
                        className="text-sm text-brand-mint/70 hover:text-brand-mint underline underline-offset-4"
                        type="button"
                    >
                        New Operator? Initialize Identity.
                    </button>
                </div>
            </div>
        </div>
    );
}
