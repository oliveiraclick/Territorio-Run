import React, { useState, useEffect } from 'react';
import { MapPin, Check, X } from 'lucide-react';

interface NamingModalProps {
  isOpen: boolean;
  suggestedName: string;
  suggestedDescription: string;
  strategicValue: number;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

const NamingModal: React.FC<NamingModalProps> = ({
  isOpen,
  suggestedName,
  suggestedDescription,
  strategicValue,
  onConfirm,
  onCancel
}) => {
  const [name, setName] = useState(suggestedName);

  useEffect(() => {
    setName(suggestedName);
  }, [suggestedName]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-panel-bg border border-neon-green rounded-2xl w-full max-w-md p-6 shadow-[0_0_50px_rgba(57,255,20,0.2)] text-white relative">
        
        <h2 className="text-xl font-black italic uppercase tracking-widest text-center mb-6 text-neon-green">
          Território Conquistado!
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase text-gray-400 font-bold mb-1 ml-1">
              Nome do Território
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/50 border border-gray-600 rounded-lg p-3 text-white focus:border-neon-green focus:outline-none focus:ring-1 focus:ring-neon-green transition-all font-mono text-lg"
              placeholder="Ex: Zona Norte Alpha"
              autoFocus
            />
            <p className="text-[10px] text-gray-500 mt-1 ml-1">
              * O local real será visível no mapa para todos os rivais.
            </p>
          </div>

          <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
             <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400 uppercase">Valor Estratégico</span>
                <span className="text-xl font-bold text-yellow-400">{strategicValue} PTS</span>
             </div>
             <p className="text-sm text-gray-300 italic">"{suggestedDescription}"</p>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-gray-700 hover:bg-gray-800 text-gray-300 font-bold uppercase text-sm transition-colors"
          >
            Descartar
          </button>
          <button
            onClick={() => onConfirm(name)}
            className="flex-1 bg-neon-green hover:bg-green-400 text-black font-black py-3 rounded-xl shadow-[0_0_15px_rgba(57,255,20,0.4)] uppercase text-sm transition-transform active:scale-95"
          >
            Reivindicar
          </button>
        </div>

      </div>
    </div>
  );
};

export default NamingModal;