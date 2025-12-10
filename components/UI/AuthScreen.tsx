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
    <div className="min-h-screen bg-dark-bg font-sans selection:bg-gold-500 selection:text-black flex relative overflow-hidden">
      {/* Background Image with Transparency */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black/95 z-10"></div>
        <img
          src="/background-with-logo.png"
          alt="Background"
          className="w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
      </div>


      {/* Main Content - Login Form */}
      <div className="relative z-10 w-full flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-surface-dark/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/5">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center mb-6">
            <img
              src="/brand-logo-login.png"
              alt="Territory Run"
              className="h-56 w-auto object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.2)] transition-transform hover:scale-105 duration-500"
            />
          </div>

          {/* Business Toggle Tabs */}
          {!inviteTeam && (
            <div className="flex p-1 bg-black/40 rounded-xl mb-6 border border-white/5">
              <button
                type="button"
                onClick={() => setIsBusiness(false)}
                className={`flex-1 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${!isBusiness ? 'bg-yellow-500 text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Sou Atleta
              </button>
              <button
                type="button"
                onClick={() => setIsBusiness(true)}
                className={`flex-1 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${isBusiness ? 'bg-yellow-500 text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Sou Assessoria
              </button>
            </div>
          )}

          {/* Welcome Text */}
          <div className="mb-6 text-center">
            {inviteTeam ? (
              <div className="bg-gradient-to-r from-gold-600 to-gold-400 p-[1px] rounded-2xl mb-4 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                <div className="bg-black/90 rounded-2xl p-4">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <Users className="text-gold-500" size={20} />
                    <h3 className="text-md font-black text-white">Convite de Equipe!</h3>
                  </div>
                  <p className="text-gray-300 text-xs">
                    Equipe: <strong className="text-white">{inviteTeam.name}</strong>
                  </p>
                  <button
                    onClick={() => setShowLandingPage(true)}
                    className="mt-2 text-xs text-gold-500 underline hover:text-white transition-colors"
                  >
                    Ver detalhes
                  </button>
                </div>
              </div>
            ) : null}

            <h2 className="text-2xl font-black text-white mb-1 tracking-tight">
              {isBusiness ? 'Cadastro de Assessoria 🏢' : 'Bora Correr! 🏃'}
            </h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              {isBusiness
                ? 'Cadastre sua empresa e gerencie sua equipe.'
                : inviteTeam
                  ? `Entre para a equipe ${inviteTeam.name}`
                  : 'Acesse para dominar territórios.'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 mb-6">

            {isBusiness && (
              <>
                <div className="group">
                  <label className="block text-[10px] uppercase font-bold text-gold-500 mb-1 ml-2">Nome da Assessoria</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-3.5 text-gray-500" size={16} />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-12 pr-5 py-3 rounded-xl border border-white/10 focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 focus:outline-none transition-all bg-black/40 text-white placeholder-gray-600 font-bold text-sm"
                      placeholder="EX: IRON RUNNERS"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-[10px] uppercase font-bold text-gold-500 mb-1 ml-2">CNPJ</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-3.5 text-gray-500" size={16} />
                    <input
                      type="text"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      className="w-full pl-12 pr-5 py-3 rounded-xl border border-white/10 focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 focus:outline-none transition-all bg-black/40 text-white placeholder-gray-600 font-bold text-sm"
                      placeholder="00.000.000/0000-00"
                      disabled={loading}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="group">
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 ml-2">{isBusiness ? 'Seu Nome (Responsável)' : 'Seu Codinome'}</label>
              <div className="relative">
                <Users className="absolute left-4 top-3.5 text-gray-500" size={16} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-5 py-3 rounded-xl border border-white/10 focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 focus:outline-none transition-all bg-black/40 text-white placeholder-gray-600 font-bold text-sm"
                  placeholder={isBusiness ? "SEU NOME" : "SEU APELIDO NA CORRIDA"}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 ml-2">Celular / WhatsApp</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-5 py-3 rounded-xl border border-white/10 focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 focus:outline-none transition-all bg-black/40 text-white placeholder-gray-600 font-bold text-sm"
                placeholder="(11) 99999-9999"
                disabled={loading}
              />
            </div>

            <div className="group">
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 ml-2">Senha Secreta</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl border border-white/10 focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 focus:outline-none transition-all bg-black/40 text-white placeholder-gray-600 font-bold text-sm pr-12"
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
              className={`w-full py-4 rounded-xl font-black uppercase tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all group ${loading ? 'bg-gray-700 cursor-not-allowed text-gray-500' : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)]'}`}
            >
              {loading ? (
                <span>Carregando...</span>
              ) : (
                <>
                  <Zap size={20} className={`fill-black ${!isBusiness && 'animate-pulse'}`} />
                  <span>{isBusiness ? 'Cadastrar Assessoria' : inviteTeam ? 'Aceitar Convite' : 'Começar Agora'}</span>
                </>
              )}
            </button>
          </form>

          {/* Explicit Toggle for Consultancy Visibility */}
          {!inviteTeam && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsBusiness(!isBusiness)}
                className="text-xs font-bold text-gray-500 hover:text-gold-500 transition-colors uppercase tracking-widest border-b border-transparent hover:border-gold-500 pb-0.5"
              >
                {isBusiness ? 'Voltar para cadastro de Atleta' : 'Assessoria? Cadastre-se aqui.'}
              </button>
            </div>
          )}


          {/* Features - Hidden on small mobile screens to save space */}
          <div className="space-y-3 hidden md:block pt-4 border-t border-white/10">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-xl transition-colors hover:bg-white/5">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  {React.cloneElement(feature.icon as any, { className: "" })}
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
