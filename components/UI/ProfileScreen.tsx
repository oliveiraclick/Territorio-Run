import React from 'react';
import { User, Territory } from '../../types';
import { calculateLevel } from '../../utils/starSystem';
import { Star, MapPin, TrendingUp, Award, X, LogOut, Lock, Users, Crown, RefreshCw, Zap } from 'lucide-react';

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
    onShowLeaderboard: () => void;
    onViewTeam?: () => void;
    isStravaConnected?: boolean;
    onConnectStrava?: () => void;
    onSyncStrava?: () => void;
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
    isStravaConnected = false,
    onConnectStrava,
    onSyncStrava
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
        <div className="fixed inset-0 z-[10000] bg-black text-white overflow-y-auto font-sans">

            {/* Subtle Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-black to-black opacity-50"></div>

            {/* Close Button */}
            <button
                onClick={onClose}
                className="fixed top-6 right-6 z-[20000] p-3 rounded-full bg-red-600/90 border-2 border-white/20 text-white shadow-2xl flex items-center justify-center active:scale-90 transition-transform"
                aria-label="Fechar"
            >
                <X size={28} strokeWidth={3} />
            </button>

            {/* Content */}
            <div className="relative z-10 w-full px-5 py-8 max-w-md mx-auto">

                {/* Header - Compact */}
                <div className="text-center mb-6">
                    {/* Avatar */}
                    <div className="relative w-20 h-20 mx-auto mb-3">
                        <div className="w-full h-full rounded-full p-0.5 bg-gradient-to-br from-gold-400 to-gold-600">
                            <div className="w-full h-full rounded-full bg-black overflow-hidden border-2 border-black flex items-center justify-center">
                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" /> : <Users size={32} className="text-gray-600" />}
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-gold-500 to-yellow-600 w-8 h-8 rounded-full flex items-center justify-center border-2 border-black shadow-lg">
                            <Crown size={14} className="text-black" />
                        </div>
                    </div>

                    {/* Name & Level */}
                    <h2 className="text-2xl font-black text-white mb-1">{user.name}</h2>
                    <div className="inline-flex items-center bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/30">
                        <Star size={12} className="mr-1 fill-gold-500 text-gold-500" />
                        <span className="text-gold-400 font-bold text-xs">Nível {level}</span>
                    </div>
                </div>

                {/* Stats Grid 2x2 */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    {/* Stars */}
                    <div className="bg-gradient-to-br from-gold-500/15 to-gold-600/5 backdrop-blur-sm p-4 rounded-xl border border-gold-500/30 text-center">
                        <Star className="text-gold-400 mx-auto mb-1" size={20} />
                        <div className="text-3xl font-black text-white mb-0.5">{totalStars}</div>
                        <div className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Estrelas</div>
                    </div>

                    {/* Territories */}
                    <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 text-center">
                        <MapPin className="text-blue-400 mx-auto mb-1" size={20} />
                        <div className="text-3xl font-black text-white mb-0.5">{totalTerritories}</div>
                        <div className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Territórios</div>
                    </div>

                    {/* Distance */}
                    <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 text-center">
                        <TrendingUp className="text-green-400 mx-auto mb-1" size={20} />
                        <div className="text-3xl font-black text-white mb-0.5">{totalDistance.toFixed(1)}</div>
                        <div className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">KM Totais</div>
                    </div>

                    {/* Level (repeated for symmetry) */}
                    <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 text-center">
                        <Award className="text-purple-400 mx-auto mb-1" size={20} />
                        <div className="text-3xl font-black text-white mb-0.5">{level}</div>
                        <div className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Nível</div>
                    </div>
                </div>


                {/* FORCE UPDATE BUTTON - HIGHLIGHTED */}
                <button
                    onClick={() => window.location.reload()}
                    className="w-full mb-6 bg-white hover:bg-gray-100 text-black font-black text-sm py-4 rounded-xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 border-2 border-white/20"
                >
                    <RefreshCw size={18} className="animate-spin-slow" />
                    FORÇAR ATUALIZAÇÃO DO APP
                    <Zap size={16} className="fill-black" />
                </button>

                {/* Actions Grid */}
                <div className="mb-6">
                    <h3 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-3">Ações Rápidas</h3>
                    <div className="grid grid-cols-4 gap-2">
                        <button onClick={() => setShowAdminLogin(!showAdminLogin)} className="flex flex-col items-center active:scale-95 transition-transform group">
                            <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-all mb-1.5 border border-white/10">
                                <Lock size={18} />
                            </div>
                            <span className="text-[9px] font-bold text-gray-500 group-hover:text-gray-300">ADMIN</span>
                        </button>
                        <button onClick={onShowLeaderboard} className="flex flex-col items-center active:scale-95 transition-transform group">
                            <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-white group-hover:bg-white/10 transition-all mb-1.5 border border-white/10">
                                <Award size={18} />
                            </div>
                            <span className="text-[9px] font-bold text-gray-500 group-hover:text-white">RANK</span>
                        </button>
                        {user.role === 'owner' && onViewTeam && (
                            <button onClick={onViewTeam} className="flex flex-col items-center active:scale-95 transition-transform group">
                                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-white group-hover:bg-white/10 transition-all mb-1.5 border border-white/10">
                                    <Users size={18} />
                                </div>
                                <span className="text-[9px] font-bold text-gray-500 group-hover:text-white">EQUIPE</span>
                            </button>
                        )}
                        <button onClick={onLogout} className="flex flex-col items-center active:scale-95 transition-transform group">
                            <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500 group-hover:bg-red-500/20 transition-all mb-1.5 border border-red-500/20">
                                <LogOut size={18} />
                            </div>
                            <span className="text-[9px] font-bold text-gray-500 group-hover:text-red-500">SAIR</span>
                        </button>
                    </div>
                </div>

                {/* Admin Login */}
                {showAdminLogin && (
                    <div className="mb-5 p-3 bg-white/5 backdrop-blur-md rounded-xl flex gap-2 animate-in slide-in-from-top border border-white/10">
                        <input
                            type="password"
                            placeholder="Senha de acesso"
                            className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gold-500"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                        />
                        <button onClick={handleAdminLogin} className="bg-gold-500 text-black px-4 rounded-lg font-bold text-sm hover:bg-gold-400">ENTRAR</button>
                    </div>
                )}

                {/* Territories List */}
                <div className="mb-6">
                    <h3 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <MapPin size={12} className="text-gold-500" />
                        Meus Territórios ({totalTerritories})
                    </h3>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                        {myTerritories.length === 0 ? (
                            <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                                <MapPin size={32} className="text-gray-600 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">Nenhum território conquistado</p>
                            </div>
                        ) : (
                            myTerritories.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => onTerritoryClick?.(t.id)}
                                    className="w-full bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10 flex items-center justify-between hover:border-gold-500/40 hover:bg-white/10 active:scale-[0.98] transition-all text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-black/50 border border-white/5 flex items-center justify-center text-base">📍</div>
                                        <div>
                                            <h4 className="font-bold text-gray-200 group-hover:text-gold-400 transition-colors text-sm leading-tight">{t.name}</h4>
                                            <span className="text-[9px] text-gray-500 font-mono">{new Date(t.conqueredAt).toLocaleDateString()} • {t.area}m²</span>
                                        </div>
                                    </div>
                                    <Star className="text-gold-500 fill-gold-500 flex-shrink-0" size={14} />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Version Footer */}
                <div className="text-center pt-4 border-t border-white/10">
                    <p className="text-gray-600 text-[9px] uppercase tracking-widest font-mono">Versão 1.3.0</p>
                </div>

            </div>
        </div>
    );
};
