import React from 'react';
import { Activity, MapPin, Trophy, Timer } from 'lucide-react';

interface StatPanelProps {
  distance: number;
  territoriesCount: number;
  isRunning: boolean;
  time?: number; // Optional prop if we want to show timer here too
}

const StatPanel: React.FC<StatPanelProps> = ({ distance, territoriesCount, isRunning, time = 0 }) => {
  if (!isRunning && distance === 0) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute bottom-[90px] left-4 right-4 z-20 pointer-events-none transition-all duration-500 ease-out transform translate-y-0 opacity-100">
      {/* Clean White Card */}
      <div className="bg-white text-black rounded-2xl shadow-xl p-4 mx-auto max-w-sm pointer-events-auto border-t-4 border-gold-500 flex justify-between items-center">

        {/* Distance */}
        <div className="flex flex-col items-center w-1/3 border-r border-gray-100">
          <div className="flex items-center gap-1 text-gold-600 mb-1">
            <MapPin size={16} />
          </div>
          <span className="text-2xl font-black font-sans leading-none">
            {distance.toFixed(2)}
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase">km</span>
        </div>

        {/* Time (or Territories if time not provided) */}
        <div className="flex flex-col items-center w-1/3 border-r border-gray-100">
          <div className="flex items-center gap-1 text-gold-600 mb-1">
            {time > 0 ? <Timer size={16} /> : <Trophy size={16} />}
          </div>
          <span className="text-2xl font-black font-sans leading-none">
            {time > 0 ? formatTime(time) : territoriesCount}
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase">{time > 0 ? 'Tempo' : 'Territórios'}</span>
        </div>

        {/* Status / Pace */}
        <div className="flex flex-col items-center w-1/3">
          <div className="flex items-center gap-1 text-gold-600 mb-1">
            <Activity size={16} />
          </div>
          <span className={`text-sm font-bold uppercase ${isRunning ? 'text-green-600 animate-pulse' : 'text-gray-400'}`}>
            {isRunning ? 'Ativo' : 'Parado'}
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
        </div>

      </div>
    </div>
  );
};

export default StatPanel;
