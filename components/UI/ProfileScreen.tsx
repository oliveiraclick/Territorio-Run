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
        <div className="fixed inset-0 z-[10000] bg-white text-gray-900 overflow-y-auto animate-in slide-in-from-bottom duration-300"> {/* FORCE TOP VISIBILITY */}

            {/* Header / Top Bar for Profile */}
            <div className="relative h-48 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6 rounded-b-[3rem] shadow-xl z-10 transition-all">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-r from-orange-500 to-blue-500 shadow-2xl mb-3">
                        <div className="w-full h-full rounded-full bg-gray-900 overflow-hidden border-4 border-gray-900 flex items-center justify-center">
                            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <Users size={40} className="text-gray-400" />}
                        </div>
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-wide">{user.name}</h2>
                    <div className="flex items-center space-x-2 mt-1">
                        <span className="text-yellow-400 font-bold flex items-center text-sm"><Star size={14} className="mr-1 fill-yellow-400" /> Nível {level}</span>
                        <span className="text-gray-500 text-xs">•</span>
                        <span className="text-gray-400 text-xs">Membro desde {new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="relative px-4 -mt-10 z-20 pb-20"> {/* Negative margin to pull up */}

                {/* Actions Grid */}
                <div className="bg-white rounded-3xl shadow-xl p-4 mb-6 flex items-center justify-between border border-gray-100">
                    <div className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform" onClick={() => setShowAdminLogin(!showAdminLogin)}>
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-600 mb-1">
                            <Lock size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500">ADMIN</span>
                    </div>
                    <div className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform" onClick={onCreateTeam}>
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-1">
                            <Users size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500">EQUIPE</span>
                    </div>
                    <div className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform" onClick={onViewTeam}>
                        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-1">
                            <Award size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500">RANKING</span>
                    </div>
                    <div className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform" onClick={onLogout}>
                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-1">
                            <LogOut size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500">SAIR</span>
                    </div>
                </div>

                {showAdminLogin && (
                    <div className="mb-6 p-4 bg-gray-100 rounded-xl flex animate-pulse">
                        <input
                            type="password"
                            placeholder="Senha de acesso"
                            className="flex-1 bg-white border border-gray-200 rounded-l-lg px-4 py-2 text-sm outline-none"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                        />
                        <button onClick={handleAdminLogin} className="bg-orange-500 text-white px-4 rounded-r-lg font-bold text-sm">ENTRAR</button>
                    </div>
                )}

                <div className="space-y-6">

                    {/* Estatísticas Principais */}
                    <section>
                        <h3 className="text-gray-800 font-bold text-lg mb-4 flex items-center gap-2">
                            <TrendingUp size={20} className="text-blue-500" />
                            Estatísticas
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-gray-800">{totalTerritories}</span>
                                <span className="text-xs uppercase text-gray-400 font-bold mt-1">Territórios</span>
                            </div>
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-gray-800">{totalDistance.toFixed(1)}</span>
                                <span className="text-xs uppercase text-gray-400 font-bold mt-1">KM Corridos</span>
                            </div>
                        </div>
                    </section>

                    {/* Achievements Scroll */}
                    <section>
                        <h3 className="text-gray-800 font-bold text-lg mb-4 flex items-center gap-2">
                            <Award size={20} className="text-yellow-500" />
                            Conquistas
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                            {[
                                { name: 'Iniciante', icon: '🏁', color: 'bg-green-100 text-green-600', active: true },
                                { name: 'Explorador', icon: '🌍', color: 'bg-blue-100 text-blue-600', active: totalTerritories >= 5 },
                                { name: 'Conquistador', icon: '👑', color: 'bg-orange-100 text-orange-600', active: totalTerritories >= 10 },
                                { name: 'Lenda', icon: '🔥', color: 'bg-red-100 text-red-600', active: level >= 10 },
                            ].map((ach, i) => (
                                <div key={i} className={`flex-shrink-0 w-28 h-32 rounded-2xl flex flex-col items-center justify-center p-2 text-center border-2 ${ach.active ? 'border-transparent ' + ach.color : 'border-gray-100 bg-gray-50 opacity-40 grayscale'}`}>
                                    <span className="text-4xl mb-2">{ach.icon}</span>
                                    <span className="text-xs font-bold leading-tight">{ach.name}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Territórios Lista */}
                    <section className="pb-20">
                        <h3 className="text-gray-800 font-bold text-lg mb-4 flex items-center gap-2">
                            <MapPin size={20} className="text-orange-500" />
                            Meus Territórios
                        </h3>

                        <div className="space-y-3">
                            {myTerritories.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => onTerritoryClick && onTerritoryClick(t.id)}
                                    className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 active:scale-95 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">📍</div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 group-hover:text-orange-500 transition-colors">{t.name}</h4>
                                            <span className="text-xs text-gray-400">{new Date(t.conqueredAt).toLocaleDateString()} • {t.area}m²</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="font-black text-orange-500">{t.value} ⭐</span>
                                        <span className="text-[10px] text-gray-300">VER NO MAPA</span>
                                    </div>
                                </button>
                            ))}
                            {myTerritories.length === 0 && (
                                <div className="text-center py-8 opacity-50 border-2 border-dashed border-gray-200 rounded-xl">
                                    <MapPin size={32} className="mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm font-bold text-gray-400">Nenhum território conquistado.</p>
                                </div>
                            )}
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};
