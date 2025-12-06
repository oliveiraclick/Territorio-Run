
import React from 'react';
import { Activity, MapPin, Trophy } from 'lucide-react';

interface StatPanelProps {
  distance: number;
  territoriesCount: number;
  isRunning: boolean;
  pace?: string;
}

const StatPanel: React.FC<StatPanelProps> = ({ distance, territoriesCount, isRunning }) => {
  return (
    <div className="absolute top-24 left-4 right-4 bg-panel-bg backdrop-blur-md rounded-2xl p-4 border border-gray-800 shadow-xl z-10 flex justify-between items-center text-white transition-all duration-300">
      <div className="flex flex-col items-center w-1/3">
        <div className="flex items-center space-x-2 text-gray-400 text-xs uppercase tracking-wider">
          <MapPin size={14} />
          <span>Distância</span>
        </div>
        <span className="text-2xl font-bold font-mono text-neon-green">
          {distance.toFixed(2)} <span className="text-sm">km</span>
        </span>
      </div>

      <div className="h-10 w-px bg-gray-700"></div>

      <div className="flex flex-col items-center w-1/3">
        <div className="flex items-center space-x-2 text-gray-400 text-xs uppercase tracking-wider">
          <Trophy size={14} />
          <span>Territórios</span>
        </div>
        <span className="text-2xl font-bold font-mono text-yellow-400">
          {territoriesCount}
        </span>
      </div>

      <div className="h-10 w-px bg-gray-700"></div>

      <div className="flex flex-col items-center w-1/3">
        <div className="flex items-center space-x-2 text-gray-400 text-xs uppercase tracking-wider">
          <Activity size={14} />
          <span>Status</span>
        </div>
        <span className={`text-sm font-bold uppercase ${isRunning ? 'text-neon-red animate-pulse' : 'text-gray-400'}`}>
          {isRunning ? 'Conquistando' : 'Parado'}
        </span>
      </div>
    </div>
  );
};

export default StatPanel;
