import React from 'react';
import { User, Territory } from '../../types';
import { calculateLevel } from '../../utils/starSystem';
import { Star, MapPin, TrendingUp, Award, X, LogOut } from 'lucide-react';

interface ProfileScreenProps {
    user: User;
    territories: Territory[];
    totalDistance: number;
    totalStars: number;
    onClose: () => void;
    onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
    user,
    territories,
    totalDistance,
    totalStars,
    onClose,
    onLogout,
}) => {
    const myTerritories = territories.filter(t => t.ownerId === user.id);
    const totalTerritories = myTerritories.length;
    const territoriesLost = 0;
    const avgDistancePerTerritory = totalTerritories > 0
        ? (totalDistance / totalTerritories).toFixed(2)
        : '0.00';
    const level = calculateLevel(totalStars);

    const stats = [
        {
            icon: <TrendingUp className="text-blue-500" size={24} />,
            label: 'Distância Total',
            value: totalDistance.toFixed(2),
            unit: 'km',
            color: 'from-blue-500 to-cyan-400',
        },
        {
            icon: <MapPin className="text-orange-500" size={24} />,
            label: 'Territórios Conquistados',
            value: totalTerritories.toString(),
            unit: 'territórios',
            color: 'from-orange-500 to-red-400',
        },
        {
            icon: <Award className="text-purple-500" size={24} />,
            label: 'Média por Território',
            value: avgDistancePerTerritory,
            unit: 'km/território',
            color: 'from-purple-500 to-pink-500',
        },
        {
            icon: <Star className="text-yellow-500 fill-yellow-500" size={24} />,
            label: 'Estrelas Totais',
            value: totalStars.toString(),
            unit: 'estrelas',
            color: 'from-yellow-400 to-orange-400',
        },
    ];

    return (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-blue-500 p-6 flex items-center justify-between z-10 rounded-t-2xl">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
                            <span className="text-3xl font-black text-orange-500">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white">{user.name}</h1>
                            <div className="flex items-center space-x-2 mt-1">
                                <div className="flex items-center space-x-1 bg-white/20 px-2 py-0.5 rounded-full">
                                    <Star size={12} className="text-yellow-300 fill-yellow-300" />
                                    <span className="text-xs font-bold text-white">Nível {level}</span>
                                </div>
                                <span className="text-xs text-white/80">
                                    Membro desde {new Date(user.joinedAt).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6 bg-gradient-to-br from-orange-50 via-blue-50 to-cyan-50">

                    {/* Estatísticas Principais */}
                    <section>
                        <h2 className="text-xl font-black text-gray-800 mb-4">📊 Estatísticas</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                                            {stat.icon}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
                                    <div className="flex items-baseline space-x-2">
                                        <span className="text-3xl font-black text-gray-800">{stat.value}</span>
                                        <span className="text-sm text-gray-500">{stat.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Análise Detalhada */}
                    <section>
                        <h2 className="text-xl font-black text-blue-600 mb-4">📈 Análise Detalhada</h2>

                        <div className="space-y-3">
                            <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Taxa de Conquista</span>
                                    <span className="text-lg font-bold text-green-600">
                                        {totalTerritories > 0 ? '100%' : '0%'}
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-green-400"
                                        style={{ width: totalTerritories > 0 ? '100%' : '0%' }}
                                    />
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                    {totalTerritories} conquistados • {territoriesLost} perdidos
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                                <div className="text-sm text-gray-600 mb-2">Eficiência de Corrida</div>
                                <div className="text-2xl font-black text-gray-800 mb-1">
                                    {avgDistancePerTerritory} km
                                </div>
                                <div className="text-xs text-gray-500">
                                    Média de distância por território conquistado
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Territórios Recentes */}
                    <section>
                        <h2 className="text-xl font-black text-purple-600 mb-4">🗺️ Territórios Recentes</h2>

                        {myTerritories.length === 0 ? (
                            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
                                <MapPin size={48} className="text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">Nenhum território conquistado ainda</p>
                                <p className="text-sm text-gray-500 mt-1">Inicie uma corrida para conquistar seu primeiro território!</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {myTerritories
                                    .sort((a, b) => b.conqueredAt - a.conqueredAt)
                                    .slice(0, 10)
                                    .map((territory) => (
                                        <div
                                            key={territory.id}
                                            className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center justify-between"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: territory.color }}
                                                />
                                                <div>
                                                    <div className="font-bold text-gray-800 text-sm">{territory.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(territory.conqueredAt).toLocaleDateString('pt-BR')} às{' '}
                                                        {new Date(territory.conqueredAt).toLocaleTimeString('pt-BR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-orange-500">{territory.value} pts</div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </section>

                    {/* Conquistas */}
                    <section>
                        <h2 className="text-xl font-black text-yellow-600 mb-4">🏆 Conquistas</h2>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                                { name: 'Primeira Conquista', achieved: totalTerritories >= 1, icon: '🎯' },
                                { name: 'Explorador', achieved: totalTerritories >= 5, icon: '🗺️' },
                                { name: 'Maratonista', achieved: totalDistance >= 10, icon: '🏃' },
                                { name: 'Conquistador', achieved: totalTerritories >= 10, icon: '👑' },
                                { name: 'Estrela Cadente', achieved: totalStars >= 500, icon: '⭐' },
                                { name: 'Lenda', achieved: level >= 10, icon: '🔥' },
                            ].map((achievement, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg border ${achievement.achieved
                                            ? 'bg-yellow-50 border-yellow-300 shadow-sm'
                                            : 'bg-gray-50 border-gray-200 opacity-50'
                                        } text-center`}
                                >
                                    <div className="text-2xl mb-1">{achievement.icon}</div>
                                    <div className="text-xs font-bold text-gray-700">{achievement.name}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Botão de Logout */}
                    <button
                        onClick={onLogout}
                        className="w-full bg-red-50 hover:bg-red-500 text-red-600 hover:text-white font-bold py-4 rounded-xl border-2 border-red-500 transition-all flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
                    >
                        <LogOut size={20} />
                        <span>Sair da Conta</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
