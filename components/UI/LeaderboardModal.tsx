import React, { useState, useEffect } from 'react';
import { X, Trophy, MapPin, Globe, Search } from 'lucide-react';
import { User, Territory, Coordinate } from '../../types';
import { fetchAllUsers, updateUser } from '../../services/gameService';
import { getNeighborhood } from '../../utils/geoUtils';

interface LeaderboardModalProps {
    onClose: () => void;
    currentUser: User | null;
    territories: Territory[];
    userLocation: Coordinate | null;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose, currentUser, territories, userLocation }) => {
    const [filter, setFilter] = useState<'br' | 'neighborhood'>('br');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentNeighborhood, setCurrentNeighborhood] = useState<string>("Desconhecido");

    useEffect(() => {
        const loadRankings = async () => {
            setLoading(true);
            try {
                const allUsers = await fetchAllUsers();

                let filteredUsers = allUsers;

                if (filter === 'neighborhood') {
                    // 1. Detect neighborhood if not already known
                    let targetNeighborhood = currentNeighborhood;
                    if (targetNeighborhood === "Desconhecido" && userLocation) {
                        const detected = await getNeighborhood(userLocation.lat, userLocation.lng);
                        if (detected) {
                            targetNeighborhood = detected;
                            setCurrentNeighborhood(detected);

                            // Save to profile if logged in and not set
                            if (currentUser && !currentUser.neighborhood) {
                                await updateUser(currentUser.id, { neighborhood: detected });
                            }
                        }
                    }

                    if (targetNeighborhood !== "Desconhecido") {
                        // 2. Filter users who belong to this neighborhood
                        filteredUsers = allUsers.filter(u => u.neighborhood === targetNeighborhood);

                        // Fallback: If no users found with that neighborhood set, try the old territory-based method
                        // This helps during migration period where users haven't updated their profiles yet
                        if (filteredUsers.length === 0) {
                            const localOwnerIds = new Set(
                                territories
                                    .filter(t => t.neighborhood === targetNeighborhood)
                                    .map(t => t.ownerId)
                            );
                            filteredUsers = allUsers.filter(u => localOwnerIds.has(u.id));
                        }
                    } else {
                        // If we can't detect neighborhood, maybe show nothing or keep all? 
                        // Showing nothing with a message is better.
                        filteredUsers = [];
                    }
                }

                // Sorting by score (stars) desc
                const sorted = filteredUsers.sort((a, b) => b.score - a.score);

                // Limit display
                setUsers(sorted.slice(0, 50));
            } catch (error) {
                console.error("Error loading leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        loadRankings();
    }, [filter, territories, userLocation]); // Re-run if filter or location changes

    return (
        <div className="fixed inset-0 z-[10001] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-surface-dark w-full max-w-md h-[80vh] rounded-3xl border border-white/5 flex flex-col relative overflow-hidden shadow-2xl">

                {/* Header with Glossy Effect */}
                <div className="relative p-6 pb-8 bg-gradient-to-b from-surface-light/5 to-transparent border-b border-white/5 shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex flex-col items-center">
                        <Trophy size={40} className="text-gold-500 mb-2 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                        <h2 className="text-2xl font-black text-white tracking-wide uppercase italic">
                            Top Conquistadores
                        </h2>
                        <p className="text-xs text-gold-500 font-bold tracking-widest uppercase">
                            {filter === 'br' ? 'Ranking Global' : `Ranking ${currentNeighborhood}`}
                        </p>
                    </div>

                    {/* Filter Toggle */}
                    <div className="flex mt-6 bg-black/40 p-1 rounded-xl border border-white/5 relative">
                        <button
                            onClick={() => setFilter('br')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${filter === 'br' ? 'bg-gold-500 text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Globe size={14} /> Global
                        </button>
                        <button
                            onClick={() => setFilter('neighborhood')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${filter === 'neighborhood' ? 'bg-gold-500 text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <MapPin size={14} /> Meu Bairro
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 relative">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-10 opacity-50">
                            <Search size={32} className="mx-auto mb-2" />
                            <p className="text-xs">
                                {filter === 'neighborhood' && currentNeighborhood === 'Desconhecido'
                                    ? "Não foi possível detectar seu bairro. Verifique seu GPS."
                                    : "Nenhum conquistador nesta região ainda."}
                            </p>
                        </div>
                    ) : (
                        users.map((u, index) => (
                            <div
                                key={u.id}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${u.id === currentUser?.id
                                    ? 'bg-gold-500/10 border-gold-500/50 shadow-[0_0_10px_rgba(234,179,8,0.1)]'
                                    : 'bg-surface-dark border-white/5 hover:border-white/10'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm italic ${index === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-black shadow-lg' :
                                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black shadow-lg' :
                                            index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-black shadow-lg' :
                                                'bg-white/5 text-gray-500'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className={`text-sm font-bold ${u.id === currentUser?.id ? 'text-gold-500' : 'text-white'}`}>
                                            {u.name} {u.id === currentUser?.id && '(Você)'}
                                        </div>
                                        {/* Neighborhood is dynamic, so we just show Role or Level here probably */}
                                        <div className="text-[10px] text-gray-500 font-mono">
                                            {u.neighborhood || 'Nômade'} • Nível {Math.floor(Math.sqrt(u.score / 100)) + 1}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-black text-sm">{u.score}</div>
                                    <div className="text-[8px] text-gold-500 uppercase font-bold tracking-wider">Estrelas</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* User's own rank sticky footer if not in view (optional enhancement for later) */}
                {currentUser && !users.find(u => u.id === currentUser.id) && users.length > 0 && (
                    <div className="p-4 bg-surface-dark border-t border-white/10 shrink-0">
                        <div className="flex items-center justify-between opacity-50">
                            <span className="text-xs text-gray-500">Você não está no Top 50... ainda.</span>
                            <span className="text-xs font-bold text-white">{currentUser.score} ⭐</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
