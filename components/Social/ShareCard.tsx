import React, { useRef } from 'react';
import { Territory, User } from '../../types';
import { MapPin, Trophy, Clock, Zap } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ShareCardProps {
    territory: Territory;
    user: User;
    onClose: () => void;
}

export const ShareCard: React.FC<ShareCardProps> = ({ territory, user, onClose }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleShare = async () => {
        if (!cardRef.current) return;

        try {
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                backgroundColor: null,
                scale: 2 // High resolution
            });

            const image = canvas.toDataURL("image/png");

            // Tentar compartilhar nativamente
            if (navigator.share) {
                const blob = await (await fetch(image)).blob();
                const file = new File([blob], "conquista.png", { type: "image/png" });
                await navigator.share({
                    title: 'Conquistei um Território!',
                    text: `Acabei de conquistar ${territory.name} no Territory Run!`,
                    files: [file]
                });
            } else {
                // Fallback para download
                const link = document.createElement('a');
                link.href = image;
                link.download = `conquista-${territory.name}.png`;
                link.click();
            }
            onClose();
        } catch (error) {
            console.error("Erro ao compartilhar:", error);
            alert("Erro ao gerar imagem. Tente novamente.");
        }
    };

    return (
        <div className="fixed inset-0 z-[10002] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-sm w-full">
                {/* CARD PARA CAPTURA */}
                <div ref={cardRef} className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800 relative">
                    {/* Background Neon Grid */}
                    <div className="absolute inset-0 z-0 opacity-20" style={{
                        backgroundImage: 'linear-gradient(#39ff14 1px, transparent 1px), linear-gradient(90deg, #39ff14 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}></div>

                    {/* Top Brand */}
                    <div className="bg-gradient-to-r from-gray-900 to-black p-4 flex items-center justify-between z-10 relative">
                        <div className="flex items-center space-x-2">
                            <img src="/brand-logo-login.png" className="h-8 w-auto" alt="Logo" />
                            <span className="text-white font-black tracking-widest text-xs">TERRITORY RUN</span>
                        </div>
                        <div className="bg-neon-green/20 text-neon-green px-2 py-1 rounded text-[10px] font-bold border border-neon-green/50">
                            NOVA CONQUISTA
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-6 relative z-10 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 p-1 mb-4 shadow-[0_0_30px_rgba(255,165,0,0.4)]">
                            <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center border-4 border-white">
                                <MapPin size={40} className="text-white" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-black text-white italic uppercase tracking-wider mb-1">
                            {territory.name}
                        </h2>

                        <div className="flex items-center justify-center space-x-2 mb-6">
                            <span className="text-gray-400 text-xs">CONQUISTADO POR</span>
                            <span className="text-neon-green font-bold text-sm bg-newsletter-green/10 px-2 rounded">
                                @{user.name.toUpperCase()}
                            </span>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 w-full mb-6">
                            <div className="bg-gray-800/50 p-2 rounded-lg border border-gray-700">
                                <Trophy size={16} className="text-yellow-400 mx-auto mb-1" />
                                <div className="text-lg font-black text-white">{territory.value}</div>
                                <div className="text-[9px] text-gray-500 uppercase">Estrelas</div>
                            </div>
                            <div className="bg-gray-800/50 p-2 rounded-lg border border-gray-700">
                                <Zap size={16} className="text-blue-400 mx-auto mb-1" />
                                <div className="text-lg font-black text-white">{territory.activityMode === 'cycling' ? 'Bike' : 'Run'}</div>
                                <div className="text-[9px] text-gray-500 uppercase">Modo</div>
                            </div>
                            <div className="bg-gray-800/50 p-2 rounded-lg border border-gray-700">
                                <Clock size={16} className="text-purple-400 mx-auto mb-1" />
                                <div className="text-lg font-black text-white">Agora</div>
                                <div className="text-[9px] text-gray-500 uppercase">Data</div>
                            </div>
                        </div>

                        <div className="text-[10px] text-gray-600 font-mono">
                            territory.run/app
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl bg-gray-800 text-white font-bold"
                    >
                        Fechar
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold shadow-lg flex items-center justify-center space-x-2"
                    >
                        <span>Compartilhar 📸</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
