import React, { useState, useEffect } from 'react';
import { Zap, MapPin, Trophy, TrendingUp, Users, Briefcase, Building, Eye, EyeOff } from 'lucide-react';
import { Team, TeamMember } from '../../types';
import { getTeamBySlug, getTeamRanking } from '../../services/teamService';
import TeamLandingPage from '../Team/TeamLandingPage';

interface AuthScreenProps {
  onRegister: (name: string, phone: string, password: string, teamId?: string, teamName?: string, role?: 'owner' | 'member' | 'individual', companyName?: string, cnpj?: string) => Promise<void>;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onRegister }) => {
  const [isBusiness, setIsBusiness] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
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

    if (isBusiness) {
      if (!companyName.trim() || !cnpj.trim() || !name.trim() || !phone.trim() || !password.trim()) {
        alert('Por favor, preencha todos os campos da empresa.');
        return;
      }
    } else {
      if (!name.trim() || !phone.trim() || !password.trim()) {
        alert('Por favor, preencha todos os campos.');
        return;
      }
    }

    setLoading(true);
    try {
      await onRegister(
        name.trim(),
        phone.trim(),
        password.trim(),
        inviteTeam?.id,
        inviteTeam?.name,
        isBusiness ? 'owner' : 'individual',
        isBusiness ? companyName : undefined,
        isBusiness ? cnpj : undefined
      );
    } catch (error) {
      console.error('Erro no registro:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <MapPin className="text-gold-500" size={24} />,
      title: 'Conquiste Territórios',
      description: 'Transforme seus treinos em conquistas reais'
    },
    {
      icon: <Trophy className="text-gold-400" size={24} />,
      title: 'Ganhe Estrelas',
      description: 'Suba de nível e desbloqueie conquistas'
    },
    {
      icon: <TrendingUp className="text-yellow-300" size={24} />,
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
    <div className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden">

      {/* Simple Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 via-black to-black"></div>

      {/* Main Content - Fullscreen */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center px-6 py-6">

        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <img
            src="/brand-logo-login.png"
            alt="Territory Run"
            className="h-24 w-auto object-contain"
          />
        </div>

        {/* Business Toggle Tabs */}
        {!inviteTeam && (
          <div className="w-full flex p-1 bg-white/5 rounded-2xl mb-5 border border-white/10">
            <button
              type="button"
              onClick={() => setIsBusiness(false)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${!isBusiness ? 'bg-gradient-to-r from-gold-500 to-yellow-500 text-black shadow-lg' : 'text-gray-400'}`}
            >
              🏃 Atleta
            </button>
            <button
              type="button"
              onClick={() => setIsBusiness(true)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${isBusiness ? 'bg-gradient-to-r from-gold-500 to-yellow-500 text-black shadow-lg' : 'text-gray-400'}`}
            >
              🏢 Assessoria
            </button>
          </div>
        )}

        {/* Welcome Text */}
        <div className="w-full mb-5 text-center">
          {inviteTeam ? (
            <div className="bg-gradient-to-r from-gold-600/20 to-gold-400/20 p-4 rounded-2xl mb-4 border border-gold-500/30">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Users className="text-gold-400" size={24} />
                <h3 className="text-lg font-black text-white">Convite de Equipe!</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Equipe: <strong className="text-gold-400">{inviteTeam.name}</strong>
              </p>
              <button
                onClick={() => setShowLandingPage(true)}
                className="mt-2 text-xs text-gold-400 underline hover:text-gold-300 transition-colors font-bold"
              >
                Ver detalhes da equipe
              </button>
            </div>
          ) : null}

          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
            {isBusiness ? 'Cadastro de Assessoria 🏢' : 'Bora Correr! 🏃'}
          </h2>
          <p className="text-sm text-gray-400 font-medium">
            {isBusiness
              ? 'Cadastre sua empresa e gerencie sua equipe.'
              : inviteTeam
                ? `Entre para a equipe ${inviteTeam.name}`
                : 'Acesse para dominar territórios.'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-3.5">

          {isBusiness && (
            <>
              <div>
                <label className="block text-xs uppercase font-bold text-gold-400 mb-1.5 ml-1">Nome da Assessoria</label>
                <div className="relative">
                  <Building className="absolute left-4 top-3.5 text-gray-500" size={18} />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-white/10 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 focus:outline-none transition-all bg-white/5 text-white placeholder-gray-500 font-medium text-sm"
                    placeholder="EX: IRON RUNNERS"
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-gold-400 mb-1.5 ml-1">CNPJ</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-3.5 text-gray-500" size={18} />
                  <input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-white/10 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 focus:outline-none transition-all bg-white/5 text-white placeholder-gray-500 font-medium text-sm"
                    placeholder="00.000.000/0000-00"
                    disabled={loading}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs uppercase font-bold text-gray-400 mb-1.5 ml-1">{isBusiness ? 'Seu Nome (Responsável)' : 'Seu Codinome'}</label>
            <div className="relative">
              <Users className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-white/10 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 focus:outline-none transition-all bg-white/5 text-white placeholder-gray-500 font-medium text-sm"
                placeholder={isBusiness ? "SEU NOME" : "SEU APELIDO NA CORRIDA"}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-gray-400 mb-1.5 ml-1">Celular / WhatsApp</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-white/10 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 focus:outline-none transition-all bg-white/5 text-white placeholder-gray-500 font-medium text-sm"
              placeholder="(11) 99999-9999"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-gray-400 mb-1.5 ml-1">Senha Secreta</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-white/10 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 focus:outline-none transition-all bg-white/5 text-white placeholder-gray-500 font-medium text-sm pr-12"
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-500 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-black uppercase tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all mt-5 ${loading ? 'bg-gray-700 cursor-not-allowed text-gray-500' : 'bg-gradient-to-r from-gold-500 to-yellow-500 hover:from-gold-400 hover:to-yellow-400 text-black active:scale-95'}`}
          >
            {loading ? (
              <span>Carregando...</span>
            ) : (
              <>
                <Zap size={20} className="fill-black" />
                <span>{isBusiness ? 'Cadastrar Assessoria' : inviteTeam ? 'Aceitar Convite' : 'Começar Agora'}</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle Link */}
        {!inviteTeam && (
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => setIsBusiness(!isBusiness)}
              className="text-xs font-bold text-gray-500 hover:text-gold-400 transition-colors uppercase tracking-widest"
            >
              {isBusiness ? '← Voltar para cadastro de Atleta' : 'Assessoria? Cadastre-se aqui →'}
            </button>
          </div>
        )}

        {/* Version Info */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-gray-600 font-mono tracking-wider">v1.2.0 • TERRITORY RUN</p>
        </div>

      </div>
    </div>
  );
};

export default AuthScreen;
