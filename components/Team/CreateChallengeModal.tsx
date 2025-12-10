import React, { useState } from 'react';
import { X, Target, Calendar, Award } from 'lucide-react';

interface CreateChallengeModalProps {
    isOpen: boolean;
    teamName: string;
    onClose: () => void;
    onCreateChallenge: (name: string, description: string, points: number, startDate: number, endDate: number) => void;
}

const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({
    isOpen,
    teamName,
    onClose,
    onCreateChallenge
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [points, setPoints] = useState(100);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSubmit = () => {
        if (!name.trim()) {
            alert('Digite um nome para o desafio');
            return;
        }

        if (!startDate || !endDate) {
            alert('Defina as datas de início e fim');
            return;
        }

        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();

        if (end <= start) {
            alert('A data de fim deve ser posterior à data de início');
            return;
        }

        onCreateChallenge(name, description, points, start, end);
        handleClose();
    };

    const handleClose = () => {
        setName('');
        setDescription('');
        setPoints(100);
        setStartDate('');
        setEndDate('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-dark-bg max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden border border-white/10">
                {/* Header */}
                <div className="bg-black/90 p-6 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center space-x-3">
                        <Target className="text-neon-purple" size={28} />
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-wide">Criar Desafio</h2>
                            <p className="text-neon-purple text-sm font-bold uppercase tracking-wider">{teamName}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Nome do Desafio */}
                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">
                            Nome do Desafio *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Corrida do Parque"
                            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple/50 focus:outline-none text-white font-semibold placeholder-gray-600 transition-colors"
                            maxLength={50}
                        />
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">
                            Descrição (opcional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descreva o desafio..."
                            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple/50 focus:outline-none text-white resize-none placeholder-gray-600 transition-colors"
                            rows={3}
                            maxLength={200}
                        />
                    </div>

                    {/* Pontos */}
                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">
                            Pontos do Desafio
                        </label>
                        <div className="flex items-center space-x-3">
                            <Award className="text-neon-purple" size={20} />
                            <input
                                type="number"
                                value={points}
                                onChange={(e) => setPoints(Math.max(1, parseInt(e.target.value) || 0))}
                                min="1"
                                max="10000"
                                className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple/50 focus:outline-none text-white font-bold transition-colors"
                            />
                            <span className="text-sm text-gray-500 font-bold">pontos</span>
                        </div>
                    </div>

                    {/* Datas */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">
                                Data Início *
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-neon-purple focus:outline-none text-white transition-colors [color-scheme:dark]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">
                                Data Fim *
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-neon-purple focus:outline-none text-white transition-colors [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-neon-purple/5 border border-neon-purple/20 rounded-xl p-4">
                        <p className="text-xs text-purple-300 leading-relaxed">
                            💡 Após criar o desafio, você precisará fazer uma corrida para definir o território do desafio.
                            Apenas membros da sua equipe verão este território no mapa.
                        </p>
                    </div>

                    {/* Botões */}
                    <div className="flex space-x-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all border border-white/10"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 bg-neon-purple text-white font-bold py-3 rounded-xl hover:bg-purple-600 hover:shadow-[0_0_15px_rgba(157,0,255,0.4)] transition-all shadow-[0_0_10px_rgba(157,0,255,0.2)]"
                        >
                            Criar e Iniciar Corrida
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateChallengeModal;
