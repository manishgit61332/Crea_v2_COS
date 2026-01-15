import Sidebar from './Sidebar';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden bg-brand-black">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-brand-black text-foreground relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
