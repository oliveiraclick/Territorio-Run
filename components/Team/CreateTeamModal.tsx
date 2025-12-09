import React, { useState } from 'react';
import { X, Users, Link as LinkIcon, Copy, Check, ChevronRight, ChevronLeft, Image, Palette, Clock, MapPin, Instagram, Globe, MessageCircle } from 'lucide-react';
import { generateSlug } from '../../utils/slugUtils';
import { Team } from '../../types';

interface CreateTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateTeam: (data: Partial<Team>) => Promise<string | null>; // Alterado para aceitar objeto parcial
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ isOpen, onClose, onCreateTeam }) => {
    // Steps: 0: Basic Info, 1: Branding, 2: Details/Social, 3: Success
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [createdSlug, setCreatedSlug] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Form Data
    const [formData, setFormData] = useState<Partial<Team>>({
        name: '',
        description: '',
        primaryColor: '#ff9500',
        logoUrl: '',
        bannerUrl: '',
        address: '',
        operatingHours: '',
        whatsapp: '',
        socialLinks: { instagram: '', website: '' }
    });

    const inviteLink = createdSlug ? `${window.location.origin}/${createdSlug}` : '';

    const updateField = (field: keyof Team, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateSocial = (key: 'instagram' | 'website', value: string) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: { ...prev.socialLinks, [key]: value }
        }));
    };

    const handleCreate = async () => {
        if (!formData.name?.trim()) {
            alert('Nome da equipe é obrigatório');
            return;
        }

        setLoading(true);
        const slug = await onCreateTeam(formData); // Envia o objeto completo
        setLoading(false);

        if (slug) {
            setCreatedSlug(slug);
            setStep(3); // Success Step
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
        setStep(0);
        setFormData({
            name: '',
            description: '',
            primaryColor: '#ff9500',
            logoUrl: '',
            bannerUrl: '',
            address: '',
            operatingHours: '',
            whatsapp: '',
            socialLinks: { instagram: '', website: '' }
        });
        setCreatedSlug(null);
        setCopied(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-blue-500 p-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center space-x-3">
                        <Users className="text-white" size={28} />
                        <h2 className="text-2xl font-black text-white">
                            {step === 3 ? 'Equipe Criada!' : 'Criar Equipe'}
                        </h2>
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {step === 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Passo 1: Informações Básicas</h3>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nome da Equipe *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    placeholder="Ex: Nike Running Team"
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Sobre a Equipe (Bio)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    placeholder="Conte um pouco sobre a história e objetivos da equipe..."
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none h-24 resize-none"
                                />
                            </div>
                            {/* Preview Slug */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="text-xs font-bold text-blue-600 mb-1">Seu Link será:</div>
                                <div className="text-sm text-blue-700 font-mono overflow-hidden text-ellipsis">
                                    {window.location.origin}/{formData.name ? generateSlug(formData.name!) : '...'}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Passo 2: Identidade Visual</h3>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Palette size={16} /> Cor Principal</label>
                                <input
                                    type="color"
                                    value={formData.primaryColor || '#ff9500'}
                                    onChange={(e) => updateField('primaryColor', e.target.value)}
                                    className="w-full h-12 rounded-lg cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Image size={16} /> Logo URL</label>
                                <input
                                    type="text"
                                    value={formData.logoUrl || ''}
                                    onChange={(e) => updateField('logoUrl', e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Image size={16} /> Banner URL</label>
                                <input
                                    type="text"
                                    value={formData.bannerUrl || ''}
                                    onChange={(e) => updateField('bannerUrl', e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Passo 3: Contato & Localização</h3>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><MapPin size={16} /> Endereço</label>
                                <input
                                    type="text"
                                    value={formData.address || ''}
                                    onChange={(e) => updateField('address', e.target.value)}
                                    placeholder="Rua Exemplo, 123"
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Clock size={16} /> Horário de Funcionamento</label>
                                <input
                                    type="text"
                                    value={formData.operatingHours || ''}
                                    onChange={(e) => updateField('operatingHours', e.target.value)}
                                    placeholder="Seg-Sex: 06h às 22h"
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><MessageCircle size={16} /> WhatsApp</label>
                                <input
                                    type="text"
                                    value={formData.whatsapp || ''}
                                    onChange={(e) => updateField('whatsapp', e.target.value)}
                                    placeholder="(00) 00000-0000"
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Instagram size={16} /> Instagram</label>
                                    <input
                                        type="text"
                                        value={formData.socialLinks?.instagram || ''}
                                        onChange={(e) => updateSocial('instagram', e.target.value)}
                                        placeholder="Link perfil"
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Globe size={16} /> Site</label>
                                    <input
                                        type="text"
                                        value={formData.socialLinks?.website || ''}
                                        onChange={(e) => updateSocial('website', e.target.value)}
                                        placeholder="Link site"
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check size={32} className="text-green-600" />
                            </div>
                            <h3 className="text-xl font-black text-gray-800 mb-2">
                                Equipe "{formData.name}" criada!
                            </h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Compartilhe o link abaixo com seus atletas
                            </p>

                            <div className="bg-gradient-to-br from-orange-50 to-blue-50 border-2 border-blue-300 rounded-xl p-4 mb-4">
                                <div className="text-xs font-bold text-gray-700 mb-2">Link de Convite:</div>
                                <div className="bg-white rounded-lg p-3 mb-3 break-all">
                                    <span className="text-sm text-blue-600 font-mono">{inviteLink}</span>
                                </div>
                                <button
                                    onClick={handleCopyLink}
                                    className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-bold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                                >
                                    {copied ? <><Check size={18} /><span>Copiado!</span></> : <><Copy size={18} /><span>Copiar Link</span></>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                {step < 3 && (
                    <div className="p-6 bg-gray-50 border-t flex justify-between shrink-0">
                        {step > 0 ? (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex items-center space-x-2 text-gray-600 font-bold hover:text-gray-800 px-4 py-2"
                            >
                                <ChevronLeft size={20} /> <span>Voltar</span>
                            </button>
                        ) : <div></div>}

                        {step < 2 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                disabled={!formData.name?.trim()}
                                className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl flex items-center space-x-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span>Próximo</span> <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={handleCreate}
                                disabled={loading}
                                className="bg-gradient-to-r from-orange-500 to-blue-500 text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg disabled:opacity-50"
                            >
                                {loading ? 'Criando...' : 'Concluir Criação'}
                            </button>
                        )}
                    </div>
                )}
                {step === 3 && (
                    <div className="p-6 bg-gray-50 border-t shrink-0">
                        <button onClick={handleClose} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition-all">
                            Fechar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateTeamModal;
