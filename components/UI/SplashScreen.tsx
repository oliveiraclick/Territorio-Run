import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar - slower for better readability (4 seconds total)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 0.5; // Slower increment for 4 second duration
      });
    }, 20);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[10000] bg-gradient-to-br from-orange-500 via-blue-500 to-cyan-400 flex flex-col items-center justify-center overflow-hidden">
      {/* Hero Image Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/60 via-blue-600/60 to-cyan-500/60 z-10" />
        <img
          src="/runner-hero.png"
          alt="Runner"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Animated Background Circles */}
      <div className="absolute inset-0 z-20 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl animate-pulse delay-75" />
      </div>

      {/* Content */}
      <div className="relative z-30 flex flex-col items-center px-6 max-w-lg">
        {/* Logo */}
        <div className="relative mb-8 animate-fade-in">
          <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
          <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl">
            <Zap size={48} className="text-orange-500" fill="currentColor" />
          </div>
        </div>

        {/* App Name */}
        <div className="text-center mb-6 animate-fade-in-delay-1">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tight drop-shadow-2xl">
            Territory Run
          </h1>
          <p className="text-2xl text-white/90 font-medium drop-shadow-lg">Conquista</p>
        </div>

        {/* Motivational Text */}
        <div className="text-center mb-8 animate-fade-in-delay-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-3 drop-shadow-lg">
            Transforme seus treinos em conquistas épicas
          </h2>
          <p className="text-lg text-white/90 drop-shadow-md">
            Cada movimento é um território. Cada treino é uma vitória.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs mb-4 animate-fade-in-delay-3">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-white rounded-full transition-all duration-300 shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Loading Text */}
        <p className="text-white/80 text-sm font-medium animate-pulse">
          Preparando sua aventura...
        </p>
      </div>

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
        .animate-fade-in-delay-1 {
          animation: fade-in 0.8s ease-out 0.2s both;
        }
        .animate-fade-in-delay-2 {
          animation: fade-in 0.8s ease-out 0.4s both;
        }
        .animate-fade-in-delay-3 {
          animation: fade-in 0.8s ease-out 0.6s both;
        }
        .delay-75 {
          animation-delay: 75ms;
        }
      `}</style>
    </div>
  );
};
