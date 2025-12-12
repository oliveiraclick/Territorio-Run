import React, { useState, useEffect } from 'react';
import { Users, Map, Activity, Search, X, ShieldCheck, Trophy, Calendar, MapPin, Trash2, AlertTriangle, Swords, Crown } from 'lucide-react';
import { User, Territory, Sponsor } from '../../types';
import { fetchAllUsers, fetchAllTerritories, deleteTerritory } from '../../services/gameService';
import { fetchSponsors, addSponsor, deleteSponsor } from '../../services/sponsorService';

interface AdminDashboardProps {
    onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [territories, setTerritories] = useState<Territory[]>([]);
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'territories' | 'battles' | 'map' | 'sponsors'>('overview');

    // New Sponsor Form State
    const [newSponsorName, setNewSponsorName] = useState('');
    const [newSponsorLat, setNewSponsorLat] = useState('');
    const [newSponsorLng, setNewSponsorLng] = useState('');
    const [newSponsorReward, setNewSponsorReward] = useState('50');
    const [newSponsorDiscount, setNewSponsorDiscount] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [usersData, territoriesData, sponsorsData] = await Promise.all([
                    fetchAllUsers(),
                    fetchAllTerritories(),
                    fetchSponsors()
                ]);
                setUsers(usersData);
                setTerritories(territoriesData);
                setSponsors(sponsorsData);
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

    const handleAddSponsor = async () => {
        if (!newSponsorName || !newSponsorLat || !newSponsorLng) {
            alert("Preencha nome e coordenadas");
            return;
        }

        try {
            const sponsor = await addSponsor({
                name: newSponsorName,
                coordinates: { lat: parseFloat(newSponsorLat), lng: parseFloat(newSponsorLng), timestamp: Date.now() },
                rewardStars: parseInt(newSponsorReward),
                discountMessage: newSponsorDiscount,
                qrCodeValue: `SPONSOR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            });

            setSponsors(prev => [...prev, sponsor]);
            setNewSponsorName('');
            setNewSponsorLat('');
            setNewSponsorLng('');
            setNewSponsorDiscount('');
            alert("Patrocinador adicionado!");
        } catch (e) {
            alert("Erro ao adicionar");
        }
    };

    const handleDeleteSponsor = async (id: string) => {
        if (window.confirm("Excluir patrocinador?")) {
            await deleteSponsor(id);
            setSponsors(prev => prev.filter(s => s.id !== id));
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
        return <div className="fixed inset-0 z-[9999] bg-dark-bg flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
        </div>;
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-dark-bg flex flex-col overflow-hidden font-sans text-white">
            {/* Header */}
            <div className="bg-surface-dark border-b border-white/5 px-6 py-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center space-x-3">
                    <div className="bg-gold-500/10 p-2 rounded-xl border border-gold-500/20">
                        <ShieldCheck size={24} className="text-gold-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-wide">PAINEL ADMINISTRATIVO</h1>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Visão Geral do Sistema</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex px-6 space-x-4 border-b border-white/5 bg-surface-dark/50">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-4 text-sm font-black uppercase tracking-wider border-b-2 transition-all ${activeTab === 'overview' ? 'border-gold-500 text-gold-500' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    Visão Geral
                </button>
                <button
                    onClick={() => setActiveTab('territories')}
                    className={`py-4 text-sm font-black uppercase tracking-wider border-b-2 transition-all ${activeTab === 'territories' ? 'border-gold-500 text-gold-500' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    Territórios
                </button>
                <button
                    onClick={() => setActiveTab('sponsors')}
                    className={`py-4 text-sm font-black uppercase tracking-wider border-b-2 transition-all ${activeTab === 'sponsors' ? 'border-gold-500 text-gold-500' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    Parceiros
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gold-500/20 scrollbar-track-transparent">
                {activeTab === 'overview' && (
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest">Atletas</h3>
                                    <Users className="text-gold-500" size={20} />
                                </div>
                                <div className="text-3xl font-black text-white relative z-10">{totalUsers}</div>
                                <div className="text-xs text-green-500 mt-1 font-bold relative z-10">+12% este mês</div>
                            </div>

                            <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest">Territórios</h3>
                                    <Map className="text-purple-400" size={20} />
                                </div>
                                <div className="text-3xl font-black text-white relative z-10">{totalTerritories}</div>
                                <div className="text-xs text-green-500 mt-1 font-bold relative z-10">+5 hoje</div>
                            </div>

                            <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest">Cidades</h3>
                                    <MapPin className="text-red-500" size={20} />
                                </div>
                                <div className="text-3xl font-black text-white relative z-10">1</div>
                                <div className="text-xs text-gray-500 mt-1 font-bold relative z-10">Expansão em breve</div>
                            </div>

                            <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest">Total Percorrido</h3>
                                    <Activity className="text-orange-500" size={20} />
                                </div>
                                <div className="text-3xl font-black text-white relative z-10">{estimatedTotalKm} <span className="text-sm text-gray-500">km</span></div>
                                <div className="text-xs text-green-500 mt-1 font-bold relative z-10">Estimado</div>
                            </div>
                        </div>

                        {/* Top Lists */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Top Stars */}
                            <div className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden">
                                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                                        <Trophy size={18} className="text-gold-500" />
                                        Ranking Geral
                                    </h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 border-b border-white/5">
                                            <tr>
                                                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Rank</th>
                                                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Atleta</th>
                                                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Estrelas</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {topStars.map((user, index) => (
                                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-sm text-gray-500">#{index + 1}</td>
                                                    <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                                                        {index === 0 && <Crown size={14} className="text-gold-500" />}
                                                        {user.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-black text-gold-500">{user.score} ★</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Top Territories */}
                            <div className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden">
                                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                                        <Map size={18} className="text-purple-400" />
                                        Maiores Conquistadores
                                    </h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 border-b border-white/5">
                                            <tr>
                                                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Rank</th>
                                                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Atleta</th>
                                                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Territórios</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {topTerritories.map((item, index) => (
                                                <tr key={item.userId} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-sm text-gray-500">#{index + 1}</td>
                                                    <td className="px-6 py-4 font-bold text-white">{item.name}</td>
                                                    <td className="px-6 py-4 text-right font-black text-purple-400">{item.count} 🚩</td>
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
                        <div className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden">
                            <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black/20">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                                    <Map size={18} className="text-gray-400" />
                                    Gerenciar Territórios
                                </h2>
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Buscar território ou dono..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-gold-500/50 text-white text-sm w-full md:w-64 placeholder-gray-600 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 border-b border-white/5">
                                        <tr>
                                            <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nome</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Dono Atual</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Data Conquista</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredTerritories.map((t) => (
                                            <tr key={t.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-bold text-white text-sm">{t.name}</div>
                                                    {t.description && <div className="text-xs text-gray-500 max-w-[200px] truncate">{t.description}</div>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                    <span className={t.ownerName ? 'text-white' : 'text-gray-600'}>
                                                        {t.ownerName || 'Sem dono'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                    {formatDate(t.conqueredAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <button
                                                        onClick={() => handleDeleteTerritory(t.id, t.name)}
                                                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                                        title="Excluir Território"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredTerritories.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 border-dashed border-white/5">
                                                    <MapPin size={32} className="mx-auto mb-3 opacity-20" />
                                                    <p className="text-xs uppercase font-bold tracking-wide">Nenhum território encontrado</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'sponsors' && (
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Form */}
                        <div className="bg-surface-dark rounded-2xl border border-white/5 p-6 h-fit">
                            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Activity size={20} className="text-gold-500" />
                                Adicionar Parceiro
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Nome da Empresa</label>
                                    <input
                                        type="text"
                                        value={newSponsorName}
                                        onChange={(e) => setNewSponsorName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-gold-500 outline-none"
                                        placeholder="Ex: Açaí do João"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Latitude</label>
                                        <input
                                            type="text"
                                            value={newSponsorLat}
                                            onChange={(e) => setNewSponsorLat(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-gold-500 outline-none"
                                            placeholder="-23.5505"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Longitude</label>
                                        <input
                                            type="text"
                                            value={newSponsorLng}
                                            onChange={(e) => setNewSponsorLng(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-gold-500 outline-none"
                                            placeholder="-46.6333"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Prêmio (Estrelas)</label>
                                    <input
                                        type="number"
                                        value={newSponsorReward}
                                        onChange={(e) => setNewSponsorReward(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-gold-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Mensagem de Desconto</label>
                                    <input
                                        type="text"
                                        value={newSponsorDiscount}
                                        onChange={(e) => setNewSponsorDiscount(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-gold-500 outline-none"
                                        placeholder="Ex: 10% OFF dia de semana"
                                    />
                                </div>
                                <button
                                    onClick={handleAddSponsor}
                                    className="w-full bg-gold-500 text-black font-black uppercase py-4 rounded-xl hover:bg-gold-400 transition-colors mt-4"
                                >
                                    Salvar Parceiro
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="lg:col-span-2 bg-surface-dark rounded-2xl border border-white/5 overflow-hidden">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                                <h2 className="text-lg font-bold text-white uppercase tracking-wide">Parceiros Cadastrados</h2>
                                <span className="bg-gold-500/20 text-gold-500 px-3 py-1 rounded-full text-xs font-bold">{sponsors.length}</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 border-b border-white/5">
                                        <tr>
                                            <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nome</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Prêmio</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Desconto</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {sponsors.map((s) => (
                                            <tr key={s.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-bold text-white">{s.name}</td>
                                                <td className="px-6 py-4 text-gold-500 font-bold">+{s.rewardStars} ⭐</td>
                                                <td className="px-6 py-4 text-gray-400 text-sm">{s.discountMessage || '-'}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteSponsor(s.id)}
                                                        className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {sponsors.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                                    Nenhum parceiro cadastrado.
                                                </td>
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
