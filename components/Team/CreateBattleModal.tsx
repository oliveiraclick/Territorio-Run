import React, { useState } from 'react';
import { X, Swords, Search, Clock, ShieldAlert } from 'lucide-react';
import { Team } from '../../types';
import { searchTeams } from '../../services/teamService';

interface CreateBattleModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTeam: Team;
    onCreateBattle: (targetTeamId: string, duration: number, bet: number) => Promise<void>;
}

const CreateBattleModal: React.FC<CreateBattleModalProps> = ({ isOpen, onClose, currentTeam, onCreateBattle }) => {
    const [step, setStep] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Team[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [duration, setDuration] = useState(24);
    const [bet, setBet] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (val: string) => {
        setSearchQuery(val);
        if (val.length > 2) {
            const results = await searchTeams(val);
            setSearchResults(results.filter(t => t.id !== currentTeam.id));
        } else {
            setSearchResults([]);
        }
    };

    const handleCreate = async () => {
        if (!selectedTeam) return;
        setLoading(true);
        await onCreateBattle(selectedTeam.id, duration, bet);
        setLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-dark-bg border border-white/10 max-w-md w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-black/90 p-6 flex items-center justify-between shrink-0 border-b border-white/10">
                    <div className="flex items-center space-x-3">
                        <Swords className="text-neon-red" size={28} />
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-wider">
                            Declarar Guerra
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {step === 0 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-white mb-2">Escolha o Oponente</h3>
                                <p className="text-gray-400 text-sm">Quem você quer desafiar para um duelo de territórios?</p>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-3.5 text-gray-500" size={20} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Buscar equipe rival (ex: Iron Runners)"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-neon-red focus:ring-1 focus:ring-neon-red/50 focus:outline-none placeholder-gray-600 transition-colors"
                                />
                            </div>

                            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                {searchResults.map(team => (
                                    <div
                                        key={team.id}
                                        onClick={() => { setSelectedTeam(team); setStep(1); }}
                                        className="bg-white/5 hover:bg-white/10 p-4 rounded-xl cursor-pointer transition-all border border-transparent hover:border-neon-red flex items-center space-x-4"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-black overflow-hidden shrink-0 border border-white/10">
                                            {team.logoUrl ? <img src={team.logoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-white">{team.name[0]}</div>}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">{team.name}</h4>
                                            <p className="text-xs text-gray-400">{team.memberCount} membros • {team.address || 'Sem local'}</p>
                                        </div>
                                    </div>
                                ))}
                                {searchQuery.length > 2 && searchResults.length === 0 && (
                                    <p className="text-center text-gray-500 py-4">Nenhuma equipe encontrada.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 1 && selectedTeam && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/10">
                                <div className="text-center w-5/12">
                                    <h4 className="font-black text-neon-blue text-lg">{currentTeam.name}</h4>
                                </div>
                                <div className="text-center w-2/12">
                                    <Swords className="text-neon-red mx-auto" size={24} />
                                    <span className="text-xs text-gray-500 font-bold">VS</span>
                                </div>
                                <div className="text-center w-5/12">
                                    <h4 className="font-black text-white text-lg">{selectedTeam.name}</h4>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                                    <Clock size={16} /> Duração da Batalha
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[24, 48, 168].map(h => (
                                        <button
                                            key={h}
                                            onClick={() => setDuration(h)}
                                            className={`py-3 rounded-xl font-bold border transition-all ${duration === h ? 'bg-neon-red text-white border-neon-red shadow-[0_0_10px_rgba(255,7,58,0.4)]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            {h === 168 ? '1 Semana' : `${h}h`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleCreate}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-neon-red to-red-600 text-white font-black py-4 rounded-xl text-lg hover:shadow-[0_0_20px_rgba(255,7,58,0.5)] transition-all transform hover:scale-[1.02] shadow-[0_0_15px_rgba(255,7,58,0.3)]"
                            >
                                {loading ? 'Declarando Guerra...' : 'DECLARAR GUERRA'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateBattleModal;
