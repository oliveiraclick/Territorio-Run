import React, { useState, useEffect } from 'react';
import { Users, Swords, Trophy, Plus, ArrowRight, Shield } from 'lucide-react';
import { Team, TeamMember, InternalWar, Squad } from '../../types';
import { createInternalWar, getInternalWar, assignMemberToSquad } from '../../services/teamService';

interface InternalWarTabProps {
    team: Team;
    members: TeamMember[];
    isOwner: boolean;
}

const InternalWarTab: React.FC<InternalWarTabProps> = ({ team, members, isOwner }) => {
    const [war, setWar] = useState<InternalWar | null>(null);
    const [loading, setLoading] = useState(true);

    // Create War States
    const [warName, setWarName] = useState('');
    const [duration, setDuration] = useState(7);
    const [squadNames, setSquadNames] = useState(['Pelotão Alpha', 'Pelotão Bravo']);

    useEffect(() => {
        loadWar();
    }, [team.id]);

    const loadWar = async () => {
        const data = await getInternalWar(team.id);
        setWar(data);
        setLoading(false);
    };

    const handleCreateWar = async () => {
        if (!warName || squadNames.some(s => !s.trim())) return;
        const newWar = await createInternalWar(team.id, warName, squadNames, duration);
        setWar(newWar);
    };

    const handleAssignMember = async (userId: string, squadId: string) => {
        await assignMemberToSquad(team.id, userId, squadId);
        loadWar(); // Refresh to see changes
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Carregando guerra...</div>;

    // --- VIEW: CREATE WAR (Only Owner) ---
    if (!war) {
        if (!isOwner) {
            return (
                <div className="p-8 text-center text-gray-500">
                    <Swords size={48} className="mx-auto mb-4 opacity-30" />
                    <p>Nenhuma guerra interna ativa no momento.</p>
                </div>
            );
        }

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 p-6 rounded-xl border border-red-500/30">
                    <div className="flex items-center space-x-3 mb-4">
                        <Swords className="text-red-500" size={32} />
                        <h2 className="text-2xl font-black text-white">Declarar Guerra Interna</h2>
                    </div>
                    <p className="text-gray-300 mb-6">
                        Divida sua equipe em pelotões e inicie uma competição interna!
                        Os pontos de cada membro somam para seu pelotão.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">NOME DA GUERRA</label>
                            <input
                                type="text"
                                value={warName}
                                onChange={e => setWarName(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                                placeholder="Ex: Guerra de Inverno"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">DURAÇÃO (DIAS)</label>
                            <select
                                value={duration}
                                onChange={e => setDuration(Number(e.target.value))}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                            >
                                <option value={3}>3 Dias - Blitz</option>
                                <option value={7}>7 Dias - Semanal</option>
                                <option value={15}>15 Dias - Quinzena</option>
                                <option value={30}>30 Dias - Mensal</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">PELOTÕES</label>
                            {squadNames.map((name, idx) => (
                                <div key={idx} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => {
                                            const newNames = [...squadNames];
                                            newNames[idx] = e.target.value;
                                            setSquadNames(newNames);
                                        }}
                                        className="flex-1 bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                                        placeholder={`Nome do Pelotão ${idx + 1}`}
                                    />
                                    {idx > 1 && (
                                        <button
                                            onClick={() => setSquadNames(squadNames.filter((_, i) => i !== idx))}
                                            className="p-3 bg-red-900/50 text-red-500 rounded-lg hover:bg-red-900"
                                        >
                                            <Plus size={20} className="rotate-45" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {squadNames.length < 4 && (
                                <button
                                    onClick={() => setSquadNames([...squadNames, ''])}
                                    className="text-sm text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
                                >
                                    <Plus size={14} /> Adicionar Pelotão
                                </button>
                            )}
                        </div>

                        <button
                            onClick={handleCreateWar}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl shadow-lg mt-4 transition-all"
                        >
                            CRIAR GUERRA E DEFINIR TIMES
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW: ACTIVE WAR ---

    // Sort squads by points
    const sortedSquads = [...war.squads].sort((a, b) => b.totalPoints - a.totalPoints);
    const maxPoints = Math.max(...war.squads.map(s => s.totalPoints), 1); // Avoid div by 0

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Status */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-black text-white">{war.name}</h3>
                    <p className="text-xs text-green-400 font-bold uppercase tracking-widest">EM ANDAMENTO • {Math.ceil((war.endDate - Date.now()) / (1000 * 60 * 60 * 24))} DIAS RESTANTES</p>
                </div>
                <Swords className="text-red-500 animate-pulse" size={32} />
            </div>

            {/* Placar (Bars) */}
            <div className="space-y-4">
                {sortedSquads.map((squad, index) => (
                    <div key={squad.id} className="relative">
                        <div className="flex justify-between items-end mb-1">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl pt-1">
                                    {index === 0 ? '👑' : index === 1 ? '🥈' : '🥉'}
                                </span>
                                <span className="font-bold text-white text-lg">{squad.name}</span>
                            </div>
                            <span className="font-mono font-bold text-yellow-500">{squad.totalPoints} pts</span>
                        </div>
                        <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full transition-all duration-1000 ease-out relative"
                                style={{
                                    width: `${(squad.totalPoints / maxPoints) * 100}%`,
                                    backgroundColor: squad.color
                                }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Gestão de Membros (Visualização dos Pelotões) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {war.squads.map(squad => (
                    <div key={squad.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2" style={{ borderColor: squad.color }}>
                            <h4 className="font-bold text-white" style={{ color: squad.color }}>{squad.name}</h4>
                            <span className="text-xs bg-gray-900 px-2 py-1 rounded text-gray-400">{squad.members.length} soldados</span>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {squad.members.length === 0 && (
                                <p className="text-xs text-gray-600 text-center italic py-2">Sem soldados</p>
                            )}
                            {squad.members.map(memberId => {
                                const member = members.find(m => m.userId === memberId);
                                if (!member) return null;
                                return (
                                    <div key={memberId} className="flex items-center justify-between text-sm bg-gray-900/50 p-2 rounded">
                                        <span className="text-gray-300 truncate">{member.userName}</span>
                                        {/* <span className="text-xs text-yellow-600 font-mono">TODO: pts</span> */}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Area de Drop / Seleção (Apenas Dono) */}
                        {isOwner && (
                            <div className="mt-4 pt-4 border-t border-gray-700">
                                <select
                                    className="w-full bg-gray-900 text-xs text-white p-2 rounded border border-gray-600"
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            handleAssignMember(e.target.value, squad.id);
                                            e.target.value = ''; // Reset
                                        }
                                    }}
                                >
                                    <option value="">+ Adicionar Soldado...</option>
                                    {members
                                        .filter(m => !war.squads.some(s => s.members.includes(m.userId))) // Mostra apenas quem NÃO tem squad
                                        .map(m => (
                                            <option key={m.userId} value={m.userId}>{m.userName}</option>
                                        ))}
                                    <optgroup label="Trocar de Pelotão">
                                        {members
                                            .filter(m => war.squads.some(s => s.members.includes(m.userId) && s.id !== squad.id)) // Quem já tem squad (mas não este)
                                            .map(m => (
                                                <option key={m.userId} value={m.userId}>{m.userName} (Trocar)</option>
                                            ))}
                                    </optgroup>
                                </select>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InternalWarTab;
