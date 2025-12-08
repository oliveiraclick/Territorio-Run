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
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Target className="text-white" size={28} />
                        <div>
                            <h2 className="text-2xl font-black text-white">Criar Desafio</h2>
                            <p className="text-white/80 text-sm">{teamName}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Nome do Desafio */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Nome do Desafio *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Corrida do Parque"
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-gray-800 font-semibold"
                            maxLength={50}
                        />
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Descrição (opcional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descreva o desafio..."
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-gray-800 resize-none"
                            rows={3}
                            maxLength={200}
                        />
                    </div>

                    {/* Pontos */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Pontos do Desafio
                        </label>
                        <div className="flex items-center space-x-3">
                            <Award className="text-purple-500" size={20} />
                            <input
                                type="number"
                                value={points}
                                onChange={(e) => setPoints(Math.max(1, parseInt(e.target.value) || 0))}
                                min="1"
                                max="10000"
                                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-gray-800 font-bold"
                            />
                            <span className="text-sm text-gray-600">pontos</span>
                        </div>
                    </div>

                    {/* Datas */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Data Início *
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-gray-800"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Data Fim *
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-gray-800"
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-xs text-purple-700">
                            💡 Após criar o desafio, você precisará fazer uma corrida para definir o território do desafio.
                            Apenas membros da sua equipe verão este território no mapa.
                        </p>
                    </div>

                    {/* Botões */}
                    <div className="flex space-x-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all"
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
