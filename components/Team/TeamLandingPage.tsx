import React from 'react';
import { Team, TeamMember } from '../../types';
import { MapPin, Instagram, Globe, Users, Trophy, Clock, MessageCircle } from 'lucide-react';

interface TeamLandingPageProps {
    team: Team;
    topMembers: TeamMember[];
    onJoinClick: () => void;
}

const TeamLandingPage: React.FC<TeamLandingPageProps> = ({ team, topMembers, onJoinClick }) => {
    // Cores personalizadas ou padrão
    const primaryColor = team.primaryColor || '#ff073a'; // Neon Red default
    const bgColor = '#0a0a0a';

    return (
        <div className="min-h-screen bg-gray-900 text-white overflow-hidden flex flex-col relative">
            {/* Banner Hero */}
            <div className="relative h-[40vh] w-full">
                <div className="absolute inset-0 bg-black/50 z-10" />
                <img
                    src={team.bannerUrl || 'https://images.unsplash.com/photo-1552674605-469555f95856?q=80&w=1000&auto=format&fit=crop'}
                    alt={`${team.name} Banner`}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 md:bg-gradient-to-t from-gray-900 to-transparent z-20" />

                {/* Logo & Name Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-6 z-30 flex flex-col items-center md:items-start md:flex-row md:space-x-6">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-800 flex-shrink-0 mb-4 md:mb-0 transform translate-y-1/2 md:translate-y-0">
                        {team.logoUrl ? (
                            <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-gray-700 to-gray-600">
                                {team.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="text-center md:text-left md:mt-auto md:mb-4">
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                            {team.name}
                        </h1>
                        <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-300 text-sm mt-1">
                            <Users size={14} />
                            <span>{team.memberCount} atletas</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 container mx-auto px-4 py-12 md:py-8 space-y-8 z-20">

                {/* Bio & Actions */}
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-6">
                        <div className="prose prose-invert">
                            <h2 className="text-xl font-bold text-gray-200" style={{ color: primaryColor }}>Sobre a Equipe</h2>
                            <p className="text-gray-400 leading-relaxed">
                                {team.description || "Junte-se a nós para conquistar territórios e evoluir sua performance. Somos uma comunidade apaixonada por esporte e superação."}
                            </p>
                        </div>

                        <div className="flex flex-col space-y-3">
                            {team.address && (
                                <div className="flex items-center space-x-3 text-gray-400">
                                    <MapPin size={20} style={{ color: primaryColor }} />
                                    <span>{team.address}</span>
                                </div>
                            )}

                            {team.operatingHours && (
                                <div className="flex items-center space-x-3 text-gray-400">
                                    <Clock size={20} style={{ color: primaryColor }} />
                                    <span>{team.operatingHours}</span>
                                </div>
                            )}

                            <div className="flex space-x-4 pt-2">
                                {team.whatsapp && (
                                    <a href={`https://wa.me/${team.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-green-500 hover:text-green-400 transition-colors">
                                        <MessageCircle size={20} />
                                        <span>WhatsApp</span>
                                    </a>
                                )}
                                {team.socialLinks?.instagram && (
                                    <a href={team.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                                        <Instagram size={20} />
                                        <span>Instagram</span>
                                    </a>
                                )}
                                {team.socialLinks?.website && (
                                    <a href={team.socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                                        <Globe size={20} />
                                        <span>Website</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Top Athletes */}
                    <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold flex items-center space-x-2">
                                <Trophy className="text-yellow-500" size={20} />
                                <span>Destaques da Equipe</span>
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {topMembers.length > 0 ? (
                                topMembers.slice(0, 3).map((member, idx) => (
                                    <div key={member.userId} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg border border-gray-700/50">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                        ${idx === 0 ? 'bg-yellow-500 text-black' :
                                                    idx === 1 ? 'bg-gray-400 text-black' :
                                                        'bg-orange-700 text-white'}`}
                                            >
                                                {idx + 1}
                                            </div>
                                            <span className="font-semibold text-gray-200">{member.userName}</span>
                                        </div>
                                        <div className="text-xs text-yellow-500 font-mono">
                                            {member.totalStars} ⭐
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm text-center py-4">Seja o primeiro destaque!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer CTA (Sticky Mobile) */}
            <div className="sticky bottom-0 left-0 w-full bg-gray-900/90 backdrop-blur-lg border-t border-gray-800 p-4 z-50">
                <div className="container mx-auto">
                    <button
                        onClick={onJoinClick}
                        className="w-full text-white font-black text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.3)] transform hover:scale-[1.02] transition-all"
                        style={{
                            background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}dd)`,
                            boxShadow: `0 0 15px ${primaryColor}40`
                        }}
                    >
                        Junte-se à {team.name}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamLandingPage;
