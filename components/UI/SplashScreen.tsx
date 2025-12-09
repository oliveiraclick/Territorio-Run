import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 4 seconds duration (approx 200 steps * 20ms)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 0.5; // +0.5 per 20ms = 25% per sec = 4s total
      });
    }, 20);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[10000] bg-black flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <img
        src="/brand-splash.png"
        alt="Splash Screen"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Loading Bar Container - Positioned below the map pin (approx 75% down) */}
      <div className="absolute bottom-[10%] left-1/2 transform -translate-x-1/2 w-64 md:w-80">
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm shadow-lg">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(251,146,60,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-white/80 text-[10px] mt-2 font-medium tracking-widest uppercase animate-pulse">
          Carregando Conquistas...
        </p>
      </div>
    </div>
  );
};
