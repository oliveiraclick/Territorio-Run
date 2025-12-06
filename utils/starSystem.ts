
// Sistema de Estrelas e Níveis

export const STARS_PER_LEVEL = 100; // Estrelas base por nível
export const LEVEL_MULTIPLIER = 1.5; // Multiplicador de estrelas por nível

// Ações que dão Estrelas ⭐
export const STAR_REWARDS = {
    CONQUER_TERRITORY: 50,
    DISTANCE_KM: 10, // Por km percorrido
    FIRST_RUN: 100,
    DAILY_LOGIN: 20,
    SHARE_CONQUEST: 15,
    NIGHT_CONQUEST: 75, // Conquista noturna (22h-6h)
    LARGE_TERRITORY: 100, // Território > 10.000m²
} as const;

/**
 * Calcula o nível baseado nas estrelas totais
 */
export function calculateLevel(stars: number): number {
    let level = 1;
    let starsNeeded = STARS_PER_LEVEL;
    let totalStarsForLevel = 0;

    while (stars >= totalStarsForLevel + starsNeeded) {
        totalStarsForLevel += starsNeeded;
        level++;
        starsNeeded = Math.floor(STARS_PER_LEVEL * Math.pow(LEVEL_MULTIPLIER, level - 1));
    }

    return level;
}

/**
 * Calcula as estrelas necessárias para o próximo nível
 */
export function getStarsForNextLevel(currentLevel: number): number {
    return Math.floor(STARS_PER_LEVEL * Math.pow(LEVEL_MULTIPLIER, currentLevel - 1));
}

/**
 * Calcula o total de estrelas necessário para alcançar um nível
 */
export function getTotalStarsForLevel(level: number): number {
    let totalStars = 0;
    for (let i = 1; i < level; i++) {
        totalStars += getStarsForNextLevel(i);
    }
    return totalStars;
}

/**
 * Calcula o progresso atual no nível (0-1)
 */
export function getLevelProgress(stars: number, level: number): number {
    const starsForCurrentLevel = getTotalStarsForLevel(level);
    const starsForNextLevel = getTotalStarsForLevel(level + 1);
    const starsInCurrentLevel = stars - starsForCurrentLevel;
    const starsNeededForLevel = starsForNextLevel - starsForCurrentLevel;

    return Math.min(1, Math.max(0, starsInCurrentLevel / starsNeededForLevel));
}

/**
 * Adiciona estrelas e retorna informações sobre ganho
 */
export function addStars(currentStars: number, starsToAdd: number): {
    newStars: number;
    oldLevel: number;
    newLevel: number;
    leveledUp: boolean;
} {
    const oldLevel = calculateLevel(currentStars);
    const newStars = currentStars + starsToAdd;
    const newLevel = calculateLevel(newStars);

    return {
        newStars,
        oldLevel,
        newLevel,
        leveledUp: newLevel > oldLevel,
    };
}

/**
 * Formata estrelas para exibição
 */
export function formatStars(stars: number): string {
    if (stars >= 1000000) {
        return `${(stars / 1000000).toFixed(1)}M`;
    }
    if (stars >= 1000) {
        return `${(stars / 1000).toFixed(1)}K`;
    }
    return stars.toString();
}

/**
 * Verifica se é horário noturno (22h-6h)
 */
export function isNightTime(): boolean {
    const hour = new Date().getHours();
    return hour >= 22 || hour < 6;
}
