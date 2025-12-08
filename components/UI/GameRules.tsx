import React, { useState } from 'react';
import { X, Star, Trophy, Zap, MapPin, Users, Shield, Award, TrendingUp, Target, Clock, Flame } from 'lucide-react';
import { STAR_REWARDS } from '../../utils/starSystem';
import { ACTIVITY_MULTIPLIERS, SPEED_LIMITS, FRAUD_THRESHOLD } from '../../utils/activityUtils';

interface GameRulesProps {
    onClose: () => void;
}

export const GameRules: React.FC<GameRulesProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'basics' | 'stars' | 'conquest' | 'modes' | 'teams'>('basics');

    return (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="min-h-screen p-4 flex items-center justify-center">
                <div className="bg-gradient-to-br from-orange-50 via-blue-50 to-cyan-50 max-w-4xl w-full rounded-3xl shadow-2xl overflow-hidden">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 via-blue-500 to-cyan-500 p-8 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                        </div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-black text-white mb-2">Como Jogar</h1>
                                <p className="text-white/90 text-lg">Domine o território, ganhe estrelas, seja lenda!</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
                            >
                                <X size={28} />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white border-b border-gray-200 px-6 flex overflow-x-auto">
                        {[
                            { id: 'basics', icon: Zap, label: 'Básico' },
                            { id: 'stars', icon: Star, label: 'Estrelas' },
                            { id: 'conquest', icon: Trophy, label: 'Conquistas' },
                            { id: 'modes', icon: Shield, label: 'Modalidades' },
                            { id: 'teams', icon: Users, label: 'Equipes' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center space-x-2 px-6 py-4 font-bold border-b-4 transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <tab.icon size={20} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">

                        {/* BÁSICO */}
                        {activeTab === 'basics' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-gradient-to-r from-orange-100 to-blue-100 p-6 rounded-2xl border-2 border-orange-300">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <Zap size={32} className="text-orange-600" fill="currentColor" />
                                        <h2 className="text-2xl font-black text-gray-800">Objetivo do Jogo</h2>
                                    </div>
                                    <p className="text-gray-700 text-lg leading-relaxed">
                                        Conquiste territórios correndo ou pedalando! Cada percurso que você faz vira um território no mapa.
                                        Quanto mais você se move, mais territórios conquista e mais estrelas ganha!
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <MapPin className="text-blue-500" size={24} />
                                            <h3 className="font-black text-gray-800">1. Inicie uma Atividade</h3>
                                        </div>
                                        <p className="text-gray-600 text-sm">
                                            Escolha entre corrida ou ciclismo e clique em "Iniciar". O GPS começará a rastrear seu percurso.
                                        </p>
                                    </div>

                                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <TrendingUp className="text-green-500" size={24} />
                                            <h3 className="font-black text-gray-800">2. Faça seu Percurso</h3>
                                        </div>
                                        <p className="text-gray-600 text-sm">
                                            Corra ou pedale normalmente. O app registra cada movimento e calcula sua velocidade.
                                        </p>
                                    </div>

                                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Trophy className="text-yellow-500" size={24} />
                                            <h3 className="font-black text-gray-800">3. Pare e Nomeie</h3>
                                        </div>
                                        <p className="text-gray-600 text-sm">
                                            Ao terminar, pare a atividade e dê um nome épico ao seu território conquistado!
                                        </p>
                                    </div>

                                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Star className="text-orange-500" size={24} />
                                            <h3 className="font-black text-gray-800">4. Ganhe Estrelas</h3>
                                        </div>
                                        <p className="text-gray-600 text-sm">
                                            Receba estrelas pela conquista! Use para subir de nível e dominar o ranking.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ESTRELAS */}
                        {activeTab === 'stars' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-2xl border-2 border-yellow-400">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <Star size={32} className="text-yellow-600" fill="currentColor" />
                                        <h2 className="text-2xl font-black text-gray-800">Sistema de Estrelas</h2>
                                    </div>
                                    <p className="text-gray-700 text-lg">
                                        Estrelas são a moeda do jogo! Ganhe estrelas conquistando territórios, defendendo suas áreas e completando desafios.
                                    </p>
                                </div>

                                <div className="grid gap-4">
                                    <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-green-500">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-3">
                                                <MapPin className="text-green-500" size={24} />
                                                <h3 className="font-bold text-gray-800">Conquistar Território Novo</h3>
                                            </div>
                                            <div className="bg-yellow-100 px-4 py-2 rounded-full">
                                                <span className="text-xl font-black text-yellow-700">+{STAR_REWARDS.CONQUER_TERRITORY} ⭐</span>
                                            </div>
                                        </div>
                                        {/* CONQUISTAS */}
                                        {activeTab === 'conquest' && (
                                            <div className="space-y-6 animate-fade-in">
                                                <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl border-2 border-purple-400">
                                                    <div className="flex items-center space-x-3 mb-4">
                                                        <Trophy size={32} className="text-purple-600" />
                                                        <h2 className="text-2xl font-black text-gray-800">Regras de Conquista</h2>
                                                    </div>
                                                    <p className="text-gray-700 text-lg">
                                                        Para conquistar o território de outro jogador, você precisa percorrer uma distância maior que a original!
                                                    </p>
                                                </div>

                                                <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-orange-300">
                                                    <h3 className="text-xl font-black text-gray-800 mb-4">📏 Dificuldade Progressiva</h3>
                                                    <p className="text-gray-700 mb-4">
                                                        Cada vez que um território é conquistado, fica <strong>10% mais difícil</strong> reconquistar!
                                                    </p>

                                                    <div className="bg-gradient-to-r from-orange-50 to-blue-50 p-4 rounded-lg space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-700">Distância Original:</span>
                                                            <span className="font-black text-blue-600">5.0 km</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-700">1ª Conquista (0 vezes):</span>
                                                            <span className="font-black text-green-600">5.0 km</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-700">2ª Conquista (1 vez):</span>
                                                            <span className="font-black text-yellow-600">5.5 km (+10%)</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-700">3ª Conquista (2 vezes):</span>
                                                            <span className="font-black text-orange-600">6.0 km (+20%)</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-700">4ª Conquista (3 vezes):</span>
                                                            <span className="font-black text-red-600">6.5 km (+30%)</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-green-300">
                                                    <h3 className="text-xl font-black text-gray-800 mb-4">🎯 Sobreposição Necessária</h3>
                                                    <p className="text-gray-700 mb-4">
                                                        Seu percurso precisa sobrepor pelo menos <strong>50%</strong> do território alvo para tentar conquistá-lo.
                                                    </p>
                                                    <div className="bg-green-50 p-4 rounded-lg">
                                                        <p className="text-sm text-green-700">
                                                            💡 <strong>Dica:</strong> Passe pelo meio do território inimigo para maximizar a sobreposição!
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-300">
                                                    <h3 className="text-xl font-black text-gray-800 mb-4">🔄 Reconquista</h3>
                                                    <p className="text-gray-700 mb-4">
                                                        Perdeu um território? Você pode reconquistá-lo! E ainda ganha <strong>bônus extra de estrelas</strong> por recuperar o que era seu!
                                                    </p>
                                                    <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg">
                                                        <Trophy className="text-blue-600" size={32} />
                                                        <div>
                                                            <div className="font-black text-blue-800">Bônus de Reconquista</div>
                                                            <div className="text-sm text-blue-600">+50% de estrelas extras ao recuperar seu território!</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* MODALIDADES */}
                                        {activeTab === 'modes' && (
                                            <div className="space-y-6 animate-fade-in">
                                                <div className="bg-gradient-to-r from-green-100 to-cyan-100 p-6 rounded-2xl border-2 border-green-400">
                                                    <div className="flex items-center space-x-3 mb-4">
                                                        <Shield size={32} className="text-green-600" />
                                                        <h2 className="text-2xl font-black text-gray-800">Modalidades & Anti-Fraude</h2>
                                                    </div>
                                                    <p className="text-gray-700 text-lg">
                                                        Escolha sua modalidade antes de iniciar. O sistema valida automaticamente para garantir jogo justo!
                                                    </p>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-xl">
                                                        <div className="text-5xl mb-3">🏃</div>
                                                        <h3 className="text-2xl font-black mb-2">Corrida / Caminhada</h3>
                                                        <div className="space-y-2 mb-4">
                                                            <div className="flex items-center justify-between bg-white/20 px-3 py-2 rounded-lg">
                                                                <span>Velocidade máxima:</span>
                                                                <span className="font-black">{SPEED_LIMITS.running} km/h</span>
                                                            </div>
                                                            <div className="flex items-center justify-between bg-white/20 px-3 py-2 rounded-lg">
                                                                <span>Pontos:</span>
                                                                <span className="font-black">{ACTIVITY_MULTIPLIERS.running * 100}%</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-white/90">
                                                            Inclui caminhada e corrida. Máxima recompensa!
                                                        </p>
                                                    </div>

                                                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white shadow-xl">
                                                        <div className="text-5xl mb-3">🚴</div>
                                                        <h3 className="text-2xl font-black mb-2">Ciclismo</h3>
                                                        <div className="space-y-2 mb-4">
                                                            <div className="flex items-center justify-between bg-white/20 px-3 py-2 rounded-lg">
                                                                <span>Velocidade máxima:</span>
                                                                <span className="font-black">{SPEED_LIMITS.cycling} km/h</span>
                                                            </div>
                                                            <div className="flex items-center justify-between bg-white/20 px-3 py-2 rounded-lg">
                                                                <span>Pontos:</span>
                                                                <span className="font-black">{ACTIVITY_MULTIPLIERS.cycling * 100}%</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-white/90">
                                                            Mais rápido, mas com pontuação reduzida.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="bg-red-50 border-2 border-red-300 p-6 rounded-2xl">
                                                    <div className="flex items-center space-x-3 mb-4">
                                                        <Shield className="text-red-600" size={32} />
                                                        <h3 className="text-xl font-black text-red-800">🛡️ Sistema Anti-Fraude</h3>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
                                                            <div className="font-bold text-red-800 mb-1">Bloqueio Automático</div>
                                                            <p className="text-sm text-gray-700">
                                                                Velocidades acima de <strong>{FRAUD_THRESHOLD} km/h</strong> são bloqueadas automaticamente.
                                                                Nada de carro ou moto! 🚫
                                                            </p>
                                                        </div>
                                                        <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
                                                            <div className="font-bold text-yellow-800 mb-1">Validação de Modalidade</div>
                                                            <p className="text-sm text-gray-700">
                                                                Se você escolheu "Corrida" mas a velocidade média foi de ciclismo, a atividade será invalidada.
                                                            </p>
                                                        </div>
                                                        <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                                                            <div className="font-bold text-blue-800 mb-1">Dados Salvos</div>
                                                            <p className="text-sm text-gray-700">
                                                                Velocidade média e máxima são salvas em cada território para auditoria.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* EQUIPES */}
                                        {activeTab === 'teams' && (
                                            <div className="space-y-6 animate-fade-in">
                                                <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl border-2 border-purple-400">
                                                    <div className="flex items-center space-x-3 mb-4">
                                                        <Users size={32} className="text-purple-600" />
                                                        <h2 className="text-2xl font-black text-gray-800">Sistema de Equipes</h2>
                                                    </div>
                                                    <p className="text-gray-700 text-lg">
                                                        Crie ou entre em uma equipe! Compita em desafios internos e suba no ranking coletivo.
                                                    </p>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                                                        <div className="flex items-center space-x-2 mb-3">
                                                            <Users className="text-purple-500" size={24} />
                                                            <h3 className="font-black text-gray-800">Criar Equipe</h3>
                                                        </div>
                                                        <p className="text-gray-600 text-sm mb-3">
                                                            Seja o dono! Crie sua equipe, gere um link único e convide seus atletas.
                                                        </p>
                                                        <div className="bg-purple-50 p-3 rounded-lg text-xs text-purple-700">
                                                            💡 Como dono, você pode criar desafios exclusivos para sua equipe!
                                                        </div>
                                                    </div>

                                                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                                                        <div className="flex items-center space-x-2 mb-3">
                                                            <Target className="text-pink-500" size={24} />
                                                            <h3 className="font-black text-gray-800">Desafios Internos</h3>
                                                        </div>
                                                        <p className="text-gray-600 text-sm mb-3">
                                                            Donos criam desafios com prazo e pontos. Complete para ganhar estrelas extras!
                                                        </p>
                                                        <div className="bg-pink-50 p-3 rounded-lg text-xs text-pink-700">
                                                            ⏰ Desafios têm data de início e fim. Corra contra o tempo!
                                                        </div>
                                                    </div>

                                                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                                                        <div className="flex items-center space-x-2 mb-3">
                                                            <Trophy className="text-yellow-500" size={24} />
                                                            <h3 className="font-black text-gray-800">Ranking da Equipe</h3>
                                                        </div>
                                                        <p className="text-gray-600 text-sm mb-3">
                                                            Veja quem são os melhores atletas da sua equipe! Ordenado por estrelas totais.
                                                        </p>
                                                        <div className="bg-yellow-50 p-3 rounded-lg text-xs text-yellow-700">
                                                            🏆 Top 3 recebem destaque especial: ouro, prata e bronze!
                                                        </div>
                                                    </div>

                                                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                                                        <div className="flex items-center space-x-2 mb-3">
                                                            <Clock className="text-blue-500" size={24} />
                                                            <h3 className="font-black text-gray-800">Territórios Privados</h3>
                                                        </div>
                                                        <p className="text-gray-600 text-sm mb-3">
                                                            Territórios de desafio são visíveis apenas para membros da equipe!
                                                        </p>
                                                        <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
                                                            🔒 Privacidade garantida! Outras equipes não veem seus desafios.
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                    </div>

                                    {/* Footer */}
                                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-center">
                                        <p className="text-white/80 text-sm mb-3">
                                            Pronto para dominar o território? 🚀
                                        </p>
                                        <button
                                            onClick={onClose}
                                            className="bg-gradient-to-r from-orange-500 to-blue-500 text-white font-black px-8 py-3 rounded-xl hover:shadow-lg transition-all"
                                        >
                                            Começar a Jogar!
                                        </button>
                                    </div>

                                </div>
                            </div>
        </div>
                    );
};
