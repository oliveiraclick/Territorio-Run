import React from 'react';
import { calculateLevel, getLevelProgress, getStarsForNextLevel } from '../../utils/starSystem';
import { Star } from 'lucide-react';

interface StarBarProps {
    stars: number;
    compact?: boolean;
}

export const StarBar: React.FC<StarBarProps> = ({ stars, compact = false }) => {
    const level = calculateLevel(stars);
    const progress = getLevelProgress(stars);
    const starsForNext = getStarsForNextLevel(level);
    const currentLevelStars = stars - (level > 1 ? getStarsForNextLevel(level - 1) : 0);

    if (compact) {
        return (
            <div className="bg-white/95 backdrop-blur-md rounded-xl px-4 py-2 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-black text-gray-800">Nível {level}</span>
                    </div>
                    <span className="text-xs text-gray-600 font-bold">
                        {currentLevelStars}/{starsForNext} ⭐
                    </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 transition-all duration-500 shadow-sm"
                        style={{ width: `${progress * 100}%` }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                        <Star size={24} className="text-white fill-white" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-gray-800">Nível {level}</div>
                        <div className="text-sm text-gray-600">Corredor</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-black text-yellow-500">{stars}</div>
                    <div className="text-xs text-gray-600">estrelas</div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 font-bold">Progresso</span>
                    <span className="text-gray-600">{Math.round(progress * 100)}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div
                        className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 transition-all duration-500 shadow-sm"
                        style={{ width: `${progress * 100}%` }}
                    />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{currentLevelStars} ⭐</span>
                    <span className="font-bold">Próximo nível: {starsForNext} ⭐</span>
                </div>
            </div>
        </div>
    );
};
