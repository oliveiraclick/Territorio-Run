import React, { useState } from 'react';
import { X, Save, Image, MapPin, Clock, MessageCircle, Globe, Instagram, Palette } from 'lucide-react';
import { Team } from '../../types';
import { updateTeam } from '../../services/teamService';

interface EditTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    team: Team;
    onUpdate: (updatedTeam: Team) => void;
}

const EditTeamModal: React.FC<EditTeamModalProps> = ({ isOpen, onClose, team, onUpdate }) => {
    const [loading, setLoading] = useState(false);

    // Form States
    const [description, setDescription] = useState(team.description || '');
    const [logoUrl, setLogoUrl] = useState(team.logoUrl || '');
    const [bannerUrl, setBannerUrl] = useState(team.bannerUrl || '');
    const [address, setAddress] = useState(team.address || '');
    const [operatingHours, setOperatingHours] = useState(team.operatingHours || '');
    const [whatsapp, setWhatsapp] = useState(team.whatsapp || '');
    const [primaryColor, setPrimaryColor] = useState(team.primaryColor || '#ff073a');

    // Social Links
    const [instagram, setInstagram] = useState(team.socialLinks?.instagram || '');
    const [website, setWebsite] = useState(team.socialLinks?.website || '');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const updates: Partial<Team> = {
            description,
            logoUrl,
            bannerUrl,
            address,
            operatingHours,
            whatsapp,
            primaryColor,
            socialLinks: {
                instagram,
                website
            }
        };

        const updated = await updateTeam(team.id, updates);

        if (updated) {
            onUpdate(updated);
            onClose();
        } else {
            alert('Erro ao atualizar equipe. Tente novamente.');
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[10002] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans">
            <div className="bg-dark-bg w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-surface-dark">
                    <h2 className="text-xl font-black text-white uppercase tracking-wide">Editar Perfil da Assessoria</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gold-500/20 scrollbar-track-transparent">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Visual Identity */}
                        <section className="space-y-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Image size={14} className="text-gold-500" /> Identidade Visual
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1">URL do Logo</label>
                                    <input
                                        type="text"
                                        value={logoUrl}
                                        onChange={(e) => setLogoUrl(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1">URL do Banner</label>
                                    <input
                                        type="text"
                                        value={bannerUrl}
                                        onChange={(e) => setBannerUrl(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1">Cor Principal</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer"
                                    />
                                    <span className="text-sm font-mono text-gray-400">{primaryColor}</span>
                                </div>
                            </div>
                        </section>

                        {/* Basic Info */}
                        <section className="space-y-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Globe size={14} className="text-gold-500" /> Informações Gerais
                            </h3>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1">Bio / Descrição</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none min-h-[100px]"
                                    placeholder="Conte um pouco sobre sua assessoria..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1">Endereço (CT)</label>
                                    <div className="relative">
                                        <MapPin size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-gold-500 outline-none"
                                            placeholder="Ex: Parque Ibirapuera, Portão 7"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1">Horário de Treino</label>
                                    <div className="relative">
                                        <Clock size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                        <input
                                            type="text"
                                            value={operatingHours}
                                            onChange={(e) => setOperatingHours(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-gold-500 outline-none"
                                            placeholder="Ex: Seg-Sex 06h às 10h"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Social Contacts */}
                        <section className="space-y-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <MessageCircle size={14} className="text-gold-500" /> Contato e Redes
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1">WhatsApp</label>
                                    <input
                                        type="text"
                                        value={whatsapp}
                                        onChange={(e) => setWhatsapp(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none"
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1">Instagram (URL)</label>
                                    <div className="relative">
                                        <Instagram size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                        <input
                                            type="text"
                                            value={instagram}
                                            onChange={(e) => setInstagram(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-gold-500 outline-none"
                                            placeholder="https://instagram.com/..."
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-400 mb-1">Website (Opcional)</label>
                                    <div className="relative">
                                        <Globe size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                        <input
                                            type="text"
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-gold-500 outline-none"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-black uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${loading ? 'bg-gray-700 cursor-not-allowed text-gray-500' : 'bg-gold-500 hover:bg-gold-400 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                                }`}
                        >
                            {loading ? 'Salvando...' : <><Save size={20} /> Salvar Alterações</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditTeamModal;
