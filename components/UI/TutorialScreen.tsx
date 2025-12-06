import React from 'react';
import { Star, MapPin, Zap, Moon, Trophy, TrendingUp, X } from 'lucide-react';
import { STAR_REWARDS } from '../../utils/starSystem';

interface TutorialScreenProps {
    onClose: () => void;
}

export const TutorialScreen: React.FC<TutorialScreenProps> = ({ onClose }) => {
    const rewards = [
        {
            icon: <MapPin className="text-orange-500" />,
            title: 'Conquistar Território',
            stars: STAR_REWARDS.CONQUER_TERRITORY,
            description: 'Complete um treino e reivindique a área percorrida',
        },
        {
            icon: <TrendingUp className="text-blue-500" />,
            title: 'Distância Percorrida',
            stars: STAR_REWARDS.DISTANCE_KM,
            description: 'Ganhe estrelas a cada quilômetro percorrido',
        },
        {
            icon: <Moon className="text-purple-500" />,
            title: 'Conquista Noturna',
            stars: STAR_REWARDS.NIGHT_CONQUEST,
            description: 'Bônus especial para conquistas entre 22h e 6h',
        },
        {
            icon: <Trophy className="text-yellow-500" />,
            title: 'Território Grande',
            stars: STAR_REWARDS.LARGE_TERRITORY,
            description: 'Conquiste áreas maiores que 10.000m²',
        },
        {
            icon: <Zap className="text-orange-500" />,
            title: 'Primeira Corrida',
            stars: STAR_REWARDS.FIRST_RUN,
            description: 'Bônus único ao completar sua primeira atividade',
        },
    ];

    return (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-blue-500 p-6 flex items-center justify-between z-10 rounded-t-2xl">
                    <div>
                        <h1 className="text-2xl font-black text-white mb-1">Como Jogar</h1>
                        <p className="text-white/80 text-sm">Domine as ruas e conquiste territórios</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6 bg-gradient-to-br from-orange-50 via-blue-50 to-cyan-50">

                    {/* Passo a Passo */}
                    <section>
                        <h2 className="text-xl font-black text-orange-600 mb-4 flex items-center space-x-2">
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
                                    title: 'Inicie o Treino',
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
                                    className="flex items-start space-x-4 bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-orange-400 transition-all shadow-sm"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-md">
                                        <span className="text-lg font-black text-white">{item.step}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                                        <p className="text-sm text-gray-600">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Sistema de Estrelas */}
                    <section>
                        <h2 className="text-xl font-black text-yellow-600 mb-4 flex items-center space-x-2">
                            <Star size={24} className="fill-yellow-500" />
                            <span>Como Ganhar Estrelas</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {rewards.map((reward, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-yellow-400 transition-all shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="p-2 rounded-lg bg-gray-100">
                                            {reward.icon}
                                        </div>
                                        <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-400">
                                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                            <span className="text-sm font-black text-yellow-700">+{reward.stars}</span>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-sm mb-1">{reward.title}</h3>
                                    <p className="text-xs text-gray-600">{reward.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Dicas */}
                    <section>
                        <h2 className="text-xl font-black text-blue-600 mb-4">💡 Dicas Pro</h2>

                        <div className="space-y-2">
                            {[
                                'Conquistas noturnas (22h-6h) valem mais estrelas!',
                                'Territórios maiores dão mais pontos estratégicos',
                                'Use o modo simulação para testar sem sair de casa',
                                'A IA gera nomes criativos baseados na sua localização',
                                'Quanto mais você treina, mais rápido sobe de nível',
                            ].map((tip, index) => (
                                <div
                                    key={index}
                                    className="flex items-start space-x-3 bg-blue-50 p-3 rounded-lg border border-blue-200"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                    <p className="text-sm text-gray-700">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Botão de Começar */}
                    <button
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-orange-500 to-blue-500 text-white font-black py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 uppercase tracking-wider text-lg"
                    >
                        🚀 Começar a Conquistar!
                    </button>
                </div>
            </div>
        </div>
    );
};
