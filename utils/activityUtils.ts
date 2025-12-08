import { Coordinate, ActivityMode } from '../types';

// Limites de velocidade por modalidade (km/h)
export const SPEED_LIMITS = {
    running: 25,  // Inclui caminhada (3-7 km/h) e corrida (8-25 km/h)
    cycling: 50   // Ciclismo normal
};

// Limite para detecção de fraude (veículos motorizados)
export const FRAUD_THRESHOLD = 55; // km/h

// Multiplicadores de pontos por modalidade
export const ACTIVITY_MULTIPLIERS = {
    running: 1.0,  // 100% dos pontos
    cycling: 0.6   // 60% dos pontos
};

/**
 * Calcula a velocidade entre dois pontos
 * @param p1 Primeiro ponto
 * @param p2 Segundo ponto
 * @returns Velocidade em km/h
 */
export const calculateSpeed = (p1: Coordinate, p2: Coordinate): number => {
    const timeDiff = (p2.timestamp - p1.timestamp) / 1000; // segundos
    if (timeDiff === 0) return 0;

    // Calcular distância usando Haversine
    const R = 6371; // Raio da Terra em km
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLon = (p2.lng - p1.lng) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // km

    const speed = (distance / timeDiff) * 3600; // km/h
    return speed;
};

/**
 * Calcula a velocidade média de um percurso
 * @param path Caminho percorrido
 * @returns Velocidade média em km/h
 */
export const calculateAverageSpeed = (path: Coordinate[]): number => {
    if (path.length < 2) return 0;

    let totalSpeed = 0;
    let validPoints = 0;

    for (let i = 1; i < path.length; i++) {
        const speed = calculateSpeed(path[i - 1], path[i]);
        if (speed > 0 && speed < 200) { // Filtrar valores absurdos
            totalSpeed += speed;
            validPoints++;
        }
    }

    return validPoints > 0 ? totalSpeed / validPoints : 0;
};

/**
 * Calcula a velocidade máxima de um percurso
 * @param path Caminho percorrido
 * @returns Velocidade máxima em km/h
 */
export const calculateMaxSpeed = (path: Coordinate[]): number => {
    if (path.length < 2) return 0;

    let maxSpeed = 0;

    for (let i = 1; i < path.length; i++) {
        const speed = calculateSpeed(path[i - 1], path[i]);
        if (speed > maxSpeed && speed < 200) { // Filtrar valores absurdos
            maxSpeed = speed;
        }
    }

    return maxSpeed;
};

/**
 * Valida se a atividade é compatível com a modalidade selecionada
 * @param mode Modalidade selecionada
 * @param avgSpeed Velocidade média
 * @param maxSpeed Velocidade máxima
 * @returns Resultado da validação
 */
export const validateActivity = (
    mode: ActivityMode,
    avgSpeed: number,
    maxSpeed: number
): { valid: boolean; reason?: string; suspicionLevel: 'low' | 'medium' | 'high' } => {

    // Bloqueio automático - possível veículo motorizado
    if (maxSpeed > FRAUD_THRESHOLD) {
        return {
            valid: false,
            reason: '🚫 Velocidade suspeita detectada! Possível uso de veículo motorizado.',
            suspicionLevel: 'high'
        };
    }

    // Validar compatibilidade com modalidade
    if (mode === 'running' && avgSpeed > SPEED_LIMITS.running) {
        return {
            valid: false,
            reason: `⚠️ Velocidade média (${avgSpeed.toFixed(1)} km/h) incompatível com corrida/caminhada.`,
            suspicionLevel: 'high'
        };
    }

    if (mode === 'cycling' && avgSpeed > SPEED_LIMITS.cycling) {
        return {
            valid: false,
            reason: `⚠️ Velocidade média (${avgSpeed.toFixed(1)} km/h) muito alta para ciclismo.`,
            suspicionLevel: 'high'
        };
    }

    // Alerta se velocidade está próxima do limite
    if (mode === 'running' && avgSpeed > SPEED_LIMITS.running * 0.8) {
        return {
            valid: true,
            reason: `⚠️ Velocidade próxima do limite para corrida.`,
            suspicionLevel: 'medium'
        };
    }

    if (mode === 'cycling' && avgSpeed > SPEED_LIMITS.cycling * 0.8) {
        return {
            valid: true,
            reason: `⚠️ Velocidade próxima do limite para ciclismo.`,
            suspicionLevel: 'medium'
        };
    }

    return { valid: true, suspicionLevel: 'low' };
};

/**
 * Calcula os pontos ajustados pela modalidade
 * @param basePoints Pontos base
 * @param mode Modalidade
 * @returns Pontos ajustados
 */
export const calculateAdjustedPoints = (basePoints: number, mode: ActivityMode): number => {
    return Math.floor(basePoints * ACTIVITY_MULTIPLIERS[mode]);
};

/**
 * Retorna o emoji da modalidade
 */
export const getActivityEmoji = (mode: ActivityMode): string => {
    return mode === 'running' ? '🏃' : '🚴';
};

/**
 * Retorna o nome da modalidade
 */
export const getActivityName = (mode: ActivityMode): string => {
    return mode === 'running' ? 'Corrida/Caminhada' : 'Ciclismo';
};
