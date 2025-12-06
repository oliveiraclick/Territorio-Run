import React from 'react';
import { Star, MapPin, Zap, Moon, Trophy, TrendingUp, X } from 'lucide-react';
import { STAR_REWARDS } from '../../utils/starSystem';

interface TutorialScreenProps {
    onClose: () => void;
}

export const TutorialScreen: React.FC<TutorialScreenProps> = ({ onClose }) => {
    const rewards = [
        {
            icon: <MapPin className="text-neon-green" />,
            title: 'Conquistar Território',
            stars: STAR_REWARDS.CONQUER_TERRITORY,
            description: 'Complete uma corrida e reivindique a área percorrida',
        },
        {
            icon: <TrendingUp className="text-blue-400" />,
            title: 'Distância Percorrida',
            stars: STAR_REWARDS.DISTANCE_KM,
            description: 'Ganhe estrelas a cada quilômetro corrido',
        },
        {
            icon: <Moon className="text-purple-400" />,
            title: 'Conquista Noturna',
            stars: STAR_REWARDS.NIGHT_CONQUEST,
            description: 'Bônus especial para conquistas entre 22h e 6h',
        },
        {
            icon: <Trophy className="text-yellow-400" />,
            title: 'Território Grande',
            stars: STAR_REWARDS.LARGE_TERRITORY,
            description: 'Conquiste áreas maiores que 10.000m²',
        },
        {
            icon: <Zap className="text-orange-400" />,
            title: 'Primeira Corrida',
            stars: STAR_REWARDS.FIRST_RUN,
            description: 'Bônus único ao completar sua primeira conquista',
        },
    ];

    return (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-gradient-to-br from-gray-900 to-black max-w-2xl w-full rounded-2xl border-2 border-neon-green/30 shadow-[0_0_50px_rgba(57,255,20,0.3)] max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-black border-b border-neon-green/30 p-6 flex items-center justify-between z-10">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-1">Como Jogar</h1>
                        <p className="text-gray-400 text-sm">Domine as ruas e conquiste territórios</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-red-500/20 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Passo a Passo */}
                    <section>
                        <h2 className="text-xl font-black text-neon-green mb-4 flex items-center space-x-2">
                            <MapPin size={24} />
                            <span>Conquistando Territórios</span>
                        </h2>

                        <div className="space-y-3">
                            {[
                                {
                                    step: '1',
                                    title: 'Permita o GPS',
                                    description: 'Autorize o acesso à sua localização para começar',
                                },
                                {
                                    step: '2',
                                    title: 'Inicie a Corrida',
                                    description: 'Clique no botão PLAY para começar a capturar território',
                                },
                                {
                                    step: '3',
                                    title: 'Movimente-se',
                                    description: 'Corra, ande ou pedale. Cada movimento expande sua área',
                                },
                                {
                                    step: '4',
                                    title: 'Pare e Reivindique',
                                    description: 'Clique em STOP para finalizar e conquistar o território',
                                },
                                {
                                    step: '5',
                                    title: 'Nomeie seu Território',
                                    description: 'Dê um nome épico para sua conquista (ou use a sugestão da IA)',
                                },
                            ].map((item) => (
                                <div
                                    key={item.step}
                                    className="flex items-start space-x-4 bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 hover:border-neon-green/50 transition-all"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-green to-green-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(57,255,20,0.4)]">
                                        <span className="text-lg font-black text-black">{item.step}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white mb-1">{item.title}</h3>
                                        <p className="text-sm text-gray-400">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Sistema de Estrelas */}
                    <section>
                        <h2 className="text-xl font-black text-yellow-400 mb-4 flex items-center space-x-2">
                            <Star size={24} className="fill-yellow-400" />
                            <span>Como Ganhar Estrelas</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {rewards.map((reward, index) => (
                                <div
                                    key={index}
                                    className="bg-gradient-to-br from-gray-900/80 to-black/80 p-4 rounded-xl border border-gray-700/50 hover:border-yellow-400/50 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="p-2 rounded-lg bg-gray-800/50">
                                            {reward.icon}
                                        </div>
                                        <div className="flex items-center space-x-1 bg-yellow-400/10 px-2 py-1 rounded-full border border-yellow-400/30">
                                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                            <span className="text-sm font-black text-yellow-400">+{reward.stars}</span>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-white text-sm mb-1">{reward.title}</h3>
                                    <p className="text-xs text-gray-400">{reward.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Dicas */}
                    <section>
                        <h2 className="text-xl font-black text-blue-400 mb-4">💡 Dicas Pro</h2>

                        <div className="space-y-2">
                            {[
                                'Conquistas noturnas (22h-6h) valem mais estrelas!',
                                'Territórios maiores dão mais pontos estratégicos',
                                'Use o modo simulação para testar sem sair de casa',
                                'A IA gera nomes criativos baseados na sua localização',
                                'Quanto mais você joga, mais rápido sobe de nível',
                            ].map((tip, index) => (
                                <div
                                    key={index}
                                    className="flex items-start space-x-3 bg-blue-500/5 p-3 rounded-lg border border-blue-500/20"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                                    <p className="text-sm text-gray-300">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Botão de Começar */}
                    <button
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-neon-green to-green-500 text-black font-black py-4 rounded-xl shadow-[0_0_30px_rgba(57,255,20,0.4)] hover:shadow-[0_0_40px_rgba(57,255,20,0.6)] transition-all transform hover:scale-[1.02] active:scale-95 uppercase tracking-wider text-lg"
                    >
                        🚀 Começar a Conquistar!
                    </button>
                </div>
            </div>
        </div>
    );
};
