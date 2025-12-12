import React from 'react';
import { ActivityMode } from '../../types';
import { ACTIVITY_MULTIPLIERS } from '../../utils/activityUtils';
import { Zap } from 'lucide-react';

interface ActivityModeSelectorProps {
    selectedMode: ActivityMode;
    onSelectMode: (mode: ActivityMode) => void;
}

const RunnerIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M13.49 5.48C14.59 5.48 15.49 4.58 15.49 3.48C15.49 2.38 14.59 1.48 13.49 1.48C12.39 1.48 11.49 2.38 11.49 3.48C11.49 4.58 12.39 5.48 13.49 5.48ZM9.89 19.38L10.89 14.98L12.99 16.98V22.98H14.99V15.48L12.89 13.48L13.49 10.48C14.79 11.98 16.79 12.98 18.99 12.98V10.98C17.09 10.98 15.49 9.98 14.69 8.58L13.69 6.98C13.29 6.38 12.69 5.98 11.99 5.98C11.69 5.98 11.49 6.08 11.19 6.08L5.99 8.28V12.98H7.99V9.58L9.79 8.88L9.89 19.38Z" />
    </svg>
);

const BikeIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M15.5 5.5C16.6 5.5 17.5 4.6 17.5 3.5C17.5 2.4 16.6 1.5 15.5 1.5C14.4 1.5 13.5 2.4 13.5 3.5C13.5 4.6 14.4 5.5 15.5 5.5ZM5 12C2.2 12 0 14.2 0 17C0 19.8 2.2 22 5 22C7.8 22 10 19.8 10 17C10 14.2 7.8 12 5 12ZM5 20.5C3.1 20.5 1.5 18.9 1.5 17C1.5 15.1 3.1 13.5 5 13.5C6.9 13.5 8.5 15.1 8.5 17C8.5 18.9 6.9 20.5 5 20.5ZM10.8 12.5C11.1 12 11.4 11.4 11.7 10.9L12.9 12.1C12.6 12.6 12.3 13.2 12 13.7L10.8 12.5ZM19.5 12C16.7 12 14.5 14.2 14.5 17C14.5 19.8 16.7 22 19.5 22C22.3 22 24.5 19.8 24.5 17C24.5 14.2 22.3 12 19.5 12ZM19.5 20.5C17.6 20.5 16 18.9 16 17C16 15.1 17.6 13.5 19.5 13.5C21.4 13.5 23 15.1 23 17C23 18.9 21.4 20.5 19.5 20.5ZM17 12.5L14.6 10.1L16.7 8C17.8 8.4 19 8.6 20.1 8.6V10.6C19 10.6 17.9 10.4 17 12.5Z" />
    </svg>
);


const ActivityModeSelector: React.FC<ActivityModeSelectorProps> = ({ selectedMode, onSelectMode }) => {
    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-1 space-y-4 px-1 py-2">

                {/* Mode: RUNNING */}
                <button
                    onClick={() => onSelectMode('running')}
                    className={`w-full relative group transition-all duration-300 rounded-3xl border-2 text-left h-36 flex items-end p-6 overflow-hidden ${selectedMode === 'running'
                        ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]'
                        : 'border-white/10 hover:border-white/30'
                        }`}
                >
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/assets/running_bg.png"
                            alt="Running"
                            className={`w-full h-full object-cover transition-all duration-500 ${selectedMode === 'running'
                                ? 'grayscale-0 scale-110 brightness-110'
                                : 'grayscale brightness-50 group-hover:brightness-75 group-hover:scale-105'}`}
                        />
                        {/* Gradient Overlay for Text Readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    </div>

                    <div className="relative z-10 w-full flex justify-between items-end">
                        <div>
                            <h4 className={`text-3xl font-black italic uppercase tracking-wider mb-1 ${selectedMode === 'running' ? 'text-white' : 'text-gray-300'}`}>
                                Corrida
                            </h4>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-sm">
                                <span className="text-[10px] font-bold tracking-widest uppercase text-yellow-500">
                                    Até 18km/h
                                </span>
                            </div>
                        </div>

                        {selectedMode === 'running' && (
                            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                                <div className="w-2.5 h-2.5 bg-black rounded-full" />
                            </div>
                        )}
                    </div>
                </button>

                {/* Mode: CYCLING */}
                <button
                    onClick={() => onSelectMode('cycling')}
                    className={`w-full relative group transition-all duration-300 rounded-3xl border-2 text-left h-36 flex items-end p-6 overflow-hidden ${selectedMode === 'cycling'
                        ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]'
                        : 'border-white/10 hover:border-white/30'
                        }`}
                >
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/assets/cycling_bg.png"
                            alt="Cycling"
                            className={`w-full h-full object-cover transition-all duration-500 ${selectedMode === 'cycling'
                                ? 'grayscale-0 scale-110 brightness-110'
                                : 'grayscale brightness-50 group-hover:brightness-75 group-hover:scale-105'}`}
                        />
                        {/* Gradient Overlay for Text Readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    </div>

                    <div className="relative z-10 w-full flex justify-between items-end">
                        <div className="flex-1">
                            <h4 className={`text-3xl font-black italic uppercase tracking-wider mb-1 ${selectedMode === 'cycling' ? 'text-white' : 'text-gray-300'}`}>
                                Ciclismo
                            </h4>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-sm">
                                <span className="text-[10px] font-bold tracking-widest uppercase text-yellow-500">
                                    Até 50km/h
                                </span>
                            </div>
                        </div>

                        {selectedMode === 'cycling' && (
                            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                                <div className="w-2.5 h-2.5 bg-black rounded-full" />
                            </div>
                        )}
                    </div>
                </button>
            </div>

            {/* Warning Footer */}
            <div className="mt-4 bg-red-900/10 border border-red-500/10 rounded-xl p-3 flex gap-3 items-center">
                <Zap className="text-red-500 shrink-0" size={16} />
                <p className="text-[10px] text-gray-400">
                    <span className="text-red-400 font-bold uppercase mr-1">Aviso:</span>
                    Velocidades incompatíveis anularão a atividade.
                </p>
            </div>
        </div>
    );
};

export default ActivityModeSelector;
