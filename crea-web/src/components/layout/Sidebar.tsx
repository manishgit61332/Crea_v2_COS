'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, CheckSquare, Gavel, Eye, Users, Settings, LogOut, BrainCircuit } from 'lucide-react';
import clsx from 'clsx';

const NAVIGATION = [
    { name: 'Command Center', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Neural Network', href: '/dashboard/chat', icon: BrainCircuit },
    { name: 'Projects', href: '/dashboard/projects', icon: Briefcase },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Decisions', href: '/dashboard/decisions', icon: Gavel },
    { name: 'Team', href: '/dashboard/team', icon: Users },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col bg-brand-black border-r border-white/10 text-white">
            {/* Brand Header */}
            <div className="flex h-16 items-center px-6 border-b border-white/10">
                <BrainCircuit className="h-8 w-8 text-brand-orange mr-3" />
                <span className="text-xl font-serif font-bold text-white tracking-wide">
                    CREA
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-6">
                {NAVIGATION.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                'group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors',
                                isActive
                                    ? 'bg-brand-orange text-brand-black'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            )}
                        >
                            <item.icon
                                className={clsx(
                                    'mr-3 h-5 w-5 flex-shrink-0',
                                    isActive ? 'text-brand-black' : 'text-gray-500 group-hover:text-white'
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User Profile */}
            <div className="border-t border-white/10 p-4">
                <Link
                    href="/settings"
                    className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-400 rounded-md hover:bg-white/5 hover:text-white"
                >
                    <Settings className="mr-3 h-5 w-5 text-gray-500 group-hover:text-white" />
                    Settings
                </Link>
            </div>
        </div>
    );
}
