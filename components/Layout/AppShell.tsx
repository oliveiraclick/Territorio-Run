import React from 'react';
import { User, Menu, Trophy, Map, Users, Zap, LayoutDashboard } from 'lucide-react';

interface AppShellProps {
    children: React.ReactNode;
    user: { name: string; avatar?: string; teamId?: string; role?: string } | null;
    stars: number;
    onProfileClick: () => void;
    onMenuClick: () => void;
    onStartClick: () => void;
    onStopClick: () => void;
    isRunning: boolean;
    onTeamClick: () => void;
    onRankingClick: () => void;
    onHelpClick: () => void;
    navContent?: React.ReactNode;
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
    navContent
}) => {
    return (
        <div className="relative h-screen w-full overflow-hidden bg-dark-bg select-none touch-none font-sans flex flex-col">
            {/* --- TOP BAR (Clean Status) --- */}
            <div className="absolute top-0 left-0 right-0 pt-safe-top z-40 p-4 pointer-events-none flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent h-24">

                {/* Left: Star Counter (Clean Gold) */}
                <div className="pointer-events-auto bg-surface-dark/90 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 flex items-center space-x-2 shadow-lg">
                    <span className="text-gold-500 text-sm">⭐</span>
                    <span className="text-white font-black font-mono text-sm">{stars}</span>
                </div>

                {/* Right: Menu/Settings */}
                <div className="pointer-events-auto flex items-center gap-2">
                    {navContent}
                    <button
                        onClick={onMenuClick}
                        className="w-10 h-10 rounded-full bg-surface-dark/90 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-lg active:scale-90"
                    >
                        <Menu size={20} className="text-gray-400" />
                    </button>
                </div>
            </div>

            {/* --- MAIN CONTENT (MAP) --- */}
            <div className="flex-1 relative z-0">
                {children}
            </div>

            {/* --- BOTTOM NAVIGATION (Fixed Dock) --- */}
            <div className="z-50 bg-surface-dark/95 backdrop-blur-md border-t border-white/10 pb-safe-bottom shadow-lg">
                <div className="flex justify-around items-center px-2 py-2">
                    {/* 1. Map/Play */}
                    <NavButton
                        icon={<Map size={20} />}
                        label="Mapa"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        active={true}
                    />

                    {/* 2. Team */}
                    <NavButton
                        icon={<Users size={20} />}
                        label="Equipe"
                        onClick={onTeamClick}
                        active={false}
                    />

                    {/* 3. MAIN ACTION (Start Run) - Gold Center */}
                    <div className="relative -top-6">
                        <button
                            onClick={isRunning ? onStopClick : onStartClick}
                            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border-4 border-dark-bg transition-all transform active:scale-95 ${isRunning
                                ? 'bg-red-600 shadow-red-900/50'
                                : 'bg-gradient-to-br from-gold-400 to-gold-600 shadow-gold-500/30'
                                }`}
                        >
                            {isRunning ? (
                                <div className="w-6 h-6 bg-white rounded-md" />
                            ) : (
                                <Zap size={28} className="text-black fill-black" />
                            )}
                        </button>
                    </div>

                    {/* 4. Rank */}
                    <NavButton
                        icon={<Trophy size={20} />}
                        label="Rank"
                        onClick={onRankingClick}
                        active={false}
                    />

                    {/* 5. Profile (Me) */}
                    <NavButton
                        icon={<User size={20} />}
                        label="Perfil"
                        onClick={onProfileClick}
                        active={false}
                    />
                </div>
            </div>
        </div>
    );
};

const NavButton = ({ icon, label, onClick, active }: any) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-16 py-1 space-y-1 transition-colors ${active ? 'text-gold-400' : 'text-gray-500 hover:text-gray-300'
            }`}
    >
        {icon}
        <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </button>
);
