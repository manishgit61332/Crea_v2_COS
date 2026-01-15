'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { BrainCircuit, Hexagon } from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();
    const [orgName, setOrgName] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orgName.trim()) return;

        setLoading(true);
        setMsg('');

        try {
            const { data, error } = await supabase.rpc('create_organization', {
                org_name: orgName
            });

            if (error) {
                setMsg(error.message);
            } else {
                // Success: Redirect to Dashboard
                router.push('/dashboard');
            }
        } catch (err: any) {
            setMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm shadow-2xl">
                <div className="flex justify-center mb-8">
                    <div className="bg-brand-mint/10 p-4 rounded-full">
                        <Hexagon className="w-12 h-12 text-brand-mint" />
                    </div>
                </div>

                <h1 className="text-3xl font-serif text-center text-white mb-2">Initialize Hive Mind</h1>
                <p className="text-center text-gray-400 mb-8 font-sans">
                    Create a secure neural container for your organization.
                </p>

                <form onSubmit={handleCreateOrg} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Organization Name</label>
                        <input
                            type="text"
                            required
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-mint transition-colors"
                            placeholder="e.g. Stark Industries"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            This will be the unique namespace for all your tasks, decisions, and memories.
                        </p>
                    </div>

                    {msg && (
                        <div className="p-3 bg-brand-red/20 border border-brand-red text-brand-pink text-sm rounded">
                            {msg}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-mint text-brand-black font-bold py-3 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Initializing...' : 'Launch Organization'}
                    </button>
                </form>
            </div>
        </div>
    );
}
