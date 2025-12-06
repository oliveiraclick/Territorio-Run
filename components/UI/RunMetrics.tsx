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
        <div className="absolute top-20 left-4 right-4 z-10">
            <div className="bg-white/95 backdrop-blur-xl rounded-full border border-gray-200 shadow-lg px-4 py-2">
                <div className="flex items-center justify-between gap-3">
                    {/* Status Indicator */}
                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-green-700 uppercase tracking-wider hidden sm:inline">
                            Ativo
                        </span>
                    </div>

                    {/* Metrics - Horizontal Layout */}
                    <div className="flex items-center gap-4 flex-1 justify-around">
                        {metrics.map((metric, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-1.5 group"
                                title={metric.label}
                            >
                                <div className={`p-1 rounded-lg bg-gradient-to-br ${metric.color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
                                    <div className="text-gray-700">
                                        {React.cloneElement(metric.icon as React.ReactElement, { size: 14 })}
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-0.5">
                                    <span className="text-sm font-black text-gray-800 tabular-nums">
                                        {metric.value}
                                    </span>
                                    {metric.unit && (
                                        <span className="text-[9px] text-gray-500 font-bold">
                                            {metric.unit}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pace Info - Compact */}
                    {avgPace > 0 && avgPace < 100 && (
                        <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full flex-shrink-0">
                            <span className="text-[8px] text-gray-600 uppercase tracking-wider hidden sm:inline">Ritmo:</span>
                            <span className="text-[10px] font-bold text-gray-800 tabular-nums">{formatPace(avgPace)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
