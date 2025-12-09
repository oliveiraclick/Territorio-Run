import React, { useState, useEffect } from 'react';
import { X, Users, Link as LinkIcon, Copy, Check, Plus, Trophy, Calendar, Target, Activity, Swords } from 'lucide-react';
import { Team, Challenge, TeamMember } from '../../types';
import { getTeamMembers, getTeamRanking } from '../../services/teamService';
import { getTeamChallenges } from '../../services/challengeService';
import { createBattle } from '../../services/battleService';
import CreateChallengeModal from './CreateChallengeModal';
import CreateBattleModal from './CreateBattleModal';
import BattleDashboard from './BattleDashboard';
import InternalWarTab from './InternalWarTab';

interface TeamDashboardProps {
    team: Team;
    currentUser: { id: string, name: string };
    onClose: () => void;
    onCreateChallenge: (name: string, description: string, points: number, startDate: number, endDate: number) => void;
}

const TeamDashboard: React.FC<TeamDashboardProps> = ({ team, currentUser, onClose, onCreateChallenge }) => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [activeTab, setActiveTab] = useState<'members' | 'challenges' | 'ranking' | 'battles'>('battles');
    const [copied, setCopied] = useState(false);
    const [showCreateChallenge, setShowCreateChallenge] = useState(false);
    const [showCreateBattle, setShowCreateBattle] = useState(false);

    const inviteLink = `${window.location.origin}/${team.slug}`;
    const isOwner = team.ownerId === currentUser.id;

    useEffect(() => {
        loadData();
    }, [team.id]);

    const loadData = async () => {
        const [membersData, challengesData] = await Promise.all([
            getTeamMembers(team.id),
            getTeamChallenges(team.id)
        ]);
        setMembers(membersData);
        setChallenges(challengesData);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCreateBattle = async (targetId: string, duration: number, bet: number) => {
        await createBattle(team.id, team.name, targetId, duration, bet);
        // BattleDashboard will auto-refresh via polling, or we could force a refresh here
    };

    const activeChallenges = challenges.filter(c => c.isActive);
    const pastChallenges = challenges.filter(c => !c.isActive);

    return (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-gray-900 max-w-3xl w-full rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
                {/* Header */}
                <div className="sticky top-0 bg-gray-800 p-6 flex items-center justify-between z-10 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 border-2 border-orange-500">
                            {team.logoUrl ? <img src={team.logoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-white">{team.name[0]}</div>}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white">{team.name}</h2>
                            <p className="text-gray-400 text-sm font-bold">{team.memberCount} atletas</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Link de Convite */}
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <LinkIcon size={18} className="text-blue-500" />
                                <span className="text-sm font-bold text-gray-300">Link de Convite</span>
                            </div>
                            <button
                                onClick={handleCopyLink}
                                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-bold text-sm transition-all ${copied ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                            </button>
                        </div>
                        <div className="bg-black/30 rounded-lg p-2 break-all border border-gray-700">
                            <span className="text-xs text-blue-400 font-mono">{inviteLink}</span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-gray-800 rounded-xl overflow-hidden shrink-0">
                        <button
                            onClick={() => setActiveTab('battles')}
                            className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'battles' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Swords size={16} /> GUERRAS
                        </button>
                        <button
                            onClick={() => setActiveTab('ranking')}
                            className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'ranking' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Trophy size={16} /> RANKING
                        </button>
                        <button
                            onClick={() => setActiveTab('members')}
                            className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'members' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Users size={16} /> MEMBROS
                        </button>
                        <button
                            onClick={() => setActiveTab('challenges')}
                            className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'challenges' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Target size={16} /> DESAFIOS
                        </button>
                    </div>

                    {/* Conteúdo das Tabs */}
                    <div className="min-h-[300px]">


                        {activeTab === 'battles' && (
                            <div className="space-y-6">
                                <InternalWarTab team={team} members={members} isOwner={isOwner} />

                                {isOwner && team.squadId === undefined && ( // Only show external battles if internal war isn't the focus? Actually let's keep both but emphasize internal
                                    <div className="pt-8 border-t border-gray-700">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Guerra Externa (Contra outras Equipes)</h3>
                                        <button
                                            onClick={() => setShowCreateBattle(true)}
                                            className="w-full bg-gray-800 border-2 border-dashed border-gray-600 hover:border-red-500 hover:text-red-500 text-gray-400 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            <Swords size={20} /> DECLARAR GUERRA EXTERNA
                                        </button>
                                        <div className="mt-4">
                                            <BattleDashboard team={team} />
                                        </div>
                                    </div>
                                )}
                                {!isOwner && (
                                    <div className="pt-8 border-t border-gray-700">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Guerra Externa</h3>
                                        <BattleDashboard team={team} />
                                    </div>
                                )}
                            </div>
                        )}


                        {activeTab === 'members' && (
                            <div className="space-y-2">
                                {members.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <Users size={48} className="mx-auto mb-3 opacity-30" />
                                        <p>Nenhum membro ainda</p>
                                    </div>
                                ) : (
                                    members.map((member, index) => (
                                        <div key={member.userId} className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-black border border-gray-600">
                                                    {member.userName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-200">{member.userName}</div>
                                                    <div className="text-xs text-gray-500">
                                                        Entrou em {new Date(member.joinedAt).toLocaleDateString('pt-BR')}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right text-sm">
                                                <div className="text-gray-400">{member.totalDistance.toFixed(1)} km</div>
                                                <div className="text-yellow-500 font-bold">{member.totalStars} ⭐</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'challenges' && (
                            <div className="space-y-4">
                                {isOwner && (
                                    <button
                                        onClick={() => setShowCreateChallenge(true)}
                                        className="w-full bg-gray-800 border border-dashed border-gray-600 hover:border-purple-500 text-gray-400 hover:text-purple-500 py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all"
                                    >
                                        <Plus size={24} /> Criar Novo Desafio Interno
                                    </button>
                                )}

                                {activeChallenges.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Ativos</h3>
                                        <div className="space-y-3">
                                            {activeChallenges.map(challenge => (
                                                <div key={challenge.id} className="bg-gray-800 border-l-4 border-purple-500 rounded-r-lg p-4">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h4 className="font-bold text-white">{challenge.name}</h4>
                                                            {challenge.description && (
                                                                <p className="text-sm text-gray-400 mt-1">{challenge.description}</p>
                                                            )}
                                                        </div>
                                                        <div className="bg-purple-900/50 text-purple-300 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/30">
                                                            {challenge.points} pts
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                        <div className="flex items-center space-x-1">
                                                            <Calendar size={12} />
                                                            <span>Até {new Date(challenge.endDate).toLocaleDateString('pt-BR')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {challenges.length === 0 && !isOwner && (
                                    <div className="text-center py-12 text-gray-500">
                                        <Target size={48} className="mx-auto mb-3 opacity-30" />
                                        <p>Nenhum desafio ativo</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'ranking' && (
                            <div className="space-y-2">
                                {members.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <Trophy size={48} className="mx-auto mb-3 opacity-30" />
                                        <p>Ranking vazio</p>
                                    </div>
                                ) : (
                                    members
                                        .sort((a, b) => b.totalStars - a.totalStars)
                                        .map((member, index) => (
                                            <div
                                                key={member.userId}
                                                className={`rounded-lg p-3 flex items-center justify-between border ${index === 0 ? 'bg-yellow-900/20 border-yellow-500/50' :
                                                    index === 1 ? 'bg-gray-800 border-gray-400/50' :
                                                        index === 2 ? 'bg-orange-900/20 border-orange-500/50' :
                                                            'bg-gray-800 border-gray-700'
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${index === 0 ? 'bg-yellow-500 text-black' :
                                                        index === 1 ? 'bg-gray-400 text-black' :
                                                            index === 2 ? 'bg-orange-600 text-white' :
                                                                'bg-gray-700 text-gray-300'
                                                        }`}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-200">{member.userName}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {member.totalDistance.toFixed(1)} km • {member.challengesCompleted} desafios
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-black text-yellow-500">{member.totalStars}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase">estrelas</div>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateChallengeModal
                isOpen={showCreateChallenge}
                teamName={team.name}
                onClose={() => setShowCreateChallenge(false)}
                onCreateChallenge={onCreateChallenge}
            />

            <CreateBattleModal
                isOpen={showCreateBattle}
                onClose={() => setShowCreateBattle(false)}
                currentTeam={team}
                onCreateBattle={handleCreateBattle}
            />
        </div>
    );
};

export default TeamDashboard;
