import React from 'react';
import { ActivityMode } from '../../types';
import { ACTIVITY_MULTIPLIERS, getActivityEmoji } from '../../utils/activityUtils';

interface ActivityModeSelectorProps {
    selectedMode: ActivityMode;
    onSelectMode: (mode: ActivityMode) => void;
}

const ActivityModeSelector: React.FC<ActivityModeSelectorProps> = ({ selectedMode, onSelectMode }) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
            <h3 className="text-xl font-black text-gray-800 mb-4 text-center">
                Escolha sua atividade
            </h3>

            <div className="space-y-3">
                {/* Corrida/Caminhada */}
                <button
                    onClick={() => onSelectMode('running')}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${selectedMode === 'running'
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="text-3xl">🏃</div>
                            <div className="text-left">
                                <div className="font-bold text-gray-800">Corrida / Caminhada</div>
                                <div className="text-xs text-gray-600">Até 25 km/h</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-black text-green-600">
                                {Math.floor(ACTIVITY_MULTIPLIERS.running * 100)}%
                            </div>
                            <div className="text-xs text-gray-500">dos pontos</div>
                        </div>
                    </div>
                </button>

                {/* Ciclismo */}
                <button
                    onClick={() => onSelectMode('cycling')}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${selectedMode === 'cycling'
                            ? 'border-orange-500 bg-orange-50 shadow-md'
                            : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="text-3xl">🚴</div>
                            <div className="text-left">
                                <div className="font-bold text-gray-800">Ciclismo</div>
                                <div className="text-xs text-gray-600">Até 50 km/h</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-black text-orange-600">
                                {Math.floor(ACTIVITY_MULTIPLIERS.cycling * 100)}%
                            </div>
                            <div className="text-xs text-gray-500">dos pontos</div>
                        </div>
                    </div>
                </button>
            </div>

            {/* Info */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                    <strong>🛡️ Anti-Fraude:</strong> Velocidades acima de 55 km/h serão bloqueadas automaticamente.
                </p>
            </div>
        </div>
    );
};

export default ActivityModeSelector;
