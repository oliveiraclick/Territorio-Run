import React from 'react';
import { User, Territory } from '../../types';
import { calculateLevel } from '../../utils/starSystem';
import { Star, MapPin, TrendingUp, Award, X, LogOut, Lock, Users, Crown, RefreshCw } from 'lucide-react';

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
        <div className="fixed inset-0 z-[10000] bg-gradient-to-br from-zinc-950 via-black to-zinc-900 text-white overflow-y-auto animate-in slide-in-from-bottom duration-300 font-sans">

            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Close Button */}
            <button
                onClick={onClose}
                className="fixed top-6 right-6 z-[20000] p-3 rounded-full bg-red-600/90 border-2 border-white/20 text-white shadow-2xl flex items-center justify-center active:scale-90 transition-transform"
                aria-label="Fechar"
            >
                <X size={28} strokeWidth={3} />
            </button>

            {/* Content */}
            <div className="relative z-10 w-full px-6 py-12 max-w-lg mx-auto">

                {/* Header / Player Card */}
                <div className="relative mb-8 text-center">
                    {/* Avatar */}
                    <div className="relative w-32 h-32 mx-auto mb-4">
                        <div className="absolute inset-0 bg-gold-500 blur-2xl opacity-40 rounded-full animate-pulse"></div>
                        <div className="w-full h-full rounded-full p-1 bg-gradient-to-br from-gold-400 to-gold-600 relative z-10">
                            <div className="w-full h-full rounded-full bg-black overflow-hidden border-4 border-black flex items-center justify-center">
                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" /> : <Users size={48} className="text-gray-600" />}
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-gold-500 to-yellow-600 w-12 h-12 rounded-full flex items-center justify-center border-4 border-black z-20 shadow-lg">
                            <Crown size={20} className="text-black" />
                        </div>
                    </div>

                    {/* Name & Level */}
                    <h2 className="text-4xl font-black text-white tracking-tight mb-2">{user.name}</h2>
                    <div className="flex items-center justify-center space-x-3">
                        <span className="text-gold-400 font-bold text-sm flex items-center bg-gold-500/10 px-4 py-1.5 rounded-full border border-gold-500/30 backdrop-blur-sm">
                            <Star size={14} className="mr-1.5 fill-gold-500" />
                            Nível {level}
                        </span>
                        <span className="text-gray-500 text-xs font-mono tracking-wider">MEMBRO {new Date().getFullYear()}</span>
                    </div>
                </div>

                {/* Stats Cards - Horizontal Scroll */}
                <div className="mb-8">
                    <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                        <TrendingUp size={14} className="text-gold-500" />
                        Performance
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory">
                        {/* Stars */}
                        <div className="flex-shrink-0 w-40 bg-gradient-to-br from-gold-500/10 to-gold-600/5 backdrop-blur-sm p-5 rounded-2xl border border-gold-500/20 snap-center shadow-lg">
                            <Star className="text-gold-400 mb-2" size={24} />
                            <span className="block text-4xl font-black text-white mb-1">{totalStars}</span>
                            <span className="text-xs uppercase text-gray-400 font-bold tracking-wider">Estrelas</span>
                        </div>
                        {/* Territories */}
                        <div className="flex-shrink-0 w-40 bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10 snap-center shadow-lg">
                            <MapPin className="text-blue-400 mb-2" size={24} />
                            <span className="block text-4xl font-black text-white mb-1">{totalTerritories}</span>
                            <span className="text-xs uppercase text-gray-400 font-bold tracking-wider">Territórios</span>
                        </div>
                        {/* Distance */}
                        <div className="flex-shrink-0 w-40 bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10 snap-center shadow-lg">
                            <TrendingUp className="text-green-400 mb-2" size={24} />
                            <span className="block text-4xl font-black text-white mb-1">{totalDistance.toFixed(1)}</span>
                            <span className="text-xs uppercase text-gray-400 font-bold tracking-wider">KM Totais</span>
                        </div>
                    </div>
                </div>

                {/* Actions Grid */}
                <div className="mb-8">
                    <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Award size={14} className="text-gold-500" />
                        Ações
                    </h3>
                    <div className="grid grid-cols-4 gap-3">
                        <button onClick={() => setShowAdminLogin(!showAdminLogin)} className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform group">
                            <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-all mb-2 border border-white/10">
                                <Lock size={22} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300">ADMIN</span>
                        </button>
                        <button onClick={onShowLeaderboard} className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform group">
                            <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center text-white group-hover:bg-white/10 transition-all mb-2 border border-white/10">
                                <Award size={22} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 group-hover:text-white">RANK</span>
                        </button>
                        {user.role === 'owner' && onViewTeam && (
                            <button onClick={onViewTeam} className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform group">
                                <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center text-white group-hover:bg-white/10 transition-all mb-2 border border-white/10">
                                    <Users size={22} />
                                </div>
                                <span className="text-[10px] font-bold text-gray-500 group-hover:text-white">EQUIPE</span>
                            </button>
                        )}
                        <button onClick={onLogout} className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform group">
                            <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 group-hover:bg-red-500/20 transition-all mb-2 border border-red-500/20">
                                <LogOut size={22} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 group-hover:text-red-500">SAIR</span>
                        </button>
                    </div>
                </div>

                {/* Admin Login */}
                {showAdminLogin && (
                    <div className="mb-6 p-4 bg-white/5 backdrop-blur-md rounded-xl flex animate-in slide-in-from-top border border-white/10 shadow-lg">
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

                {/* Territories List */}
                <div className="mb-8">
                    <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                        <MapPin size={14} className="text-gold-500" />
                        Meus Territórios ({totalTerritories})
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {myTerritories.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-8">Nenhum território conquistado ainda.</p>
                        ) : (
                            myTerritories.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => onTerritoryClick?.(t.id)}
                                    className="w-full bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex items-center justify-between hover:border-gold-500/30 active:scale-[0.98] transition-all text-left group shadow-lg"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-black/50 border border-white/5 flex items-center justify-center text-lg shadow-inner">📍</div>
                                        <div>
                                            <h4 className="font-bold text-gray-200 group-hover:text-gold-400 transition-colors text-sm">{t.name}</h4>
                                            <span className="text-[10px] text-gray-500 font-mono tracking-wide">{new Date(t.conqueredAt).toLocaleDateString()} • {t.area}m²</span>
                                        </div>
                                    </div>
                                    <Star className="text-gold-500 fill-gold-500" size={16} />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Force Update Button */}
                <div className="text-center pb-8 border-t border-white/10 pt-6">
                    <p className="text-gray-600 text-[10px] uppercase tracking-widest mb-3 font-mono">Versão 1.2.0</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wide transition-colors border border-white/10 flex items-center gap-2 mx-auto"
                    >
                        <RefreshCw size={14} />
                        Forçar Atualização
                    </button>
                </div>

            </div>
        </div>
    );
};
