'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/layout/Shell';

export default function Layout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUserOrg();
    }, []);

    async function checkUserOrg() {
        // 1. Get User
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }

        // 2. Get Profile to check Org
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single();

        // 3. Redirect if no Org
        if (!profile?.organization_id) {
            router.push('/onboarding');
        } else {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="min-h-screen bg-brand-black flex items-center justify-center text-brand-mint font-mono animate-pulse">
            ACCESSING HIVE MIND...
        </div>;
    }

    return (
        <DashboardShell>
            {children}
        </DashboardShell>
    );
}
