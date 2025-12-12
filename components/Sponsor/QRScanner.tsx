import React, { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertTriangle, CheckCircle } from 'lucide-react';
import { Sponsor, Coordinate } from '../../types';
import { calculateDistance } from '../../utils/geoUtils';

interface QRScannerProps {
    onClose: () => void;
    onScanSuccess: (decodedText: string, sponsorId?: string) => void;
    userLocation: Coordinate | null;
    sponsors: Sponsor[];
}

export const QRScanner: React.FC<QRScannerProps> = ({ onClose, onScanSuccess, userLocation, sponsors }) => {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [scannerStatus, setScannerStatus] = useState<'idle' | 'scanning' | 'processing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Check if we are close to any sponsor
    const findNearbySponsor = (qrValue: string) => {
        const sponsor = sponsors.find(s => s.qrCodeValue === qrValue);

        if (!sponsor) {
            return { error: 'Código inválido ou desconhecido.' };
        }

        if (!userLocation) {
            return { error: 'Aguardando GPS... Tente novamente.' };
        }

        const distance = calculateDistance(
            userLocation.lat, userLocation.lng,
            sponsor.coordinates.lat, sponsor.coordinates.lng
        );

        // Limit: 100 meters (0.1 km)
        if (distance > 0.1) {
            return { error: `Você está muito longe (${(distance * 1000).toFixed(0)}m). Chegue mais perto da loja!` };
        }

        return { success: true, sponsor };
    };

    useEffect(() => {
        const scannerId = "reader";
        let html5QrCode: Html5Qrcode | null = null;

        const timer = setTimeout(async () => {
            try {
                // Check if element exists
                if (!document.getElementById(scannerId)) return;

                html5QrCode = new Html5Qrcode(scannerId);

                // Start scanning directly without UI selector
                await html5QrCode.start(
                    { facingMode: "environment" }, // Prefer back camera
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                    },
                    (decodedText) => {
                        setScannerStatus('processing');
                        const result = findNearbySponsor(decodedText);

                        if (result.error) {
                            setErrorMessage(result.error);
                            setScannerStatus('error');
                            setTimeout(() => {
                                if (scannerStatus !== 'success') {
                                    setScannerStatus('scanning');
                                    setErrorMessage('');
                                }
                            }, 3000);
                        } else if (result.success && result.sponsor) {
                            setScanResult(decodedText);
                            setScannerStatus('success');
                            html5QrCode?.stop();
                            setTimeout(() => {
                                onScanSuccess(decodedText, result.sponsor?.id);
                            }, 1500);
                        }
                    },
                    (err) => {
                        // ignore frame errors
                    }
                );

                setScannerStatus('scanning');
            } catch (e) {
                console.error("Scanner Error:", e);
                setErrorMessage("Erro ao iniciar câmera. Permita o acesso.");
                setScannerStatus('error');
            }
        }, 500);

        return () => {
            clearTimeout(timer);
            if (html5QrCode) {
                try {
                    html5QrCode.stop().catch(e => console.error(e));
                } catch (e) { console.error(e); }
            }
        };
    }, []);


    return (
        <div className="fixed inset-0 z-[20000] bg-black flex flex-col pt-12 safe-top">

            {/* Close Button - Top Right */}
            <button
                onClick={onClose}
                className="fixed top-6 right-6 z-[30000] p-3 rounded-full bg-red-600/90 border-2 border-white/20 text-white shadow-2xl flex items-center justify-center active:scale-90 transition-transform"
                aria-label="Fechar"
            >
                <X size={28} strokeWidth={3} />
            </button>

            <div className="w-full text-center p-4">
                <h2 className="text-white font-bold text-xl flex items-center justify-center gap-2">
                    <Camera className="text-gold-500" />
                    Validar Visita
                </h2>
                <p className="text-gray-400 text-xs">Aponte para o QR Code da Loja</p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-start w-full px-4 relative">

                {scannerStatus === 'processing' && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80">
                        <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-bold text-white">Verificando...</p>
                    </div>
                )}

                {scannerStatus === 'success' && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-green-600/90 animate-bounce-in">
                        <CheckCircle size={64} className="text-white mb-4" />
                        <h3 className="text-2xl font-black text-white">SUCESSO!</h3>
                    </div>
                )}

                {scannerStatus === 'error' && errorMessage && (
                    <div className="w-full bg-red-500 text-white p-3 rounded-xl mb-4 text-center font-bold animate-pulse shadow-xl border border-red-300">
                        <AlertTriangle className="inline-block mr-2" />
                        {errorMessage}
                    </div>
                )}

                <div id="reader" className="w-full max-w-sm overflow-hidden rounded-2xl border-4 border-gold-500/30 bg-black min-h-[300px]"></div>

            </div>
        </div>
    );
};
