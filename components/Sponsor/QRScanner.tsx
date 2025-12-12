import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
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
        let html5QrcodeScanner: Html5QrcodeScanner | null = null;

        const timer = setTimeout(() => {
            try {
                // Check if element exists
                if (!document.getElementById(scannerId)) return;

                html5QrcodeScanner = new Html5QrcodeScanner(
                    scannerId,
                    {
                        fps: 10,
                        qrbox: 250,
                        aspectRatio: 1.0,
                        showTorchButtonIfSupported: true,
                        videoConstraints: {
                            facingMode: { exact: "environment" } // Try back camera explicitly
                        }
                    },
                    /* verbose= */ false
                );

                html5QrcodeScanner.render((decodedText) => {
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
                        html5QrcodeScanner?.clear();
                        setTimeout(() => {
                            onScanSuccess(decodedText, result.sponsor?.id);
                        }, 1500);
                    }
                }, (err) => {
                    // ignore frame errors
                });

                setScannerStatus('scanning');
            } catch (e) {
                console.error("Scanner Error:", e);
                setErrorMessage("Erro ao iniciar câmera. Permita o acesso.");
                setScannerStatus('error');
            }
        }, 500);

        return () => {
            clearTimeout(timer);
            if (html5QrcodeScanner) {
                try {
                    html5QrcodeScanner.clear();
                } catch (e) { console.error(e); }
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[20000] bg-black flex flex-col pt-12 safe-top">
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

                <div className="mt-8 flex justify-center w-full">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl transition-transform active:scale-95 border-2 border-white/20"
                    >
                        <X size={24} />
                        CANCELAR
                    </button>
                </div>
            </div>
        </div>
    );
};
