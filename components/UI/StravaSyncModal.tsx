
import React, { useEffect, useState } from 'react';
import { StravaActivity } from '../../types';
import { getRecentActivities, getActivityStream } from '../../services/stravaService';
import { X, RefreshCw, CheckCircle, AlertTriangle, Download, Calendar } from 'lucide-react';
import { calculateTotalDistance } from '../../utils/geoUtils';

interface StravaSyncModalProps {
    joinedAt: number;
    isOpen: boolean;
    onClose: () => void;
    onImport: (activity: StravaActivity, path: any[]) => Promise<void>;
    alreadyImportedIds: string[]; // List of IDs already imported? We need to track this locally or on server.
}

export const StravaSyncModal: React.FC<StravaSyncModalProps> = ({ joinedAt, isOpen, onClose, onImport, alreadyImportedIds = [] }) => {
    const [activities, setActivities] = useState<StravaActivity[]>([]);
    const [loading, setLoading] = useState(false);
    const [importingId, setImportingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadActivities = async () => {
        setLoading(true);
        setError(null);
        try {
            const recent = await getRecentActivities(joinedAt);
            setActivities(recent);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadActivities();
        }
    }, [isOpen]);

    const handleImportClick = async (activity: StravaActivity) => {
        if (importingId) return; // Prevent double click
        setImportingId(activity.id);

        try {
            // 1. Fetch GPS Stream
            const stream = await getActivityStream(activity.id);

            if (stream.length === 0) {
                throw new Error("Atividade sem dados de GPS detalhados.");
            }

            // 2. Validate Distance match (sanity check)
            const calculatedDist = calculateTotalDistance(stream);
            // Strava distance is in meters, ours in km. 
            // activity.distance is meters.
            const stravaKm = activity.distance / 1000;

            // Allow 10% discrepancy due to different calculations
            if (Math.abs(calculatedDist - stravaKm) > (stravaKm * 0.2)) {
                console.warn(`Discrepância de distância: Strava says ${stravaKm}, calculated ${calculatedDist}`);
                // We proceed anyway, but log it.
            }

            // 3. Send to Parent for Conquest Processing
            await onImport(activity, stream);

            // 4. Update local list state ? (Parent handles closing or refreshing?)

        } catch (e: any) {
            alert(`Erro ao importar: ${e.message}`);
        } finally {
            setImportingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
                    <div className="flex items-center gap-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Strava_Logo.svg" className="h-6" alt="Strava" />
                        <h2 className="text-white font-bold text-lg">Sincronizar Atividades</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <RefreshCw size={32} className="text-orange-500 animate-spin" />
                            <p className="text-gray-400 text-sm animate-pulse">Buscando no Strava...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center space-y-3">
                            <AlertTriangle className="mx-auto text-red-500" size={32} />
                            <p className="text-red-400 text-sm font-medium">{error}</p>
                            <button onClick={loadActivities} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs px-4 py-2 rounded-lg transition-colors font-bold uppercase tracking-wide">
                                Tentar Novamente
                            </button>
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="text-center py-12 space-y-3">
                            <Calendar className="mx-auto text-gray-600" size={48} />
                            <p className="text-gray-400 font-medium">Nenhuma atividade recente encontrada.</p>
                            <p className="text-gray-600 text-xs max-w-xs mx-auto">
                                Lembre-se: Só mostramos atividades novas, realizadas após o seu cadastro no jogo.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activities.map(activity => {
                                const isImported = alreadyImportedIds.includes(activity.id.toString());
                                const date = new Date(activity.start_date);

                                return (
                                    <div key={activity.id} className={`relative p-4 rounded-xl border transition-all ${isImported ? 'bg-green-900/10 border-green-500/30 opacity-60' : 'bg-white/5 border-white/10 hover:border-orange-500/50 hover:bg-white/10'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-white font-bold text-sm line-clamp-1">{activity.name}</h3>
                                                <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                    <Calendar size={10} />
                                                    {date.toLocaleDateString()} às {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            {isImported ? (
                                                <div className="flex items-center gap-1 text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
                                                    <CheckCircle size={12} />
                                                    <span className="text-[10px] font-black uppercase tracking-wider">Importado</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-orange-500 bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/20">
                                                    <span className="text-[10px] font-black">{activity.type === 'Run' ? 'CORRIDA' : activity.type.toUpperCase()}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                                            <div className="bg-black/30 rounded-lg p-1.5">
                                                <div className="text-[10px] text-gray-500 uppercase font-bold">Distância</div>
                                                <div className="text-white font-bold text-sm">{(activity.distance / 1000).toFixed(2)} km</div>
                                            </div>
                                            <div className="bg-black/30 rounded-lg p-1.5">
                                                <div className="text-[10px] text-gray-500 uppercase font-bold">Tempo</div>
                                                <div className="text-white font-bold text-sm">
                                                    {Math.floor(activity.moving_time / 60)} min
                                                </div>
                                            </div>
                                            <div className="bg-black/30 rounded-lg p-1.5">
                                                <div className="text-[10px] text-gray-500 uppercase font-bold">Pace</div>
                                                {/* Pace calculation: (time in min) / (dist in km) */}
                                                <div className="text-white font-bold text-sm">
                                                    {Math.floor((activity.moving_time / 60) / (activity.distance / 1000))}'{(Math.floor(((activity.moving_time / 60) / (activity.distance / 1000) % 1) * 60)).toString().padStart(2, '0')}"/km
                                                </div>
                                            </div>
                                        </div>

                                        {!isImported && (
                                            <button
                                                onClick={() => handleImportClick(activity)}
                                                disabled={typeof importingId === 'number'}
                                                className="w-full mt-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-black text-xs uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {importingId === activity.id ? (
                                                    <>
                                                        <RefreshCw size={14} className="animate-spin" />
                                                        Processando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download size={14} />
                                                        Importar e Conquistar
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 bg-black/40 border-t border-white/10 text-center">
                    <p className="text-[10px] text-gray-600">
                        Powered by Strava API • Apenas atividades pós-cadastro
                    </p>
                </div>

            </div>
        </div>
    );
};
