import React from 'react';
import { User, Territory } from '../../types';
import { calculateLevel } from '../../utils/starSystem';
import { Star, MapPin, TrendingUp, Award, X, LogOut, Lock, History, Users } from 'lucide-react';

interface ProfileScreenProps {
    user: User;
    territories: Territory[];
    totalDistance: number;
    totalStars: number;
    onClose: () => void;
    onLogout: () => void;
    onAdminAccess: () => void;
    onTerritoryClick?: (territoryId: string) => void;
    onCreateTeam?: () => void;
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
    onCreateTeam,
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
        <div className="fixed inset-0 z-[10000] bg-dark-bg text-white overflow-y-auto animate-in slide-in-from-bottom duration-300 font-sans selection:bg-neon-green selection:text-black"> {/* Dark Background */}

            {/* Header / Top Bar for Profile */}
            <div className="relative h-48 bg-gradient-to-br from-black via-dark-bg to-gray-900 flex items-center justify-center p-6 rounded-b-[3rem] shadow-2xl z-10 border-b border-white/5">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors border border-white/10"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-r from-neon-green to-neon-blue shadow-[0_0_20px_rgba(57,255,20,0.3)] mb-3">
                        <div className="w-full h-full rounded-full bg-black overflow-hidden border-4 border-black flex items-center justify-center">
                            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <Users size={40} className="text-gray-600" />}
                        </div>
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-wide">{user.name}</h2>
                    <div className="flex items-center space-x-2 mt-1">
                        <span className="text-neon-green font-bold flex items-center text-sm bg-neon-green/10 px-3 py-1 rounded-full border border-neon-green/20">
                            <Star size={12} className="mr-1 fill-neon-green" />
                            Nível {level}
                        </span>
                        <span className="text-gray-600 text-xs">•</span>
                        <span className="text-gray-400 text-xs font-mono">Desde {new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="relative px-4 -mt-10 z-20 pb-20"> {/* Negative margin to pull up */}

                {/* Actions Grid */}
                <div className="bg-black/60 backdrop-blur-xl rounded-3xl shadow-xl p-4 mb-6 flex items-center justify-between border border-white/5">
                    <div className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform group" onClick={() => setShowAdminLogin(!showAdminLogin)}>
                        <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-gray-700 transition-all mb-1">
                            <Lock size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300">ADMIN</span>
                    </div>
                    <div className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform group" onClick={onCreateTeam}>
                        <div className="w-12 h-12 bg-neon-blue/10 rounded-2xl flex items-center justify-center text-neon-blue group-hover:bg-neon-blue/20 transition-all mb-1 border border-neon-blue/20">
                            <Users size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 group-hover:text-neon-blue">EQUIPE</span>
                    </div>
                    <div className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform group" onClick={onViewTeam}>
                        <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500/20 transition-all mb-1 border border-yellow-500/20">
                            <Award size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 group-hover:text-yellow-400">RANKING</span>
                    </div>
                    <div className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform group" onClick={onLogout}>
                        <div className="w-12 h-12 bg-neon-red/10 rounded-2xl flex items-center justify-center text-neon-red group-hover:bg-neon-red/20 transition-all mb-1 border border-neon-red/20">
                            <LogOut size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 group-hover:text-neon-red">SAIR</span>
                    </div>
                </div>

                {showAdminLogin && (
                    <div className="mb-6 p-4 bg-gray-900 rounded-xl flex animate-pulse border border-white/5">
                        <input
                            type="password"
                            placeholder="Senha de acesso"
                            className="flex-1 bg-black/50 border border-gray-700 rounded-l-lg px-4 py-2 text-sm text-white outline-none focus:border-neon-green"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                        />
                        <button onClick={handleAdminLogin} className="bg-neon-green text-black px-4 rounded-r-lg font-bold text-sm hover:bg-green-400">ENTRAR</button>
                    </div>
                )}

                <div className="space-y-6">

                    {/* Estatísticas Principais */}
                    <section>
                        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                            <TrendingUp size={20} className="text-neon-green" />
                            Estatísticas
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-900/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-neon-green/5 group-hover:bg-neon-green/10 transition-colors"></div>
                                <span className="text-3xl font-black text-white relative z-10">{totalTerritories}</span>
                                <span className="text-[10px] uppercase text-gray-500 font-bold mt-1 tracking-wider relative z-10">Territórios</span>
                            </div>
                            <div className="bg-gray-900/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                                <span className="text-3xl font-black text-white relative z-10">{totalDistance.toFixed(1)}</span>
                                <span className="text-[10px] uppercase text-gray-500 font-bold mt-1 tracking-wider relative z-10">KM Corridos</span>
                            </div>
                        </div>
                    </section>

                    {/* Achievements Scroll */}
                    <section>
                        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                            <Award size={20} className="text-yellow-400" />
                            Conquistas
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                            {[
                                { name: 'Iniciante', icon: '🏁', color: 'text-green-400', active: true },
                                { name: 'Explorador', icon: '🌍', color: 'text-blue-400', active: totalTerritories >= 5 },
                                { name: 'Conquistador', icon: '👑', color: 'text-orange-400', active: totalTerritories >= 10 },
                                { name: 'Lenda', icon: '🔥', color: 'text-red-400', active: level >= 10 },
                            ].map((ach, i) => (
                                <div key={i} className={`flex-shrink-0 w-28 h-32 rounded-2xl flex flex-col items-center justify-center p-2 text-center border ${ach.active ? 'border-white/10 bg-gray-900/80' : 'border-dashed border-gray-800 bg-gray-900/30 opacity-40 grayscale'} transition-all`}>
                                    <span className="text-4xl mb-2 drop-shadow-lg">{ach.icon}</span>
                                    <span className={`text-xs font-bold leading-tight ${ach.active ? 'text-gray-200' : 'text-gray-600'}`}>{ach.name}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Territórios Lista */}
                    <section className="pb-32">
                        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                            <MapPin size={20} className="text-orange-500" />
                            Meus Territórios
                        </h3>

                        <div className="space-y-3">
                            {myTerritories.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => onTerritoryClick && onTerritoryClick(t.id)}
                                    className="w-full bg-gray-900/50 p-4 rounded-xl border border-white/5 flex items-center justify-between hover:bg-gray-800 active:scale-95 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-lg shadow-inner">📍</div>
                                        <div>
                                            <h4 className="font-bold text-gray-200 group-hover:text-neon-green transition-colors">{t.name}</h4>
                                            <span className="text-xs text-gray-500 font-mono">{new Date(t.conqueredAt).toLocaleDateString()} • {t.area}m²</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="font-black text-orange-500">{t.value} ⭐</span>
                                        <span className="text-[10px] text-gray-600 group-hover:text-gray-400">VER MAPA</span>
                                    </div>
                                </button>
                            ))}
                            {myTerritories.length === 0 && (
                                <div className="text-center py-8 opacity-50 border-2 border-dashed border-gray-800 rounded-xl">
                                    <MapPin size={32} className="mx-auto mb-2 text-gray-600" />
                                    <p className="text-sm font-bold text-gray-500">Nenhum território conquistado.</p>
                                </div>
                            )}
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};
