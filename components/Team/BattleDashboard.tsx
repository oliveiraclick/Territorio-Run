import React, { useEffect, useState } from 'react';
import { Battle, Team } from '../../types';
import { getTeamBattles } from '../../services/battleService';
import { Swords, Trophy, Clock, Skull, ShieldAlert } from 'lucide-react';

interface BattleDashboardProps {
    team: Team;
}

const BattleDashboard: React.FC<BattleDashboardProps> = ({ team }) => {
    const [battles, setBattles] = useState<Battle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBattles = async () => {
            const data = await getTeamBattles(team.id);
            setBattles(data);
            setLoading(false);
        };
        loadBattles();
        // Polling para atualizações ao vivo
        const interval = setInterval(loadBattles, 10000);
        return () => clearInterval(interval);
    }, [team.id]);

    const calculateProgress = (scoreA: number, scoreB: number) => {
        const total = scoreA + scoreB;
        if (total === 0) return 50;
        return (scoreA / total) * 100;
    };

    const formatTimeLeft = (endTime: number) => {
        const diff = endTime - Date.now();
        if (diff <= 0) return 'Finalizado';
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    };

    if (loading) return <div className="text-white text-center py-4">Carregando guerras...</div>;

    if (battles.length === 0) {
        return (
            <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
                <ShieldAlert className="text-gray-600 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-300">Tempo de Paz</h3>
                <p className="text-gray-500 mt-2">Nenhuma guerra ativa no momento.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {battles.map(battle => {
                const isChallenger = battle.challengerTeamId === team.id;
                const myScore = isChallenger ? battle.scoreChallenger : battle.scoreTarget;
                const enemyScore = isChallenger ? battle.scoreTarget : battle.scoreChallenger;
                const enemyName = isChallenger ? battle.targetTeamName : battle.challengerTeamName;
                const progress = calculateProgress(myScore, enemyScore);
                const winning = myScore > enemyScore;

                return (
                    <div key={battle.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 relative">
                        {/* Status Bar */}
                        <div className="bg-black/40 px-4 py-2 flex justify-between items-center text-xs font-bold text-gray-400">
                            <span className="flex items-center gap-1"><Clock size={12} /> RESTAM {formatTimeLeft(battle.endDate)}</span>
                            {battle.betAmount && <span className="text-yellow-500">APOSTA: {battle.betAmount} ⭐</span>}
                        </div>

                        <div className="p-5">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div className="text-left">
                                    <div className="text-xs text-gray-500 font-bold mb-1">NOSSA EQUIPE</div>
                                    <div className="text-2xl font-black text-white">{myScore}</div>
                                </div>
                                <div className="text-center px-4">
                                    <div className="w-10 h-10 rounded-full bg-red-900/50 flex items-center justify-center border-2 border-red-500/50 mx-auto mb-1 animate-pulse">
                                        <Swords className="text-red-500" size={20} />
                                    </div>
                                    <div className="text-[10px] font-black tracking-widest text-red-500 uppercase">Guerra</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 font-bold mb-1 max-w-[120px] truncate">{enemyName}</div>
                                    <div className="text-2xl font-black text-red-500">{enemyScore}</div>
                                </div>
                            </div>

                            {/* Progress Bar (Tug of War) */}
                            <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden mb-2">
                                <div
                                    className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/20 -translate-x-1/2" />
                            </div>

                            {/* Message */}
                            <div className="text-center mt-3">
                                {winning ? (
                                    <div className="text-green-500 text-sm font-bold flex items-center justify-center gap-2">
                                        <Trophy size={14} /> Estamos vencendo! Continue correndo!
                                    </div>
                                ) : (
                                    <div className="text-red-500 text-sm font-bold flex items-center justify-center gap-2">
                                        <Skull size={14} /> Estamos perdendo! Reajam!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default BattleDashboard;
