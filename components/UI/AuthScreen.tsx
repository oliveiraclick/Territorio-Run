import React, { useState } from 'react';
import { Zap, MapPin, Trophy, TrendingUp } from 'lucide-react';

interface AuthScreenProps {
  onRegister: (name: string, phone: string, password: string) => Promise<void>;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !password.trim()) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await onRegister(name.trim(), phone.trim(), password.trim());
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-cyan-50 flex relative overflow-hidden">
      {/* Background Image with Transparency */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/runner-hero.png"
          alt="Background"
          className="w-full h-full object-cover opacity-10"
        />
      </div>
      {/* Left Side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/90 to-blue-600/90 z-10" />
        <img
          src="/runner-hero.png"
          alt="Runner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 flex flex-col justify-center items-start p-16 text-white">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Zap size={28} className="text-orange-500" fill="currentColor" />
              </div>
              <h1 className="text-4xl font-black">Territory Run</h1>
            </div>
            <p className="text-2xl font-light opacity-90">Conquista</p>
          </div>

          <div className="space-y-6 max-w-md">
            <h2 className="text-3xl font-bold leading-tight">
              Transforme seus treinos em conquistas épicas
            </h2>
            <p className="text-lg opacity-90">
              Cada movimento é um território. Cada treino é uma vitória.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <Zap size={32} className="text-white" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-800">Territory Run</h1>
              <p className="text-sm text-gray-600">Conquista</p>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-800 mb-2">
              Bem-vindo! 👋
            </h2>
            <p className="text-gray-600">
              Entre ou crie sua conta para começar a conquistar
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
    </div>
  );
};

export default AuthScreen;
