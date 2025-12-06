import { Coordinate } from '../types';

/**
 * Calcula a área de um polígono em metros quadrados
 * Usa a fórmula de Shoelace com coordenadas geográficas
 */
export function calculatePolygonArea(coordinates: Coordinate[]): number {
    if (coordinates.length < 3) return 0;

    const EARTH_RADIUS = 6371000; // metros

    // Converter para radianos e calcular área
    let area = 0;
    const coords = coordinates.map(c => ({
        lat: (c.lat * Math.PI) / 180,
        lng: (c.lng * Math.PI) / 180,
    }));

    for (let i = 0; i < coords.length; i++) {
        const j = (i + 1) % coords.length;
        area += coords[i].lng * coords[j].lat;
        area -= coords[j].lng * coords[i].lat;
    }

    area = Math.abs(area) / 2;
    area = area * EARTH_RADIUS * EARTH_RADIUS;

    return Math.round(area);
}

/**
 * Calcula o ritmo médio em minutos por km
 */
export function calculateAveragePace(distanceKm: number, durationSeconds: number): number {
    if (distanceKm === 0) return 0;
    const paceMinPerKm = (durationSeconds / 60) / distanceKm;
    return Math.round(paceMinPerKm * 100) / 100;
}

/**
 * Calcula a velocidade atual em km/h baseado nos últimos pontos
 */
export function calculateCurrentSpeed(
    coordinates: Coordinate[],
    lastN: number = 5
): number {
    if (coordinates.length < 2) return 0;

    const recentCoords = coordinates.slice(-lastN);
    if (recentCoords.length < 2) return 0;

    const first = recentCoords[0];
    const last = recentCoords[recentCoords.length - 1];

    const distance = calculateDistance(first, last);
    const timeSeconds = (last.timestamp - first.timestamp) / 1000;

    if (timeSeconds === 0) return 0;

    const speedKmh = (distance / timeSeconds) * 3600;
    return Math.round(speedKmh * 10) / 10;
}

/**
 * Calcula distância entre dois pontos em km (Haversine)
 */
function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
    const R = 6371; // Raio da Terra em km
    const dLat = toRad(coord2.lat - coord1.lat);
    const dLon = toRad(coord2.lng - coord1.lng);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coord1.lat)) *
        Math.cos(toRad(coord2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

/**
 * Formata duração em segundos para HH:MM:SS
 */
export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
}

/**
 * Formata ritmo para exibição (MM:SS/km)
 */
export function formatPace(paceMinPerKm: number): string {
    if (paceMinPerKm === 0 || !isFinite(paceMinPerKm)) return '--:--';

    const minutes = Math.floor(paceMinPerKm);
    const seconds = Math.round((paceMinPerKm - minutes) * 60);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Formata distância para exibição
 */
export function formatDistance(km: number): string {
    if (km < 1) {
        return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(2)}km`;
}

/**
 * Formata área para exibição
 */
export function formatArea(m2: number): string {
    if (m2 >= 1000000) {
        return `${(m2 / 1000000).toFixed(2)}km²`;
    }
    if (m2 >= 10000) {
        return `${(m2 / 10000).toFixed(2)}ha`;
    }
    return `${Math.round(m2)}m²`;
}
