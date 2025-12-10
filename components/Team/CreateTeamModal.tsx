import React, { useState } from 'react';
import { X, Users, Link as LinkIcon, Copy, Check, ChevronRight, ChevronLeft, Image, Palette, Clock, MapPin, Instagram, Globe, MessageCircle } from 'lucide-react';
import { generateSlug } from '../../utils/slugUtils';
import { Team } from '../../types';

interface CreateTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateTeam: (data: Partial<Team>) => Promise<string | null>;
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
        primaryColor: '#EAB308', // Gold default
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
        const slug = await onCreateTeam(formData);
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
            primaryColor: '#EAB308',
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
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-dark-bg max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/5">
                {/* Header */}
                <div className="bg-surface-dark p-6 flex items-center justify-between shrink-0 border-b border-white/5">
                    <div className="flex items-center space-x-3">
                        <Users className="text-gold-500" size={28} />
                        <h2 className="text-2xl font-black text-white tracking-wide">
                            {step === 3 ? 'Equipe Criada!' : 'Criar Equipe'}
                        </h2>
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {step === 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-gray-500 border-b border-white/10 pb-2 uppercase tracking-wide">Passo 1: Informações Básicas</h3>
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Nome da Equipe *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    placeholder="Ex: Nike Running Team"
                                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 focus:outline-none text-white placeholder-gray-600 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Sobre a Equipe (Bio)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    placeholder="Conte um pouco sobre a história e objetivos da equipe..."
                                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 focus:outline-none h-24 resize-none text-white placeholder-gray-600 transition-colors"
                                />
                            </div>
                            {/* Preview Slug */}
                            <div className="bg-surface-dark border border-white/10 rounded-xl p-4">
                                <div className="text-xs font-bold text-gold-500 mb-1 uppercase tracking-wide">Seu Link será:</div>
                                <div className="text-sm text-gray-400 font-mono overflow-hidden text-ellipsis">
                                    {window.location.origin}/{formData.name ? generateSlug(formData.name!) : '...'}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-gray-500 border-b border-white/10 pb-2 uppercase tracking-wide">Passo 2: Identidade Visual</h3>
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2"><Palette size={16} /> Cor Principal</label>
                                <input
                                    type="color"
                                    value={formData.primaryColor || '#EAB308'}
                                    onChange={(e) => updateField('primaryColor', e.target.value)}
                                    className="w-full h-12 rounded-xl cursor-pointer bg-white/5 border border-white/10 p-1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2"><Image size={16} /> Logo URL</label>
                                <input
                                    type="text"
                                    value={formData.logoUrl || ''}
                                    onChange={(e) => updateField('logoUrl', e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-gold-500 focus:outline-none text-white placeholder-gray-600 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2"><Image size={16} /> Banner URL</label>
                                <input
                                    type="text"
                                    value={formData.bannerUrl || ''}
                                    onChange={(e) => updateField('bannerUrl', e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-gold-500 focus:outline-none text-white placeholder-gray-600 transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-gray-500 border-b border-white/10 pb-2 uppercase tracking-wide">Passo 3: Contato & Localização</h3>
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2"><MapPin size={16} /> Endereço</label>
                                <input
                                    type="text"
                                    value={formData.address || ''}
                                    onChange={(e) => updateField('address', e.target.value)}
                                    placeholder="Rua Exemplo, 123"
                                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-gold-500 focus:outline-none text-white placeholder-gray-600 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2"><Clock size={16} /> Horário de Funcionamento</label>
                                <input
                                    type="text"
                                    value={formData.operatingHours || ''}
                                    onChange={(e) => updateField('operatingHours', e.target.value)}
                                    placeholder="Seg-Sex: 06h às 22h"
                                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-gold-500 focus:outline-none text-white placeholder-gray-600 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2"><MessageCircle size={16} /> WhatsApp</label>
                                <input
                                    type="text"
                                    value={formData.whatsapp || ''}
                                    onChange={(e) => updateField('whatsapp', e.target.value)}
                                    placeholder="(00) 00000-0000"
                                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-gold-500 focus:outline-none text-white placeholder-gray-600 transition-colors"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2"><Instagram size={16} /> Instagram</label>
                                    <input
                                        type="text"
                                        value={formData.socialLinks?.instagram || ''}
                                        onChange={(e) => updateSocial('instagram', e.target.value)}
                                        placeholder="Link perfil"
                                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-gold-500 focus:outline-none text-white placeholder-gray-600 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2"><Globe size={16} /> Site</label>
                                    <input
                                        type="text"
                                        value={formData.socialLinks?.website || ''}
                                        onChange={(e) => updateSocial('website', e.target.value)}
                                        placeholder="Link site"
                                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-gold-500 focus:outline-none text-white placeholder-gray-600 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-4">
                            <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold-500/20">
                                <Check size={40} className="text-gold-500" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">
                                Equipe Criada!
                            </h3>
                            <p className="text-sm text-gray-400 mb-6">
                                "{formData.name}" agora faz parte do território.
                            </p>

                            <div className="bg-surface-dark border border-white/10 rounded-xl p-4 mb-4">
                                <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Link de Convite:</div>
                                <div className="bg-black/50 rounded-lg p-3 mb-3 break-all border border-white/5">
                                    <span className="text-sm text-gold-500 font-mono">{inviteLink}</span>
                                </div>
                                <button
                                    onClick={handleCopyLink}
                                    className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold transition-all ${copied ? 'bg-green-500 text-black' : 'bg-white text-black hover:bg-gray-200'}`}
                                >
                                    {copied ? <><Check size={18} /><span>Copiado!</span></> : <><Copy size={18} /><span>Copiar Link</span></>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                {step < 3 && (
                    <div className="p-6 bg-surface-dark border-t border-white/10 flex justify-between shrink-0">
                        {step > 0 ? (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex items-center space-x-2 text-gray-500 font-bold hover:text-white px-4 py-2 transition-colors"
                            >
                                <ChevronLeft size={20} /> <span>Voltar</span>
                            </button>
                        ) : <div></div>}

                        {step < 2 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                disabled={!formData.name?.trim()}
                                className="bg-white text-black font-bold px-6 py-3 rounded-xl flex items-center space-x-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <span>Próximo</span> <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={handleCreate}
                                disabled={loading}
                                className="bg-gradient-to-r from-gold-400 to-gold-600 text-black font-bold px-8 py-3 rounded-xl hover:shadow-[0_0_20px_rgba(234,179,8,0.5)] disabled:opacity-50 transition-all"
                            >
                                {loading ? 'Criando...' : 'Concluir Criação'}
                            </button>
                        )}
                    </div>
                )}
                {step === 3 && (
                    <div className="p-6 bg-surface-dark border-t border-white/10 shrink-0">
                        <button onClick={handleClose} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all border border-white/10">
                            Fechar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateTeamModal;
