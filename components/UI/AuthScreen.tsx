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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-cyan-50 flex relative overflow-hidden">
      {/* Background Image with Transparency */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/background-with-logo.png"
          alt="Background"
          className="w-full h-full object-cover opacity-10"
        />
      </div>


      {/* Main Content - Login Form (Centered for Mobile/PWA) */}
      <div className="relative z-10 w-full flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/50">
          {/* Mobile Logo */}
          {/* Mobile Logo */}
          <div className="flex items-center justify-center mb-8">
            <img
              src="/brand-logo-login.png"
              alt="Territory Run"
              className="h-24 w-auto object-contain"
            />
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            {inviteTeam ? (
              <div className="bg-gradient-to-r from-orange-500 to-blue-500 p-4 rounded-xl mb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Users className="text-white" size={24} />
                  <h3 className="text-lg font-black text-white">Convite de Equipe!</h3>
                </div>
                <p className="text-white/90 text-sm">
                  Você está se cadastrando na equipe <strong>{inviteTeam.name}</strong>
                </p>
                <button
                  onClick={() => setShowLandingPage(true)}
                  className="mt-2 text-xs text-white underline hover:text-gray-100"
                >
                  Voltar para detalhes da equipe
                </button>
              </div>
            ) : null}
            <h2 className="text-3xl font-black text-gray-800 mb-2">
              Bem-vindo! 👋
            </h2>
            <p className="text-gray-600">
              {inviteTeam
                ? `Complete seu cadastro para entrar na equipe ${inviteTeam.name}`
                : 'Entre ou crie sua conta para começar a conquistar'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Codinome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors bg-white text-gray-800 placeholder-gray-400"
                placeholder="Seu nome de guerreiro"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors bg-white text-gray-800 placeholder-gray-400"
                placeholder="(00) 00000-0000"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none transition-colors bg-white text-gray-800 placeholder-gray-400"
                placeholder="Sua senha secreta"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-blue-500 text-white font-black py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Entrando...
                </span>
              ) : (
                'Começar a Conquistar 🚀'
              )}
            </button>
          </form>

          {/* Features */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex-shrink-0 mt-0.5">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">{feature.title}</h3>
                  <p className="text-xs text-gray-600">{feature.description}</p>
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
