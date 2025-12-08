import React, { useState } from 'react';
import { X, Users, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { generateSlug } from '../../utils/slugUtils';

interface CreateTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateTeam: (name: string) => Promise<string | null>; // Retorna slug ou null
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ isOpen, onClose, onCreateTeam }) => {
    const [teamName, setTeamName] = useState('');
    const [loading, setLoading] = useState(false);
    const [createdSlug, setCreatedSlug] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const previewSlug = teamName ? generateSlug(teamName) : '';
    const inviteLink = createdSlug ? `${window.location.origin}/${createdSlug}` : '';

    const handleCreate = async () => {
        if (!teamName.trim()) {
            alert('Digite um nome para a equipe');
            return;
        }

        setLoading(true);
        const slug = await onCreateTeam(teamName);
        setLoading(false);

        if (slug) {
            setCreatedSlug(slug);
        } else {
            alert('Erro ao criar equipe. Tente novamente.');
        }
    };

    const handleCopyLink = () => {
        if (inviteLink) {
            navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleClose = () => {
        setTeamName('');
        setCreatedSlug(null);
        setCopied(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-blue-500 p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Users className="text-white" size={28} />
                        <h2 className="text-2xl font-black text-white">
                            {createdSlug ? 'Equipe Criada!' : 'Criar Equipe'}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {!createdSlug ? (
                        <>
                            {/* Input Nome da Equipe */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Nome da Equipe
                                </label>
                                <input
                                    type="text"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    placeholder="Ex: Nike Running Team"
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none text-gray-800 font-semibold"
                                    maxLength={50}
                                />
                            </div>

                            {/* Preview do Slug */}
                            {previewSlug && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="text-xs font-bold text-blue-600 mb-1">Link de Convite:</div>
                                    <div className="flex items-center space-x-2">
                                        <LinkIcon size={14} className="text-blue-500" />
                                        <span className="text-sm text-blue-700 font-mono">
                                            {window.location.origin}/{previewSlug}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Botão Criar */}
                            <button
                                onClick={handleCreate}
                                disabled={loading || !teamName.trim()}
                                className="w-full bg-gradient-to-r from-orange-500 to-blue-500 text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Criando...' : 'Criar Equipe'}
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Sucesso */}
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check size={32} className="text-green-600" />
                                </div>
                                <h3 className="text-xl font-black text-gray-800 mb-2">
                                    Equipe "{teamName}" criada!
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Compartilhe o link abaixo com seus atletas
                                </p>
                            </div>

                            {/* Link de Convite */}
                            <div className="bg-gradient-to-br from-orange-50 to-blue-50 border-2 border-blue-300 rounded-xl p-4">
                                <div className="text-xs font-bold text-gray-700 mb-2">Link de Convite:</div>
                                <div className="bg-white rounded-lg p-3 mb-3 break-all">
                                    <span className="text-sm text-blue-600 font-mono">{inviteLink}</span>
                                </div>
                                <button
                                    onClick={handleCopyLink}
                                    className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-bold transition-all ${copied
                                            ? 'bg-green-500 text-white'
                                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                                        }`}
                                >
                                    {copied ? (
                                        <>
                                            <Check size={18} />
                                            <span>Link Copiado!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={18} />
                                            <span>Copiar Link</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Botão Fechar */}
                            <button
                                onClick={handleClose}
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition-all"
                            >
                                Fechar
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateTeamModal;
