
import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { X, Camera, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';
import { Sponsor, Coordinate } from '../../types';
import { calculateDistance } from '../../utils/geoUtils';

interface QRScannerProps {
    onClose: () => void;
    onScanSuccess: (data: string, sponsorId?: string) => void;
    userLocation: Coordinate | null;
    sponsors: Sponsor[];
}

export const QRScanner: React.FC<QRScannerProps> = ({ onClose, onScanSuccess, userLocation, sponsors }) => {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [scannerStatus, setScannerStatus] = useState<'idle' | 'scanning' | 'processing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Check if we are close to any sponsor
    const findNearbySponsor = (qrValue: string) => {
        // Find sponsor by QR value code (assuming the QR contains the secret token)
        // Format: "SPONSOR_12345_abcde"
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

        // Limit: 50 meters
        if (distance > 0.05) {
            return { error: `Você está muito longe (${(distance * 1000).toFixed(0)}m). Chegue mais perto da loja!` };
        }

        return { success: true, sponsor };
    };

    useEffect(() => {
        // Start scanner
        const scannerId = "reader";

        // Wait for DOM
        setTimeout(() => {
            const html5QrcodeScanner = new Html5QrcodeScanner(
                scannerId,
                { fps: 10, qrbox: 250 },
                /* verbose= */ false
            );

            html5QrcodeScanner.render((decodedText, decodedResult) => {
                setScannerStatus('processing');

                const result = findNearbySponsor(decodedText);

                if (result.error) {
                    setErrorMessage(result.error);
                    setScannerStatus('error');
                    // Clear error after 3s to allow retry? 
                    // Or just pause.
                    setTimeout(() => {
                        setScannerStatus('scanning');
                        setErrorMessage('');
                    }, 3000);
                } else if (result.success && result.sponsor) {
                    setScanResult(decodedText);
                    setScannerStatus('success');
                    html5QrcodeScanner.clear();

                    // Trigger success
                    setTimeout(() => {
                        onScanSuccess(decodedText, result.sponsor?.id);
                    }, 1500);
                }
            }, (errorMessage) => {
                // parse error, ignore
            });

            setScannerStatus('scanning');

            return () => {
                html5QrcodeScanner.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner. ", error);
                });
            };
        }, 100);

    }, []);

    return (
        <div className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-[200] bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <h2 className="text-white font-bold text-lg flex items-center gap-2 pointer-events-auto">
                    <Camera className="text-gold-500" />
                    Validar Visita
                </h2>
                <button
                    onClick={onClose}
                    className="fixed top-4 right-4 z-[20000] bg-black/50 p-3 rounded-full text-white hover:bg-red-500 transition-colors pointer-events-auto border border-white/20 backdrop-blur-sm"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Content */}
            <div className="w-full max-w-md px-4 flex-1 flex flex-col justify-center">

                {scannerStatus === 'processing' && (
                    <div className="flex flex-col items-center justify-center text-white mb-8 animate-pulse">
                        <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-bold">Verificando localização...</p>
                    </div>
                )}

                {scannerStatus === 'success' && (
                    <div className="flex flex-col items-center justify-center text-center animate-bounce-in">
                        <div className="bg-green-500 text-black p-4 rounded-full mb-4 shadow-lg shadow-green-500/50">
                            <CheckCircle size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">SUCESSO!</h3>
                        <p className="text-gray-300">Visita validada com sucesso.</p>
                    </div>
                )}

                {scannerStatus === 'error' && (
                    <div className="absolute top-20 left-4 right-4 bg-red-500/90 text-white p-4 rounded-xl border border-red-400 shadow-xl z-30 flex items-center gap-3 animate-slide-in">
                        <AlertTriangle className="shrink-0" />
                        <p className="text-sm font-bold">{errorMessage}</p>
                    </div>
                )}

                {/* Scanner Container */}
                <div
                    id="reader"
                    className={`w-full overflow-hidden rounded-3xl border-2 border-white/20 shadow-2xl bg-black ${scannerStatus !== 'scanning' ? 'opacity-0 h-0' : 'opacity-100'}`}
                ></div>

                {scannerStatus === 'scanning' && (
                    <p className="text-center text-gray-400 text-xs mt-6 max-w-xs mx-auto">
                        Aponte a câmera para o QR Code no balcão da loja.
                        Você precisa estar no local para validar.
                    </p>
                )}
            </div>
        </div>
    );
};
