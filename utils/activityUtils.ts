import { Coordinate, ActivityMode } from '../types';

// Limites de velocidade por modalidade (km/h)
export const SPEED_LIMITS = {
    running: 45,  // Aumentado para tolerar sprints e picos (recorde mundial ~44km/h)
    cycling: 60   // Aumentado para permitir descidas rápidas
};

// Limite para detecção de fraude (veículos motorizados)
// Só será considerado fraude se houver velocidade SUSTENTADA acima disso
export const FRAUD_THRESHOLD = 80; // km/h

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
        // Filtra ruído (parado) e valores absurdos (> 150km/h - glitch de GPS)
        if (speed > 1.0 && speed < 150) {
            totalSpeed += speed;
            validPoints++;
        }
    }

    return validPoints > 0 ? totalSpeed / validPoints : 0;
};

/**
 * Calcula a velocidade máxima de um percurso com filtro de ruído
 * Considera a média móvel de 3 pontos para evitar picos isolados de GPS
 * @param path Caminho percorrido
 * @returns Velocidade máxima "real" em km/h
 */
export const calculateMaxSpeed = (path: Coordinate[]): number => {
    if (path.length < 4) return 0; // Precisa de pelo menos alguns pontos para média móvel

    let maxSustainedSpeed = 0;

    // Analisa janelas de 3 segundos/pontos para verificar consistência
    for (let i = 3; i < path.length; i++) {
        const s1 = calculateSpeed(path[i - 3], path[i - 2]);
        const s2 = calculateSpeed(path[i - 2], path[i - 1]);
        const s3 = calculateSpeed(path[i - 1], path[i]);

        // Se todos os pontos da janela são válidos (não são glitches extremos > 150)
        if (s1 < 150 && s2 < 150 && s3 < 150) {
            const avgWindow = (s1 + s2 + s3) / 3;
            if (avgWindow > maxSustainedSpeed) {
                maxSustainedSpeed = avgWindow;
            }
        }
    }

    return maxSustainedSpeed;
};

/**
 * Valida se a atividade é compatível com a modalidade selecionada
 * @param mode Modalidade selecionada
 * @param avgSpeed Velocidade média
 * @param maxSpeed Velocidade máxima calculada
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
            reason: '🚫 Velocidade sustentada de veículo detectada!',
            suspicionLevel: 'high'
        };
    }

    // Validar compatibilidade com modalidade (Running)
    if (mode === 'running') {
        if (avgSpeed > SPEED_LIMITS.running) {
            return {
                valid: false,
                reason: `⚠️ Média de ${avgSpeed.toFixed(1)} km/h é incompatível com corrida humana.`,
                suspicionLevel: 'high'
            };
        }
    }

    // Validar compatibilidade com modalidade (Cycling)
    if (mode === 'cycling') {
        if (avgSpeed > SPEED_LIMITS.cycling) {
            return {
                valid: false,
                reason: `⚠️ Média de ${avgSpeed.toFixed(1)} km/h excessiva para ciclismo amador.`,
                suspicionLevel: 'high'
            };
        }
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
