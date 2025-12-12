import React from 'react';
import { User, Territory } from '../../types';
import { calculateLevel } from '../../utils/starSystem';
import { Star, MapPin, TrendingUp, Award, X, LogOut, Lock, Users, Crown } from 'lucide-react';

interface ProfileScreenProps {
    user: User;
    territories: Territory[];
    totalDistance: number;
    totalStars: number;
    onClose: () => void;
    onLogout: () => void;
    onAdminAccess: () => void;
    onTerritoryClick?: (territoryId: string) => void;
    onShowLeaderboard: () => void;
    onViewTeam?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
    user,
    territories,
    totalDistance,
    totalStars,
    onClose,
    onLogout,
    onAdminAccess,
    onTerritoryClick,
    onShowLeaderboard,
    onViewTeam,
}) => {
    const [showAdminLogin, setShowAdminLogin] = React.useState(false);
    const [adminPassword, setAdminPassword] = React.useState('');

    const handleAdminLogin = () => {
        if (adminPassword === 'admin123') {
            onAdminAccess();
            setShowAdminLogin(false);
            setAdminPassword('');
        } else {
            alert('Senha incorreta!');
        }
    };

    const myTerritories = territories.filter(t => t.ownerId === user.id);
    const totalTerritories = myTerritories.length;
    const level = calculateLevel(totalStars);

    return (
        <div className="fixed inset-0 z-[10000] bg-zinc-950/98 backdrop-blur-xl text-white overflow-y-auto animate-in slide-in-from-bottom duration-300 font-sans">
            {/* Close Button */}
            {/* Close Button - Fixed Position explicitly high z-index */}
            <button
                onClick={onClose}
                className="fixed top-6 right-6 z-[20000] p-3 rounded-full bg-zinc-900 border-2 border-white/10 text-white hover:bg-zinc-800 hover:border-white/30 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all active:scale-95 flex items-center justify-center"
                aria-label="Fechar"
            >
                <X size={26} strokeWidth={2.5} />
            </button>

            {/* Header / Top Bar for Profile */}
            <div className="relative h-56 flex flex-col items-center justify-center p-6 border-b border-white/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-600/20 via-black to-black">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 bg-surface-dark border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors z-20"
                >
                    <X size={20} />
                </button>

                <div className="relative w-28 h-28 mb-4">
                    <div className="absolute inset-0 bg-gold-500 blur-xl opacity-30 rounded-full animate-pulse"></div>
                    <div className="w-full h-full rounded-full p-1 bg-gradient-to-br from-gold-300 to-gold-600 relative z-10">
                        <div className="w-full h-full rounded-full bg-black overflow-hidden border-4 border-black flex items-center justify-center">
                            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <Users size={40} className="text-gray-600" />}
                        </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-gold-500 to-yellow-600 w-10 h-10 rounded-full flex items-center justify-center border-4 border-black z-20 shadow-lg">
                        <Crown size={16} className="text-black" />
                    </div>
                </div>

                <h2 className="text-3xl font-black text-white tracking-wide mb-1">{user.name}</h2>
                <div className="flex items-center space-x-3 mt-1">
                    <span className="text-gold-400 font-bold text-sm flex items-center bg-gold-500/10 px-4 py-1.5 rounded-full border border-gold-500/20">
                        <Star size={12} className="mr-1.5 fill-gold-500" />
                        Nível {level}
                    </span>
                    <span className="text-gray-500 text-xs font-mono tracking-wider">MEMBRO DESDE {new Date().getFullYear()}</span>
                </div>
            </div>

            {/* Content Container */}
            <div className="relative px-4 -mt-8 z-20 pb-32 max-w-md mx-auto">

                {/* Actions Grid */}
                <div className="bg-surface-dark/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-4 mb-6 grid grid-cols-4 gap-2">
                    <div className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform group" onClick={() => setShowAdminLogin(!showAdminLogin)}>
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-all mb-2">
                            <Lock size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300">ADMIN</span>
                    </div>
                    <div className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform group" onClick={onShowLeaderboard}>
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white group-hover:bg-white/10 transition-all mb-2 border border-white/10">
                            <Award size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 group-hover:text-white">RANK</span>
                    </div>
                    {/* Team Icon - Only show for owners */}
                    {user.role === 'owner' && onViewTeam && (
                        <div className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform group" onClick={onViewTeam}>
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white group-hover:bg-white/10 transition-all mb-2 border border-white/10">
                                <Users size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 group-hover:text-white">EQUIPE</span>
                        </div>
                    )}
                    <div className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform group" onClick={onLogout}>
                        <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 group-hover:bg-red-500/20 transition-all mb-2 border border-red-500/20">
                            <LogOut size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 group-hover:text-red-500">SAIR</span>
                    </div>
                </div>

                {showAdminLogin && (
                    <div className="mb-6 p-4 bg-surface-dark/95 backdrop-blur-md rounded-xl flex animate-pulse border border-white/10 shadow-lg">
                        <input
                            type="password"
                            placeholder="Senha de acesso"
                            className="flex-1 bg-black/50 border border-gray-700 rounded-l-lg px-4 py-2 text-sm text-white outline-none focus:border-gold-500"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                        />
                        <button onClick={handleAdminLogin} className="bg-gold-500 text-black px-4 rounded-r-lg font-bold text-sm hover:bg-gold-400">ENTRAR</button>
                    </div>
                )}

                <div className="space-y-6">

                    {/* Stats Cards */}
                    <section>
                        <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2 px-1">
                            <TrendingUp size={14} className="text-gold-500" />
                            Performence
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-surface-dark/95 backdrop-blur-sm p-4 rounded-2xl border border-white/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gold-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                <span className="block text-3xl font-black text-white mb-1 group-hover:text-gold-400 transition-colors">{totalTerritories}</span>
                                <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Territórios</span>
                            </div>
                            <div className="bg-surface-dark/95 backdrop-blur-sm p-4 rounded-2xl border border-white/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                <span className="block text-3xl font-black text-white mb-1 group-hover:text-gold-400 transition-colors">{totalDistance.toFixed(1)}</span>
                                <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">KM Totais</span>
                            </div>
                        </div>
                    </section>

                    {/* Achievements */}
                    <section>
                        <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2 px-1">
                            <Award size={14} className="text-gold-500" />
                            Conquistas
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                            {[
                                { name: 'Iniciante', icon: '🏁', active: true },
                                { name: 'Explorador', icon: '🌍', active: totalTerritories >= 5 },
                                { name: 'Conquistador', icon: '👑', active: totalTerritories >= 10 },
                                { name: 'Lenda', icon: '🔥', active: level >= 10 },
                            ].map((ach, i) => (
                                <div key={i} className={`flex-shrink-0 w-24 h-28 rounded-xl flex flex-col items-center justify-center p-2 text-center border transition-all ${ach.active ? 'border-gold-500/30 bg-surface-dark/95 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)]' : 'border-dashed border-white/5 bg-white/5 opacity-50 grayscale'}`}>
                                    <span className="text-3xl mb-3 drop-shadow-md transform group-hover:scale-110 transition-transform">{ach.icon}</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-wide ${ach.active ? 'text-gold-400' : 'text-gray-600'}`}>{ach.name}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Territories List */}
                    <section className="pb-8">
                        <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2 px-1">
                            <MapPin size={14} className="text-gold-500" />
                            Meus Territórios
                        </h3>

                        <div className="space-y-3">
                            {myTerritories.map(t => (
                                <button
                                    key={t.id}
                                    className="w-full bg-surface-dark/95 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex items-center justify-between hover:border-gold-500/30 active:scale-[0.98] transition-all text-left group shadow-lg"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-black/50 border border-white/5 flex items-center justify-center text-lg shadow-inner">📍</div>
                                        <div>
                                            <h4 className="font-bold text-gray-200 group-hover:text-gold-400 transition-colors text-sm">{t.name}</h4>
                                            <span className="text-[10px] text-gray-500 font-mono tracking-wide">{new Date(t.conqueredAt).toLocaleDateString()} • {t.area}m²</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="font-black text-white group-hover:text-gold-400 transition-colors">{t.value}PTS</span>
                                        <span className="text-[9px] text-gray-600 uppercase font-bold tracking-wider mt-1">Ver Mapa</span>
                                    </div>
                                </button>
                            ))}
                            {myTerritories.length === 0 && (
                                <div className="text-center py-10 opacity-50 bg-surface-dark/95 backdrop-blur-sm rounded-xl border border-dashed border-white/10">
                                    <MapPin size={32} className="mx-auto mb-3 text-gray-600" />
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nenhum território<br />conquistado ainda.</p>
                                </div>
                            )}
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};
