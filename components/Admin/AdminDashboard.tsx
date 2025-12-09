import React, { useState, useEffect } from 'react';
import { Users, Map, Activity, Search, X, ShieldCheck, Trophy, Calendar, MapPin, Trash2, AlertTriangle, Swords } from 'lucide-react';
import { User, Territory } from '../../types';
import { fetchAllUsers, fetchAllTerritories, deleteTerritory } from '../../services/gameService';
// import { getAllBattles, forceEndBattle, deleteBattle } from '../../services/battleService'; // TODO: Implement if needed

interface AdminDashboardProps {
    onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [territories, setTerritories] = useState<Territory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'territories' | 'battles' | 'map'>('overview');

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

    // Handler for Deleting Territory
    const handleDeleteTerritory = async (id: string, name: string) => {
        if (window.confirm(`Tem certeza que deseja excluir o território "${name}"? Esta ação é irreversível.`)) {
            await deleteTerritory(id);
            setTerritories(prev => prev.filter(t => t.id !== id));
        }
    };

    // Calculate Stats
    const totalUsers = users.length;
    const totalTerritories = territories.length;
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

    // Filtered Lists
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
    );

    const filteredTerritories = territories.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        });
    };

    if (loading) {
        return <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>;
    }

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
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex px-6 space-x-4 border-b border-gray-200 bg-white">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Visão Geral
                </button>
                <button
                    onClick={() => setActiveTab('territories')}
                    className={`py-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'territories' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Territórios
                </button>
                {/* <button onClick={() => setActiveTab('battles')} ... /> */}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'overview' && (
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-500 font-bold text-sm uppercase">Atletas</h3>
                                    <Users className="text-blue-500" size={20} />
                                </div>
                                <div className="text-3xl font-black text-gray-800">{totalUsers}</div>
                                <div className="text-xs text-green-500 mt-1 font-bold">+12% este mês</div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-500 font-bold text-sm uppercase">Territórios</h3>
                                    <Map className="text-purple-500" size={20} />
                                </div>
                                <div className="text-3xl font-black text-gray-800">{totalTerritories}</div>
                                <div className="text-xs text-green-500 mt-1 font-bold">+5 hoje</div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-500 font-bold text-sm uppercase">Cidades</h3>
                                    <MapPin className="text-red-500" size={20} />
                                </div>
                                <div className="text-3xl font-black text-gray-800">1</div>
                                <div className="text-xs text-gray-400 mt-1 font-bold">Expansão em breve</div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-500 font-bold text-sm uppercase">Total Percorrido</h3>
                                    <Activity className="text-orange-500" size={20} />
                                </div>
                                <div className="text-3xl font-black text-gray-800">{estimatedTotalKm} <span className="text-sm text-gray-400">km</span></div>
                                <div className="text-xs text-green-500 mt-1 font-bold">Estimado</div>
                            </div>
                        </div>

                        {/* Top Lists */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Top Stars */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <Trophy size={20} className="text-yellow-500" />
                                        Ranking Geral (Estrelas)
                                    </h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Pos</th>
                                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Atleta</th>
                                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Estrelas</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {topStars.map((user, index) => (
                                                <tr key={user.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-mono text-sm text-gray-500">#{index + 1}</td>
                                                    <td className="px-6 py-4 font-bold text-gray-800">{user.name}</td>
                                                    <td className="px-6 py-4 text-right font-mono font-bold text-yellow-600">{user.score} ★</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Top Territories */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <Map size={20} className="text-purple-500" />
                                        Maiores Conquistadores
                                    </h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Pos</th>
                                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Atleta</th>
                                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Territórios</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {topTerritories.map((item, index) => (
                                                <tr key={item.userId} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-mono text-sm text-gray-500">#{index + 1}</td>
                                                    <td className="px-6 py-4 font-bold text-gray-800">{item.name}</td>
                                                    <td className="px-6 py-4 text-right font-mono font-bold text-purple-600">{item.count} 🚩</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'territories' && (
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Map size={20} className="text-gray-500" />
                                    Gerenciar Territórios
                                </h2>
                                <div className="relative">
                                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar território ou dono..."
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
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Nome</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Dono Atual</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Data Conquista</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredTerritories.map((t) => (
                                            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-bold text-gray-800">{t.name}</div>
                                                    {t.description && <div className="text-xs text-gray-400 max-w-[200px] truncate">{t.description}</div>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {t.ownerName || <span className="text-gray-400 italic">Sem dono</span>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(t.conqueredAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <button
                                                        onClick={() => handleDeleteTerritory(t.id, t.name)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                        title="Excluir Território"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredTerritories.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nenhum território encontrado.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
