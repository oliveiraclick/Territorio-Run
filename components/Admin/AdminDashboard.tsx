import React, { useState, useEffect } from 'react';
import { Users, Map, Activity, Search, X, ShieldCheck, Trophy, Calendar, MapPin } from 'lucide-react';
import { User, Territory } from '../../types';
import { fetchAllUsers, fetchAllTerritories } from '../../services/gameService';

interface AdminDashboardProps {
    onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [territories, setTerritories] = useState<Territory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [usersData, territoriesData] = await Promise.all([
                    fetchAllUsers(),
                    fetchAllTerritories()
                ]);
                setUsers(usersData);
                setTerritories(territoriesData);
            } catch (error) {
                console.error("Error loading admin data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Calculate Stats
    const totalUsers = users.length;
    const totalTerritories = territories.length;

    // Estimate total KM based on score (approx 10 points per km for example)
    // This is an ESTIMATE since we don't store raw distance in user profile yet
    const estimatedTotalKm = Math.floor(users.reduce((acc, user) => acc + user.score, 0) / 10);

    // Calculate Top 10 by Stars
    const topStars = [...users].sort((a, b) => b.score - a.score).slice(0, 10);

    // Calculate Top 10 by Territories
    const territoriesCount: Record<string, number> = {};
    territories.forEach(t => {
        if (t.ownerId) {
            territoriesCount[t.ownerId] = (territoriesCount[t.ownerId] || 0) + 1;
        }
    });

    const topTerritories = Object.keys(territoriesCount)
        .map(userId => {
            const user = users.find(u => u.id === userId);
            return {
                userId,
                name: user ? user.name : 'Desconhecido',
                count: territoriesCount[userId]
            };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    // Mock Cities/States (Since we don't have reverse geocoding on backend yet)
    // Assuming local usage for now
    const activeCities = 1;
    const activeStates = 1;

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
    );

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-gray-100 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                        <ShieldCheck size={24} className="text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-800">Painel Administrativo</h1>
                        <p className="text-xs text-gray-500 font-medium">Visão Geral do Sistema</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={24} className="text-gray-500" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {/* Total Users */}
                        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
                            <div className="flex justify-between items-start">
                                <div className="bg-blue-50 p-2 rounded-lg">
                                    <Users size={20} className="text-blue-500" />
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase">Usuários</span>
                            </div>
                            <h2 className="text-3xl font-black text-gray-800">{loading ? '...' : totalUsers}</h2>
                        </div>

                        {/* Total Territories */}
                        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
                            <div className="flex justify-between items-start">
                                <div className="bg-orange-50 p-2 rounded-lg">
                                    <Map size={20} className="text-orange-500" />
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase">Territórios</span>
                            </div>
                            <h2 className="text-3xl font-black text-gray-800">{loading ? '...' : totalTerritories}</h2>
                        </div>

                        {/* Total Km */}
                        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
                            <div className="flex justify-between items-start">
                                <div className="bg-green-50 p-2 rounded-lg">
                                    <Activity size={20} className="text-green-500" />
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase">Km Corridos</span>
                            </div>
                            <h2 className="text-3xl font-black text-gray-800">{loading ? '...' : estimatedTotalKm.toLocaleString()}</h2>
                        </div>

                        {/* Cities */}
                        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
                            <div className="flex justify-between items-start">
                                <div className="bg-purple-50 p-2 rounded-lg">
                                    <MapPin size={20} className="text-purple-500" />
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase">Cidades</span>
                            </div>
                            <h2 className="text-3xl font-black text-gray-800">{loading ? '...' : activeCities}</h2>
                        </div>

                        {/* States */}
                        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
                            <div className="flex justify-between items-start">
                                <div className="bg-yellow-50 p-2 rounded-lg">
                                    <MapPin size={20} className="text-yellow-500" />
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase">Estados</span>
                            </div>
                            <h2 className="text-3xl font-black text-gray-800">{loading ? '...' : activeStates}</h2>
                        </div>
                    </div>

                    {/* Rankings Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top 10 Stars */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Trophy size={20} className="text-yellow-500" />
                                    Top 10 - Estrelas
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">#</th>
                                            <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Usuário</th>
                                            <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-right">Estrelas</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {topStars.map((user, index) => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-bold text-gray-400">{index + 1}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-800">{user.name}</td>
                                                <td className="px-4 py-3 text-sm font-bold text-yellow-600 text-right">{user.score.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Top 10 Territories */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Map size={20} className="text-orange-500" />
                                    Top 10 - Territórios
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">#</th>
                                            <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Usuário</th>
                                            <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-right">Territórios</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {topTerritories.map((item, index) => (
                                            <tr key={item.userId} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-bold text-gray-400">{index + 1}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.name}</td>
                                                <td className="px-4 py-3 text-sm font-bold text-orange-600 text-right">{item.count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Users Table Section */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Users size={20} className="text-gray-500" />
                                Todos os Usuários
                            </h2>

                            {/* Search Bar */}
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome ou telefone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64 text-sm"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Usuário</th>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Telefone</th>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Pontuação</th>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Data Cadastro</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Carregando dados...</td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nenhum usuário encontrado.</td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-xs mr-3">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-gray-900">{user.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                    {user.phone}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        <Trophy size={12} className="mr-1" />
                                                        {user.score.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Calendar size={14} />
                                                        {formatDate(user.joinedAt)}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer / Pagination (Simplified) */}
                        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
                            <span>Mostrando {filteredUsers.length} de {totalUsers} usuários</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
