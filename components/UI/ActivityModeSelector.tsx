import React from 'react';
import { ActivityMode } from '../../types';
import { ACTIVITY_MULTIPLIERS } from '../../utils/activityUtils';
import { Zap, Footprints, Bike } from 'lucide-react';

interface ActivityModeSelectorProps {
    selectedMode: ActivityMode;
    onSelectMode: (mode: ActivityMode) => void;
}

const ActivityModeSelector: React.FC<ActivityModeSelectorProps> = ({ selectedMode, onSelectMode }) => {
    return (
        <div className="w-full h-full flex flex-col">
            {/* Header */}
            <div className="text-center mb-8">
                <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">
                    Qual a missão de hoje?
                </h3>
                <p className="text-gray-400 text-sm">Selecione seu modo de conquista</p>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-2">
                {/* Corrida Card */}
                <button
                    onClick={() => onSelectMode('running')}
                    className={`w-full relative group transition-all duration-300 rounded-3xl overflow-hidden border-2 text-left p-6 h-48 flex flex-col justify-between ${selectedMode === 'running'
                            ? 'border-gold-500 bg-gold-500/10 shadow-[0_0_30px_rgba(234,179,8,0.3)]'
                            : 'border-white/10 bg-surface-dark hover:border-gold-500/50'
                        }`}
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Footprints size={120} />
                    </div>

                    <div className="relative z-10">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${selectedMode === 'running' ? 'bg-gold-500 text-black' : 'bg-white/10 text-white'
                            }`}>
                            <Footprints size={24} />
                        </div>
                        <h4 className="text-2xl font-black text-white italic uppercase">Corrida</h4>
                        <p className="text-xs text-gray-400 font-bold tracking-wide mt-1">ATÉ 25 KM/H</p>
                    </div>

                    <div className="relative z-10 flex items-center justify-between mt-auto">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${selectedMode === 'running' ? 'bg-gold-500 text-black' : 'bg-white/10 text-gray-400'
                            }`}>
                            PADRÃO
                        </span>
                        <div className="text-right">
                            <div className="text-2xl font-black text-white">{Math.floor(ACTIVITY_MULTIPLIERS.running * 100)}%</div>
                            <div className="text-[8px] text-gray-400 uppercase tracking-widest">PONTOS</div>
                        </div>
                    </div>
                </button>

                {/* Ciclismo Card */}
                <button
                    onClick={() => onSelectMode('cycling')}
                    className={`w-full relative group transition-all duration-300 rounded-3xl overflow-hidden border-2 text-left p-6 h-48 flex flex-col justify-between ${selectedMode === 'cycling'
                            ? 'border-neon-blue bg-neon-blue/10 shadow-[0_0_30px_rgba(0,243,255,0.3)]'
                            : 'border-white/10 bg-surface-dark hover:border-neon-blue/50'
                        }`}
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Bike size={120} />
                    </div>

                    <div className="relative z-10">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${selectedMode === 'cycling' ? 'bg-neon-blue text-black' : 'bg-white/10 text-white'
                            }`}>
                            <Bike size={24} />
                        </div>
                        <h4 className="text-2xl font-black text-white italic uppercase">Ciclismo</h4>
                        <p className="text-xs text-gray-400 font-bold tracking-wide mt-1">ATÉ 50 KM/H</p>
                    </div>

                    <div className="relative z-10 flex items-center justify-between mt-auto">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${selectedMode === 'cycling' ? 'bg-neon-blue text-black' : 'bg-white/10 text-gray-400'
                            }`}>
                            ALTA VELOCIDADE
                        </span>
                        <div className="text-right">
                            <div className="text-2xl font-black text-white">{Math.floor(ACTIVITY_MULTIPLIERS.cycling * 100)}%</div>
                            <div className="text-[8px] text-gray-400 uppercase tracking-widest">PONTOS</div>
                        </div>
                    </div>
                </button>
            </div>

            {/* Warning Footer */}
            <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3">
                <Zap className="text-red-500 shrink-0" size={20} />
                <p className="text-[10px] text-gray-300 leading-relaxed">
                    <strong className="text-red-400 block mb-0.5">ANTI-FRAUDE ATIVO</strong>
                    Velocidades incompatíveis com a modalidade anularão a atividade e poderão bloquear sua conta.
                </p>
            </div>
        </div>
    );
};

export default ActivityModeSelector;
