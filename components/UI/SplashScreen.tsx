import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface SplashScreenProps {
    onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Animate progress bar
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(onComplete, 300);
                    return 100;
                }
                return prev + 2;
            });
        }, 20);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[10000] bg-gradient-to-br from-orange-500 via-blue-500 to-cyan-400 flex flex-col items-center justify-center">
            {/* Animated Background Circles */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl animate-pulse delay-75" />
            </div>

            {/* Logo and Title */}
            <div className="relative z-10 flex flex-col items-center mb-12 animate-fade-in">
                <div className="relative mb-6">
                    {/* Pulsing Circle */}
                    <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />

                    {/* Logo Icon */}
                    <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl">
                        <Zap size={48} className="text-orange-500" fill="currentColor" />
                    </div>
                </div>

                {/* App Name */}
                <h1 className="text-5xl font-black text-white mb-2 tracking-tight drop-shadow-lg">
                    Territory Run
                </h1>
                <p className="text-xl text-white/90 font-medium">Conquista</p>
            </div>

            {/* Progress Bar */}
            <div className="relative z-10 w-64 h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                    className="h-full bg-white rounded-full transition-all duration-300 shadow-lg"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Loading Text */}
            <p className="relative z-10 mt-6 text-white/80 text-sm font-medium animate-pulse">
                Preparando sua corrida...
            </p>

            <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .delay-75 {
          animation-delay: 75ms;
        }
      `}</style>
        </div>
    );
};
