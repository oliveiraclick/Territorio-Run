import React from 'react';
import { Play, Square, Locate } from 'lucide-react';

interface ControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onSimulate: () => void;
  isSimulating: boolean;
}

const Controls: React.FC<ControlsProps> = ({ isRunning, onStart, onStop, onSimulate, isSimulating }) => {
  return (
    <div className="absolute bottom-8 left-0 right-0 px-6 z-20 flex flex-col gap-4 items-center">
      
      {/* Simulation Button for Demo Purposes */}
      <button 
        onClick={onSimulate}
        className="text-xs text-gray-500 hover:text-white bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm border border-gray-700 transition-colors"
      >
        {isSimulating ? 'Parar Simulação' : 'Toque para Simular GPS'}
      </button>

      {isRunning ? (
        <button
          onClick={onStop}
          className="w-full max-w-sm bg-neon-red hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(255,7,58,0.5)] transition-all transform active:scale-95 flex items-center justify-center space-x-3 text-lg tracking-widest uppercase"
        >
          <Square fill="currentColor" size={24} />
          <span>Reivindicar Território</span>
        </button>
      ) : (
        <button
          onClick={onStart}
          className="w-full max-w-sm bg-neon-green hover:bg-green-500 text-black font-black py-4 rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.5)] transition-all transform active:scale-95 flex items-center justify-center space-x-3 text-lg tracking-widest uppercase"
        >
          <Play fill="currentColor" size={24} />
          <span>Iniciar Corrida</span>
        </button>
      )}
    </div>
  );
};

export default Controls;