import React from 'react';
import { User, Menu, Trophy, HelpCircle, Map, Users, Shield, Zap } from 'lucide-react';

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
        <div className="relative h-screen w-full overflow-hidden bg-gray-900 select-none touch-none font-sans">
            {/* --- TOP BAR (Floating Pills) --- */}
            <div className="absolute top-0 left-0 right-0 h-safe-top z-40 pointer-events-none"></div>

            <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-auto">
                {/* Profile Pill */}
                <button
                    onClick={onProfileClick}
                    className="group flex items-center space-x-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full py-1.5 pl-1.5 pr-4 shadow-lg hover:bg-black/80 hover:scale-105 transition-all"
                >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 p-0.5">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                            {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <span className="font-black text-white text-xs">{user?.name?.charAt(0).toUpperCase()}</span>}
                        </div>
                    </div>
                    <div>
                        <span className="block text-white text-xs font-bold leading-none max-w-[80px] truncate">{user?.name || 'Agente'}</span>
                        <span className="text-[10px] text-gray-400 font-medium leading-none">Nível {Math.floor(stars / 100) + 1}</span>
                    </div>
                </button>

                {/* Stars Pill (Center) */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-2 flex items-center space-x-1.5 bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-full border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                    <span className="text-yellow-400 text-sm animate-pulse">⭐</span>
                    <span className="text-white font-black font-mono text-sm tracking-wide">{stars}</span>
                </div>

                {/* Menu Button */}
                <div className="flex items-center gap-2">
                    {navContent}
                    <button
                        onClick={onMenuClick}
                        className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white shadow-lg active:scale-90 hover:bg-white/10 transition-all"
                    >
                        <Menu size={22} className="text-gray-200" />
                    </button>
                </div>
            </div>

            {/* --- MAIN CONTENT (MAP) --- */}
            <div className="absolute inset-0 z-0">
                {children}
            </div>

            {/* --- BOTTOM DOCK (Floating Island) --- */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 w-[95%] max-w-md">
                <div className="bg-black/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center justify-between px-6 py-4 relative safe-area-pb">

                    {/* Left Actions */}
                    <div className="flex items-center gap-4">
                        <DockButton icon={<Users size={22} />} label="Equipe" onClick={onTeamClick} active={!!user?.teamId} color="text-neon-blue" />
                        <DockButton icon={<Trophy size={22} />} label="Rank" onClick={onRankingClick} color="text-yellow-400" />
                    </div>

                    {/* CENTRAL PLAY BUTTON */}
                    <div className="absolute left-1/2 -top-8 transform -translate-x-1/2">
                        <button
                            onClick={isRunning ? onStopClick : onStartClick}
                            className={`group relative w-24 h-24 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.6)] border-[6px] border-dark-bg transition-all duration-300 active:scale-95 ${isRunning
                                ? 'bg-gradient-to-br from-neon-red to-red-600'
                                : 'bg-gradient-to-br from-neon-green to-emerald-600' // WOW Green
                                }`}
                        >
                            {/* Glow Effect */}
                            <div className={`absolute inset-0 rounded-full blur-xl opacity-60 ${isRunning ? 'bg-neon-red animate-pulse' : 'bg-neon-green animate-pulse'}`}></div>

                            <div className="relative z-10">
                                {isRunning ? (
                                    <div className="w-8 h-8 rounded-md bg-white shadow-sm" />
                                ) : (
                                    <Zap size={40} className="text-black fill-black ml-1 drop-shadow-md group-hover:scale-110 transition-transform" />
                                    // Alternative: Standard Play Triangle
                                    // <div className="ml-2 w-0 h-0 border-t-[14px] border-t-transparent border-l-[24px] border-l-white border-b-[14px] border-b-transparent filter drop-shadow-sm" />
                                )}
                            </div>
                        </button>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        <DockButton icon={<HelpCircle size={22} />} label="Ajuda" onClick={onHelpClick} color="text-neon-purple" />
                        {user?.role === 'admin' && (
                            <DockButton icon={<Shield size={22} />} label="Admin" onClick={() => window.location.href = '/admin'} color="text-neon-red" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Subcomponent
const DockButton = ({ icon, label, onClick, active = false, className = "", color = "text-white" }: any) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center transition-all active:scale-90 group relative`}
    >
        <div className={`p-2 rounded-2xl transition-colors ${active ? 'bg-white/10' : 'hover:bg-white/5'} ${active ? 'shadow-[0_0_10px_rgba(255,255,255,0.2)]' : ''}`}>
            {React.cloneElement(icon, { className: `${active ? 'text-neon-green' : 'text-gray-400 group-hover:text-neon-blue'} transition-colors` })}
        </div>
        {/* <span className="text-[9px] font-bold mt-1 uppercase tracking-wider text-gray-500 group-hover:text-gray-300 transform scale-0 group-hover:scale-100 transition-transform absolute -bottom-4">{label}</span> */}
    </button>
);
