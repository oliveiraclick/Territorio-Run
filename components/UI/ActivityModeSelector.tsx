import React from 'react';
import { ActivityMode } from '../../types';
import { ACTIVITY_MULTIPLIERS, getActivityEmoji } from '../../utils/activityUtils';
import { RefreshCw, Zap } from 'lucide-react';

interface ActivityModeSelectorProps {
    selectedMode: ActivityMode;
    onSelectMode: (mode: ActivityMode) => void;
}

const ActivityModeSelector: React.FC<ActivityModeSelectorProps> = ({ selectedMode, onSelectMode }) => {
    return (
        <div className="bg-surface-dark border border-white/5 rounded-3xl shadow-2xl p-6 max-w-md mx-auto relative overflow-hidden">
            {/* Glossy Effect */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

            <h3 className="text-xl font-black text-white mb-6 text-center tracking-wide relative z-10">
                ESCOLHA SUA ATIVIDADE
            </h3>

            <div className="space-y-4 relative z-10">
                {/* Corrida/Caminhada */}
                <button
                    onClick={() => onSelectMode('running')}
                    className={`w-full p-5 rounded-2xl border transition-all relative overflow-hidden group ${selectedMode === 'running'
                        ? 'bg-gold-500/10 border-gold-500 text-white'
                        : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5 hover:border-white/20'
                        }`}
                >
                    {selectedMode === 'running' && (
                        <div className="absolute inset-0 bg-gold-500/5 blur-xl"></div>
                    )}

                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border ${selectedMode === 'running' ? 'bg-gold-500 text-black border-gold-400 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-white/5 border-white/10 grayscale opacity-50'}`}>
                                🏃
                            </div>
                            <div className="text-left">
                                <div className={`font-black uppercase tracking-wider text-sm ${selectedMode === 'running' ? 'text-white' : 'text-gray-500'}`}>Corrida / Caminhada</div>
                                <div className="text-[10px] font-bold text-gray-500 bg-black/30 px-2 py-0.5 rounded-full inline-block mt-1">ATÉ 25 KM/H</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-xl font-black ${selectedMode === 'running' ? 'text-gold-500' : 'text-gray-600'}`}>
                                {Math.floor(ACTIVITY_MULTIPLIERS.running * 100)}%
                            </div>
                            <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">DOS PONTOS</div>
                        </div>
                    </div>
                </button>

                {/* Ciclismo */}
                <button
                    onClick={() => onSelectMode('cycling')}
                    className={`w-full p-5 rounded-2xl border transition-all relative overflow-hidden group ${selectedMode === 'cycling'
                        ? 'bg-gold-500/10 border-gold-500 text-white'
                        : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5 hover:border-white/20'
                        }`}
                >
                    {selectedMode === 'cycling' && (
                        <div className="absolute inset-0 bg-gold-500/5 blur-xl"></div>
                    )}

                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border ${selectedMode === 'cycling' ? 'bg-gold-500 text-black border-gold-400 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-white/5 border-white/10 grayscale opacity-50'}`}>
                                🚴
                            </div>
                            <div className="text-left">
                                <div className={`font-black uppercase tracking-wider text-sm ${selectedMode === 'cycling' ? 'text-white' : 'text-gray-500'}`}>Ciclismo</div>
                                <div className="text-[10px] font-bold text-gray-500 bg-black/30 px-2 py-0.5 rounded-full inline-block mt-1">ATÉ 50 KM/H</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-xl font-black ${selectedMode === 'cycling' ? 'text-gold-500' : 'text-gray-600'}`}>
                                {Math.floor(ACTIVITY_MULTIPLIERS.cycling * 100)}%
                            </div>
                            <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">DOS PONTOS</div>
                        </div>
                    </div>
                </button>
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl relative overflow-hidden">
                <div className="flex items-start gap-3 relative z-10">
                    <Zap size={16} className="text-red-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Sistema Anti-Fraude Ativo</p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Velocidades acima de <span className="text-white font-bold">55 km/h</span> suspenderão a atividade automaticamente. Percursos inconsistentes serão invalidados.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityModeSelector;
