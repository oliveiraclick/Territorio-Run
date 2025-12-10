import React, { useState, useEffect } from 'react';
import { X, Users, Link as LinkIcon, Copy, Check, Plus, Trophy, Calendar, Target, Swords, Crown, Settings } from 'lucide-react';
import { Team, Challenge, TeamMember } from '../../types';
import { getTeamMembers } from '../../services/teamService';
import { getTeamChallenges } from '../../services/challengeService';
import { createBattle } from '../../services/battleService';
import CreateChallengeModal from './CreateChallengeModal';
import CreateBattleModal from './CreateBattleModal';
import EditTeamModal from './EditTeamModal';
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
    const [showEditModal, setShowEditModal] = useState(false);

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
    };

    const activeChallenges = challenges.filter(c => c.isActive);

    return (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans">
            <div className="bg-dark-bg max-w-3xl w-full rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto border border-white/5">
                {/* Header */}
                <div className="sticky top-0 bg-dark-bg/95 p-6 flex items-center justify-between z-10 border-b border-white/5 backdrop-blur-xl">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-black border-2 border-gold-500 shadow-[0_0_15px_rgba(234,179,8,0.3)] p-1">
                            <div className="w-full h-full rounded-full bg-surface-dark flex items-center justify-center overflow-hidden">
                                {team.logoUrl ? <img src={team.logoUrl} className="w-full h-full object-cover" /> : <div className="font-black text-white text-2xl">{team.name[0]}</div>}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-wide">{team.name}</h2>
                            <p className="text-gold-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                                <Users size={12} /> {team.memberCount} ATLETAS
                            </p>
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
                    {/* Invite Link Card */}
                    {isOwner && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-surface-dark border border-white/5 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-gold-500/10 p-2 rounded-lg text-gold-500">
                                        <LinkIcon size={18} />
                                    </div>
                                    <div>
                                        <span className="block text-sm font-bold text-white">Link de Convite</span>
                                        <span className="text-xs text-gray-500 font-mono hidden md:block">{inviteLink}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCopyLink}
                                    className={`flex items-center space-x-1 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide transition-all ${copied ? 'bg-green-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                >
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                                </button>
                            </div>

                            <button
                                onClick={() => setShowEditModal(true)}
                                className="bg-surface-dark border border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                                        <Settings size={18} />
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Editar Perfil</span>
                                        <span className="text-xs text-gray-500">Logo, bio, redes sociais...</span>
                                    </div>
                                </div>
                                <div className="bg-white/10 p-2 rounded-lg">
                                    <Plus size={14} className="text-gray-400" />
                                </div>
                            </button>
                        </div>
                    )}

                    {/* Tabs Segmented Control */}
                    <div className="flex p-1 bg-surface-dark rounded-xl overflow-hidden shrink-0 border border-white/5">
                        <button
                            onClick={() => setActiveTab('battles')}
                            className={`flex-1 py-2 rounded-lg font-bold text-[10px] md:text-xs flex items-center justify-center gap-2 transition-all uppercase tracking-wide ${activeTab === 'battles' ? 'bg-white text-black shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Swords size={14} /> Guerras
                        </button>
                        <button
                            onClick={() => setActiveTab('ranking')}
                            className={`flex-1 py-2 rounded-lg font-bold text-[10px] md:text-xs flex items-center justify-center gap-2 transition-all uppercase tracking-wide ${activeTab === 'ranking' ? 'bg-white text-black shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Trophy size={14} /> Ranking
                        </button>
                        <button
                            onClick={() => setActiveTab('members')}
                            className={`flex-1 py-2 rounded-lg font-bold text-[10px] md:text-xs flex items-center justify-center gap-2 transition-all uppercase tracking-wide ${activeTab === 'members' ? 'bg-white text-black shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Users size={14} /> Membros
                        </button>
                        <button
                            onClick={() => setActiveTab('challenges')}
                            className={`flex-1 py-2 rounded-lg font-bold text-[10px] md:text-xs flex items-center justify-center gap-2 transition-all uppercase tracking-wide ${activeTab === 'challenges' ? 'bg-white text-black shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Target size={14} /> Desafios
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[300px]">

                        {activeTab === 'battles' && (
                            <div className="space-y-6">
                                <InternalWarTab team={team} members={members} isOwner={isOwner} />

                                {isOwner && team.squadId === undefined && (
                                    <div className="pt-8 border-t border-white/10">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Guerra Externa</h3>
                                        <button
                                            onClick={() => setShowCreateBattle(true)}
                                            className="w-full bg-surface-dark border border-dashed border-gray-700 hover:border-gold-500 hover:text-gold-500 text-gray-500 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
                                        >
                                            <Swords size={20} /> Declarar Guerra
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
                                        <div key={member.userId} className="bg-surface-dark border border-white/5 rounded-xl p-4 flex items-center justify-between hover:border-gold-500/20 transition-all">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-black border border-white/10">
                                                    {member.userName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm">{member.userName}</div>
                                                    <div className="text-xs text-gray-500">
                                                        Membro desde {new Date(member.joinedAt).toLocaleDateString('pt-BR')}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right text-sm">
                                                <div className="text-gray-400 font-medium">{member.totalDistance.toFixed(1)} km</div>
                                                <div className="text-gold-500 font-bold">{member.totalStars} ⭐</div>
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
                                        className="w-full bg-surface-dark border border-dashed border-gray-700 hover:border-gold-500 text-gray-500 hover:text-gold-500 py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all uppercase tracking-wide text-sm"
                                    >
                                        <Plus size={24} /> Criar Novo Desafio
                                    </button>
                                )}

                                {activeChallenges.length > 0 && (
                                    <div className="space-y-3">
                                        {activeChallenges.map(challenge => (
                                            <div key={challenge.id} className="bg-surface-dark border-l-4 border-gold-500 rounded-r-xl p-4 shadow-sm">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-white">{challenge.name}</h4>
                                                        {challenge.description && (
                                                            <p className="text-xs text-gray-400 mt-1">{challenge.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="bg-gold-500/10 text-gold-500 px-3 py-1 rounded-full text-xs font-bold border border-gold-500/20">
                                                        {challenge.points} PTS
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
                                                className={`rounded-xl p-3 flex items-center justify-between border ${index === 0 ? 'bg-gold-500/10 border-gold-500/50' : 'bg-surface-dark border-white/5'}`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${index === 0 ? 'bg-gold-500 text-black shadow-lg' : 'bg-gray-800 text-gray-500'}`}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-sm">{member.userName} {index === 0 && '👑'}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {member.totalDistance.toFixed(1)} km
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-lg font-black ${index === 0 ? 'text-gold-500' : 'text-gray-400'}`}>{member.totalStars}</div>
                                                    <div className="text-[9px] text-gray-600 uppercase font-bold tracking-wider">PTS</div>
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

            {showEditModal && (
                <EditTeamModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    team={team}
                    onUpdate={(updatedTeam) => {
                        // We need to reload the page or update parent state here. 
                        // For now simplified as reloading data context would be complex without global state manager
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
};

export default TeamDashboard;
