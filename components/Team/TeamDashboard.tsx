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
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans">
            <div className="bg-dark-bg max-w-3xl w-full rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto border border-white/10">
                {/* Header */}
                <div className="sticky top-0 bg-black/90 p-6 flex items-center justify-between z-10 border-b border-white/10 backdrop-blur-xl">
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-black border-2 border-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                            {team.logoUrl ? <img src={team.logoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-white text-xl">{team.name[0]}</div>}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-wide">{team.name}</h2>
                            <p className="text-neon-blue text-sm font-bold uppercase tracking-wider">{team.memberCount} ATLETAS</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Link de Convite */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <LinkIcon size={18} className="text-neon-blue" />
                                <span className="text-sm font-bold text-gray-300">Link de Convite</span>
                            </div>
                            <button
                                onClick={handleCopyLink}
                                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-bold text-sm transition-all ${copied ? 'bg-neon-green text-black' : 'bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/30'}`}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                            </button>
                        </div>
                        <div className="bg-black/50 rounded-lg p-3 break-all border border-white/5 font-mono text-xs text-gray-400">
                            {inviteLink}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-black/40 rounded-2xl overflow-hidden shrink-0 border border-white/5">
                        <button
                            onClick={() => setActiveTab('battles')}
                            className={`flex-1 py-3 rounded-xl font-bold text-[10px] md:text-xs flex items-center justify-center gap-1.5 transition-all uppercase tracking-wide ${activeTab === 'battles' ? 'bg-neon-red text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Swords size={14} /> GUERRAS
                        </button>
                        <button
                            onClick={() => setActiveTab('ranking')}
                            className={`flex-1 py-3 rounded-xl font-bold text-[10px] md:text-xs flex items-center justify-center gap-1.5 transition-all uppercase tracking-wide ${activeTab === 'ranking' ? 'bg-yellow-500 text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Trophy size={14} /> RANKING
                        </button>
                        <button
                            onClick={() => setActiveTab('members')}
                            className={`flex-1 py-3 rounded-xl font-bold text-[10px] md:text-xs flex items-center justify-center gap-1.5 transition-all uppercase tracking-wide ${activeTab === 'members' ? 'bg-neon-blue text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Users size={14} /> MEMBROS
                        </button>
                        <button
                            onClick={() => setActiveTab('challenges')}
                            className={`flex-1 py-3 rounded-xl font-bold text-[10px] md:text-xs flex items-center justify-center gap-1.5 transition-all uppercase tracking-wide ${activeTab === 'challenges' ? 'bg-neon-purple text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Target size={14} /> DESAFIOS
                        </button>
                    </div>

                    {/* Conteúdo das Tabs */}
                    <div className="min-h-[300px]">


                        {activeTab === 'battles' && (
                            <div className="space-y-6">
                                <InternalWarTab team={team} members={members} isOwner={isOwner} />

                                {isOwner && team.squadId === undefined && ( // Only show external battles if internal war isn't the focus? Actually let's keep both but emphasize internal
                                    <div className="pt-8 border-t border-white/10">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Guerra Externa</h3>
                                        <button
                                            onClick={() => setShowCreateBattle(true)}
                                            className="w-full bg-black/40 border-2 border-dashed border-gray-700 hover:border-neon-red hover:text-neon-red text-gray-500 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
                                        >
                                            <Swords size={20} /> DECLARAR GUERRA
                                        </button>
                                        <div className="mt-4">
                                            <BattleDashboard team={team} />
                                        </div>
                                    </div>
                                )}
                                {!isOwner && (
                                    <div className="pt-8 border-t border-white/10">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Guerra Externa</h3>
                                        <BattleDashboard team={team} />
                                    </div>
                                )}
                            </div>
                        )}


                        {activeTab === 'members' && (
                            <div className="space-y-2">
                                {members.length === 0 ? (
                                    <div className="text-center py-12 text-gray-600">
                                        <Users size={48} className="mx-auto mb-3 opacity-20" />
                                        <p>Nenhum membro ainda</p>
                                    </div>
                                ) : (
                                    members.map((member, index) => (
                                        <div key={member.userId} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-black border border-white/10">
                                                    {member.userName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white">{member.userName}</div>
                                                    <div className="text-xs text-gray-500">
                                                        Entrou em {new Date(member.joinedAt).toLocaleDateString('pt-BR')}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right text-sm">
                                                <div className="text-gray-400 font-medium">{member.totalDistance.toFixed(1)} km</div>
                                                <div className="text-yellow-400 font-bold">{member.totalStars} ⭐</div>
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
                                        className="w-full bg-black/40 border border-dashed border-gray-700 hover:border-neon-purple text-gray-500 hover:text-neon-purple py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all uppercase tracking-wide text-sm"
                                    >
                                        <Plus size={24} /> Criar Novo Desafio Interno
                                    </button>
                                )}

                                {activeChallenges.length > 0 && (
                                    <div>
                                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Ativos</h3>
                                        <div className="space-y-3">
                                            {activeChallenges.map(challenge => (
                                                <div key={challenge.id} className="bg-white/5 border-l-4 border-neon-purple rounded-r-xl p-4">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h4 className="font-bold text-white">{challenge.name}</h4>
                                                            {challenge.description && (
                                                                <p className="text-sm text-gray-400 mt-1">{challenge.description}</p>
                                                            )}
                                                        </div>
                                                        <div className="bg-neon-purple/20 text-neon-purple px-3 py-1 rounded-full text-xs font-bold border border-neon-purple/30">
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
                                    <div className="text-center py-12 text-gray-600">
                                        <Target size={48} className="mx-auto mb-3 opacity-20" />
                                        <p>Nenhum desafio ativo</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'ranking' && (
                            <div className="space-y-2">
                                {members.length === 0 ? (
                                    <div className="text-center py-12 text-gray-600">
                                        <Trophy size={48} className="mx-auto mb-3 opacity-20" />
                                        <p>Ranking vazio</p>
                                    </div>
                                ) : (
                                    members
                                        .sort((a, b) => b.totalStars - a.totalStars)
                                        .map((member, index) => (
                                            <div
                                                key={member.userId}
                                                className={`rounded-xl p-3 flex items-center justify-between border ${index === 0 ? 'bg-yellow-500/10 border-yellow-500/30' :
                                                    index === 1 ? 'bg-white/5 border-white/20' :
                                                        index === 2 ? 'bg-orange-500/10 border-orange-500/30' :
                                                            'bg-white/5 border-white/5'
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${index === 0 ? 'bg-yellow-500 text-black' :
                                                        index === 1 ? 'bg-gray-400 text-black' :
                                                            index === 2 ? 'bg-orange-600 text-white' :
                                                                'bg-gray-800 text-gray-500'
                                                        }`}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">{member.userName}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {member.totalDistance.toFixed(1)} km • {member.challengesCompleted} desafios
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-black text-yellow-500">{member.totalStars}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold">estrelas</div>
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
