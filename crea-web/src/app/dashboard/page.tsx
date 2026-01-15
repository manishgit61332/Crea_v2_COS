import TaskBoard from '@/components/dashboard/TaskBoard';
import VisualBrain from '@/components/dashboard/VisualBrain';

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-serif text-brand-orange">Command Center</h1>
                <div className="flex space-x-3">
                    <a
                        href="https://t.me/my_crea_bot"
                        target="_blank"
                        className="bg-white/10 text-brand-mint px-4 py-2 rounded font-sans font-medium hover:bg-white/20 transition-colors border border-brand-mint/20"
                    >
                        Connect Telegram
                    </a>
                    <button className="bg-brand-mint text-brand-black px-4 py-2 rounded font-sans font-medium hover:bg-white transition-colors">
                        New Task
                    </button>
                </div>
            </div>

            {/* Metrics / Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                    <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Active Tasks</h3>
                    <p className="mt-2 text-3xl font-bold text-white">12</p>
                </div>
                <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                    <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Upcoming Deadlines</h3>
                    <p className="mt-2 text-3xl font-bold text-white">3</p>
                </div>
                <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                    <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Pending Decisions</h3>
                    <p className="mt-2 text-3xl font-bold text-brand-orange">2</p>
                </div>
            </div>

            {/* Visual Brain (Hive Mind) */}
            <div className="mt-8">
                <VisualBrain />
            </div>

            {/* Task Board */}
            <h2 className="text-xl font-serif text-white mt-12 mb-4">Priority Matrix</h2>
            <div className="">
                <TaskBoard />
            </div>
        </div>
    );
}
