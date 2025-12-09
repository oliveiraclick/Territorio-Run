import React from 'react';
import { User, Menu, Trophy, HelpCircle, Map, Users, Shield } from 'lucide-react';

interface AppShellProps {
    children: React.ReactNode; // The map or main content
    user: { name: string; avatar?: string; teamId?: string; role?: string } | null;
    stars: number;
    onProfileClick: () => void;
    onMenuClick: () => void;
    onStartClick: () => void;
    onStopClick: () => void;
    isRunning: boolean;
    onTeamClick: () => void;
    onRankingClick: () => void; // Could be same as Menu or separate
    onHelpClick: () => void;
    navContent?: React.ReactNode; // Optional custom nav content (like filters)
}

export const AppShell: React.FC<AppShellProps> = ({
    children,
    user,
    stars,
    onProfileClick,
    onMenuClick,
    onStartClick,
    onStopClick,
    isRunning,
    onTeamClick,
    onRankingClick,
    onHelpClick,
    navContent
}) => {
    return (
        <div className="relative h-screen w-full overflow-hidden bg-gray-900 select-none touch-none">
            {/* --- TOP BAR --- */}
            <div className="absolute top-0 left-0 right-0 h-safe-top z-40 pointer-events-none">
                {/* Status Bar Spacer (optional, depending on meta tags) */}
            </div>

            <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-auto">
                {/* Profile Profile */}
                <button
                    onClick={onProfileClick}
                    className="flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full pl-1 pr-4 py-1 shadow-lg active:scale-95 transition-transform"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center border-2 border-white/20">
                        {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" /> : <span className="font-bold text-white text-xs">{user?.name?.charAt(0).toUpperCase()}</span>}
                    </div>
                    <span className="text-white text-xs font-bold max-w-[80px] truncate">{user?.name || 'Guerreiro'}</span>
                </button>

                {/* Stars / Level */}
                <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-yellow-500/30">
                    <span className="text-yellow-400 text-sm">⭐</span>
                    <span className="text-white font-black font-mono">{stars}</span>
                </div>

                {/* Right Action (Menu or Filter) */}
                <div className="flex items-center gap-2">
                    {navContent}
                    <button
                        onClick={onMenuClick}
                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
                    >
                        <Menu size={20} />
                    </button>
                </div>
            </div>

            {/* --- MAIN CONTENT (MAP) --- */}
            <div className="absolute inset-0 z-0">
                {children}
            </div>

            {/* --- BOTTOM DOCK --- */}
            <div className="absolute bottom-6 left-4 right-4 z-30 h-20 bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex items-center px-2 justify-between safe-area-pb">

                {/* Left Actions */}
                <div className="flex items-center gap-1 w-1/3 justify-center">
                    <DockButton icon={<Users size={20} />} label="Equipe" onClick={onTeamClick} active={!!user?.teamId} />
                    <DockButton icon={<Trophy size={20} />} label="Ranking" onClick={onRankingClick} />
                </div>

                {/* CENTRAL ACTION BUTTON (START/STOP) */}
                <div className="relative -top-6">
                    <button
                        onClick={isRunning ? onStopClick : onStartClick}
                        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] border-4 border-gray-900 transition-all active:scale-95 ${isRunning
                                ? 'bg-red-600 text-white animate-pulse'
                                : 'bg-green-500 text-black hover:bg-green-400'
                            }`}
                    >
                        {isRunning ? (
                            <div className="w-8 h-8 rounded-sm bg-white" />
                        ) : (
                            <div className="ml-1 w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-black border-b-[12px] border-b-transparent" />
                        )}
                    </button>
                    {isRunning && (
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-black/50 px-2 rounded">Em Curso</span>
                        </div>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1 w-1/3 justify-center">
                    <DockButton icon={<HelpCircle size={20} />} label="Ajuda" onClick={onHelpClick} />
                    {user?.role === 'admin' && (
                        <DockButton icon={<Shield size={20} />} label="Admin" onClick={() => window.location.href = '/admin'} className="text-red-400" />
                    )}
                </div>

            </div>
        </div>
    );
};

// Helper Subcomponent
const DockButton = ({ icon, label, onClick, active = false, className = "" }: any) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all active:scale-90 ${active ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'} ${className}`}
    >
        {icon}
        <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">{label}</span>
    </button>
);
