import { Coordinate, Territory } from '../types';

/**
 * Calcula a distância necessária para conquistar um território
 * baseado no número de conquistas anteriores
 * @param originalDistance Distância original em km
 * @param conquestCount Número de vezes que foi conquistado
 * @returns Distância necessária em km
 */
export const getRequiredDistance = (originalDistance: number, conquestCount: number = 0): number => {
    // Cada conquista adiciona 10% à distância necessária
    const multiplier = 1 + (0.10 * conquestCount);
    return originalDistance * multiplier;
};

/**
 * Calcula o bônus de estrelas por conquistar um território
 * Quanto mais disputado, mais estrelas vale
 * @param conquestCount Número de conquistas do território
 * @param isReconquest Se é reconquista do próprio território
 * @returns Número de estrelas ganhas
 */
export const calculateConquestBonus = (conquestCount: number = 0, isReconquest: boolean = false): number => {
    const baseBonus = isReconquest ? 30 : 50; // Reconquista vale menos
    const disputeBonus = conquestCount * 10; // +10 estrelas por conquista anterior
    return baseBonus + disputeBonus;
};

/**
 * Verifica se um ponto está dentro de um polígono usando Ray Casting Algorithm
 * @param point Ponto a verificar
 * @param polygon Polígono (array de coordenadas)
 * @returns true se o ponto está dentro do polígono
 */
export const isPointInPolygon = (point: Coordinate, polygon: Coordinate[]): boolean => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lat, yi = polygon[i].lng;
        const xj = polygon[j].lat, yj = polygon[j].lng;

        const intersect = ((yi > point.lng) !== (yj > point.lng))
            && (point.lat < (xj - xi) * (point.lng - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

/**
 * Calcula a porcentagem de sobreposição entre um caminho e um território
 * @param path Caminho percorrido pelo jogador
 * @param territory Território a verificar
 * @returns Porcentagem de sobreposição (0-100)
 */
export const calculatePathOverlap = (path: Coordinate[], territory: Territory): number => {
    if (path.length === 0) return 0;

    let pointsInside = 0;
    for (const point of path) {
        if (isPointInPolygon(point, territory.coordinates)) {
            pointsInside++;
        }
    }

    return (pointsInside / path.length) * 100;
};

/**
 * Verifica se um caminho representa uma tentativa de conquista de um território
 * @param path Caminho percorrido
 * @param territory Território a verificar
 * @param minOverlap Porcentagem mínima de sobreposição (padrão: 50%)
 * @returns true se é uma tentativa de conquista
 */
export const isConquestAttempt = (
    path: Coordinate[],
    territory: Territory,
    minOverlap: number = 50
): boolean => {
    const overlap = calculatePathOverlap(path, territory);
    return overlap >= minOverlap;
};

/**
 * Valida se uma conquista foi bem-sucedida
 * @param distanceTraveled Distância percorrida pelo jogador em km
 * @param territory Território sendo conquistado
 * @returns true se a conquista foi bem-sucedida
 */
export const validateConquest = (distanceTraveled: number, territory: Territory): boolean => {
    const originalDistance = territory.originalDistance || 0;
    const conquestCount = territory.conquestCount || 0;
    const requiredDistance = getRequiredDistance(originalDistance, conquestCount);

    return distanceTraveled >= requiredDistance;
};

/**
 * Encontra territórios que o caminho sobrepõe
 * @param path Caminho percorrido
 * @param territories Lista de todos os territórios
 * @param currentUserId ID do usuário atual (para excluir seus próprios territórios)
 * @returns Array de territórios sobrepostos
 */
export const findOverlappingTerritories = (
    path: Coordinate[],
    territories: Territory[],
    currentUserId: string
): Territory[] => {
    return territories.filter(territory => {
        // Não pode conquistar seu próprio território
        if (territory.ownerId === currentUserId) return false;

        // Verifica se há sobreposição suficiente
        return isConquestAttempt(path, territory);
    });
};
