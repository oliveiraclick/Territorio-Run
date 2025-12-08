import React, { useState, useEffect } from 'react';
import { X, Users, Link as LinkIcon, Copy, Check, Plus, Trophy, Calendar, Target } from 'lucide-react';
import { Team, Challenge, TeamMember } from '../../types';
import { getTeamMembers, getTeamRanking } from '../../services/teamService';
import { getTeamChallenges } from '../../services/challengeService';

interface TeamDashboardProps {
    team: Team;
    isOwner: boolean;
    onClose: () => void;
    onCreateChallenge: () => void;
}

const TeamDashboard: React.FC<TeamDashboardProps> = ({ team, isOwner, onClose, onCreateChallenge }) => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [activeTab, setActiveTab] = useState<'members' | 'challenges' | 'ranking'>('members');
    const [copied, setCopied] = useState(false);

    const inviteLink = `${window.location.origin}/${team.slug}`;

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

    const activeChallenges = challenges.filter(c => c.isActive);
    const pastChallenges = challenges.filter(c => !c.isActive);

    return (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white max-w-3xl w-full rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-blue-500 p-6 flex items-center justify-between z-10 rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <Users className="text-white" size={32} />
                        <div>
                            <h2 className="text-2xl font-black text-white">{team.name}</h2>
                            <p className="text-white/80 text-sm">{team.memberCount} atletas</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Link de Convite */}
                    <div className="bg-gradient-to-br from-orange-50 to-blue-50 border-2 border-blue-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <LinkIcon size={18} className="text-blue-600" />
                                <span className="text-sm font-bold text-gray-700">Link de Convite</span>
                            </div>
                            <button
                                onClick={handleCopyLink}
                                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-bold text-sm transition-all ${copied ? 'bg-green-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                                    }`}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                            </button>
                        </div>
                        <div className="bg-white rounded-lg p-2 break-all">
                            <span className="text-xs text-blue-600 font-mono">{inviteLink}</span>
                        </div>
                    </div>

                    {/* Botão Criar Desafio (apenas para dono) */}
                    {isOwner && (
                        <button
                            onClick={onCreateChallenge}
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                        >
                            <Plus size={20} />
                            <span>Criar Desafio</span>
                        </button>
                    )}

                    {/* Tabs */}
                    <div className="flex space-x-2 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('members')}
                            className={`px-4 py-2 font-bold transition-all ${activeTab === 'members'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Membros ({members.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('challenges')}
                            className={`px-4 py-2 font-bold transition-all ${activeTab === 'challenges'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Desafios ({activeChallenges.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('ranking')}
                            className={`px-4 py-2 font-bold transition-all ${activeTab === 'ranking'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Ranking
                        </button>
                    </div>

                    {/* Conteúdo das Tabs */}
                    <div className="min-h-[300px]">
                        {activeTab === 'members' && (
                            <div className="space-y-2">
                                {members.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <Users size={48} className="mx-auto mb-3 opacity-50" />
                                        <p>Nenhum membro ainda</p>
                                    </div>
                                ) : (
                                    members.map((member, index) => (
                                        <div
                                            key={member.userId}
                                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-blue-400 flex items-center justify-center text-white font-black">
                                                        {member.userName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-800">{member.userName}</div>
                                                        <div className="text-xs text-gray-500">
                                                            Entrou em {new Date(member.joinedAt).toLocaleDateString('pt-BR')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right text-sm">
                                                    <div className="text-gray-600">{member.totalDistance.toFixed(1)} km</div>
                                                    <div className="text-yellow-600 font-bold">{member.totalStars} ⭐</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'challenges' && (
                            <div className="space-y-4">
                                {activeChallenges.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-700 mb-2">Ativos</h3>
                                        <div className="space-y-2">
                                            {activeChallenges.map(challenge => (
                                                <div
                                                    key={challenge.id}
                                                    className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-4"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h4 className="font-black text-gray-800">{challenge.name}</h4>
                                                            {challenge.description && (
                                                                <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                                                            )}
                                                        </div>
                                                        <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                            {challenge.points} pts
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-xs text-gray-600">
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

                                {pastChallenges.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-700 mb-2">Encerrados</h3>
                                        <div className="space-y-2">
                                            {pastChallenges.map(challenge => (
                                                <div
                                                    key={challenge.id}
                                                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 opacity-60"
                                                >
                                                    <h4 className="font-bold text-gray-600">{challenge.name}</h4>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Encerrado em {new Date(challenge.endDate).toLocaleDateString('pt-BR')}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {challenges.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <Target size={48} className="mx-auto mb-3 opacity-50" />
                                        <p>Nenhum desafio criado ainda</p>
                                        {isOwner && (
                                            <p className="text-sm mt-2">Clique em "Criar Desafio" para começar</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'ranking' && (
                            <div className="space-y-2">
                                {members.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <Trophy size={48} className="mx-auto mb-3 opacity-50" />
                                        <p>Ranking vazio</p>
                                    </div>
                                ) : (
                                    members
                                        .sort((a, b) => b.totalStars - a.totalStars)
                                        .map((member, index) => (
                                            <div
                                                key={member.userId}
                                                className={`rounded-lg p-4 flex items-center justify-between ${index === 0 ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400' :
                                                        index === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400' :
                                                            index === 2 ? 'bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-400' :
                                                                'bg-white border border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${index === 0 ? 'bg-yellow-500 text-white' :
                                                            index === 1 ? 'bg-gray-400 text-white' :
                                                                index === 2 ? 'bg-orange-500 text-white' :
                                                                    'bg-gray-300 text-gray-700'
                                                        }`}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-800">{member.userName}</div>
                                                        <div className="text-xs text-gray-600">
                                                            {member.totalDistance.toFixed(1)} km • {member.challengesCompleted} desafios
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-black text-yellow-600">{member.totalStars}</div>
                                                    <div className="text-xs text-gray-500">estrelas</div>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamDashboard;
