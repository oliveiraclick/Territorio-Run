import React, { useState, useEffect } from 'react';
import { Zap, MapPin, Trophy, TrendingUp, Users } from 'lucide-react';
import { Team, TeamMember } from '../../types';
import { getTeamBySlug, getTeamRanking } from '../../services/teamService';
import TeamLandingPage from '../Team/TeamLandingPage';

interface AuthScreenProps {
  onRegister: (name: string, phone: string, password: string, teamId?: string, teamName?: string) => Promise<void>;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteTeam, setInviteTeam] = useState<Team | null>(null);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [topMembers, setTopMembers] = useState<TeamMember[]>([]);

  // Detectar slug na URL
  useEffect(() => {
    const detectTeamSlug = async () => {
      const path = window.location.pathname;
      const slug = path.substring(1); // Remove leading '/'

      if (slug && slug !== '') {
        const team = await getTeamBySlug(slug);
        if (team) {
          setInviteTeam(team);
          // Buscar ranking para a LP
          const ranking = await getTeamRanking(team.id);
          setTopMembers(ranking);
        }
      }
    };

    detectTeamSlug();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !password.trim()) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await onRegister(
        name.trim(),
        phone.trim(),
        password.trim(),
        inviteTeam?.id,
        inviteTeam?.name
      );
    } catch (error) {
      console.error('Erro no registro:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <MapPin className="text-orange-500" size={24} />,
      title: 'Conquiste Territórios',
      description: 'Transforme seus treinos em conquistas reais'
    },
    {
      icon: <Trophy className="text-blue-500" size={24} />,
      title: 'Ganhe Estrelas',
      description: 'Suba de nível e desbloqueie conquistas'
    },
    {
      icon: <TrendingUp className="text-cyan-500" size={24} />,
      title: 'Acompanhe Progresso',
      description: 'Métricas em tempo real de cada treino'
    },
  ];

  // Se tiver equipe e estiver na LP, mostra a LP
  if (inviteTeam && showLandingPage) {
    return (
      <TeamLandingPage
        team={inviteTeam}
        topMembers={topMembers}
        onJoinClick={() => setShowLandingPage(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg font-sans selection:bg-neon-green selection:text-black flex relative overflow-hidden">
      {/* Background Image with Transparency */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black/90 z-10"></div>
        <img
          src="/background-with-logo.png"
          alt="Background"
          className="w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
      </div>


      {/* Main Content - Login Form (Centered for Mobile/PWA) */}
      <div className="relative z-10 w-full flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-black/60 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center mb-8">
            <img
              src="/brand-logo-login.png"
              alt="Territory Run"
              className="h-48 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-transform hover:scale-105 duration-500"
            />
          </div>

          {/* Welcome Text */}
          <div className="mb-8 text-center">
            {inviteTeam ? (
              <div className="bg-gradient-to-r from-neon-green to-neon-blue p-[1px] rounded-2xl mb-4 shadow-[0_0_20px_rgba(57,255,20,0.2)]">
                <div className="bg-black/90 rounded-2xl p-4">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <Users className="text-neon-green" size={20} />
                    <h3 className="text-md font-black text-white">Convite de Equipe!</h3>
                  </div>
                  <p className="text-gray-300 text-xs">
                    Equipe: <strong className="text-white">{inviteTeam.name}</strong>
                  </p>
                  <button
                    onClick={() => setShowLandingPage(true)}
                    className="mt-2 text-xs text-neon-blue underline hover:text-white transition-colors"
                  >
                    Ver detalhes
                  </button>
                </div>
              </div>
            ) : null}
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
              Bem-vindo! 👋
            </h2>
            <p className="text-sm text-gray-400 font-medium">
              {inviteTeam
                ? `Entre para a equipe ${inviteTeam.name}`
                : 'Conquiste o mundo correndo!'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="group">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-white/10 focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/50 focus:outline-none transition-all bg-white/5 text-white placeholder-gray-500 font-bold text-sm"
                placeholder="SEU CODINOME"
                disabled={loading}
              />
            </div>

            <div className="group">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-white/10 focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50 focus:outline-none transition-all bg-white/5 text-white placeholder-gray-500 font-bold text-sm"
                placeholder="SEU TELEFONE"
                disabled={loading}
              />
            </div>

            <div className="group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-white/10 focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/50 focus:outline-none transition-all bg-white/5 text-white placeholder-gray-500 font-bold text-sm"
                placeholder="SENHA SECRETA"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-neon-green to-emerald-600 text-black font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] transform hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg tracking-wide uppercase mt-4 border border-neon-green/20"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                  Entrando...
                </span>
              ) : (
                'Entrar / Cadastrar 🚀'
              )}
            </button>
          </form>

          {/* Features - Hidden on small mobile screens to save space */}
          <div className="space-y-3 hidden md:block pt-4 border-t border-white/10">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-xl transition-colors hover:bg-white/5">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  {React.cloneElement(feature.icon as any, { className: "text-gray-300" })}
                </div>
                <div>
                  <h3 className="font-bold text-gray-200 text-sm">{feature.title}</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div >
  );
};

export default AuthScreen;
