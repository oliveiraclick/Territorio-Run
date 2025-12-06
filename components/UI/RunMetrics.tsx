import React, { useEffect, useState } from 'react';
import { Coordinate } from '../../types';
import {
    calculatePolygonArea,
    calculateAveragePace,
    calculateCurrentSpeed,
    formatDuration,
    formatPace,
    formatArea
} from '../../utils/metricsCalculator';
import { Activity, Clock, Zap, Map } from 'lucide-react';

interface RunMetricsProps {
    coordinates: Coordinate[];
    distance: number;
    startTime: number;
    isRunning: boolean;
}

export const RunMetrics: React.FC<RunMetricsProps> = ({
    coordinates,
    distance,
    startTime,
    isRunning
}) => {
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(interval);
    }, [isRunning]);

    const duration = Math.floor((currentTime - startTime) / 1000);
    const area = calculatePolygonArea(coordinates);
    const avgPace = calculateAveragePace(distance, duration);
    const currentSpeed = calculateCurrentSpeed(coordinates);

    const metrics: Array<{
        icon: React.ReactNode;
        label: string;
        value: string;
        unit: string;
        color: string;
    }> = [
            {
                icon: <Map size={20} />,
                label: 'Área',
                value: formatArea(area).split(/[a-zA-Z²]+/)[0],
                unit: formatArea(area).match(/[a-zA-Z²]+/)?.[0] || '',
                color: 'from-purple-500 to-pink-500',
            },
            {
                icon: <Activity size={20} />,
                label: 'Distância',
                value: distance.toFixed(2),
                unit: 'km',
                color: 'from-orange-500 to-red-400',
            },
            {
                icon: <Clock size={20} />,
                label: 'Duração',
                value: formatDuration(duration),
                unit: '',
                color: 'from-blue-500 to-cyan-400',
            },
            {
                icon: <Zap size={20} />,
                label: 'Velocidade',
                value: currentSpeed.toFixed(1),
                unit: 'km/h',
                color: 'from-yellow-500 to-orange-400',
            },
        ];

    return (
        <div className="absolute bottom-24 left-0 right-0 z-10 px-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-xl p-4">
                {/* Status Header */}
                <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center space-x-2 bg-green-50 px-4 py-1.5 rounded-full border border-green-200">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm" />
                        <span className="text-xs font-bold text-green-700 uppercase tracking-widest">
                            Captura em Progresso
                        </span>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {metrics.map((metric, index) => (
                        <div
                            key={index}
                            className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 border border-gray-200 hover:border-orange-300 transition-all shadow-sm"
                        >
                            <div className="flex items-center space-x-2 mb-2">
                                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${metric.color} bg-opacity-10`}>
                                    <div className="text-gray-700">
                                        {metric.icon}
                                    </div>
                                </div>
                                <span className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">
                                    {metric.label}
                                </span>
                            </div>

                            <div className="flex items-baseline space-x-1">
                                <span className="text-2xl font-black text-gray-800 tabular-nums">
                                    {metric.value}
                                </span>
                                {metric.unit && (
                                    <span className="text-xs text-gray-500 font-bold">
                                        {metric.unit}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pace Info */}
                {avgPace > 0 && avgPace < 100 && (
                    <div className="mt-3 text-center">
                        <div className="inline-flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                            <span className="text-[10px] text-gray-600 uppercase tracking-wider">Ritmo Médio:</span>
                            <span className="text-sm font-bold text-gray-800 tabular-nums">{formatPace(avgPace)}/km</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
