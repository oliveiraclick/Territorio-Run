import { Coordinate } from '../types';

// Constantes para validação GPS
const MAX_GPS_ACCURACY = 20; // metros - precisão máxima aceitável
const MIN_DISTANCE_BETWEEN_POINTS = 3; // metros - distância mínima entre pontos

export const calculateTotalDistance = (path: Coordinate[]): number => {
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    totalDistance += getDistanceFromLatLonInKm(p1.lat, p1.lng, p2.lat, p2.lng);
  }
  return totalDistance;
};

// Haversine formula
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  return getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);
};

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

/**
 * Valida se a precisão do GPS está dentro do limite aceitável
 * @param accuracy Precisão em metros
 * @returns true se a precisão é boa o suficiente
 */
export const isValidGPSAccuracy = (accuracy: number): boolean => {
  return accuracy > 0 && accuracy <= MAX_GPS_ACCURACY;
};

/**
 * Calcula distância entre dois pontos em metros
 * @param point1 Primeiro ponto
 * @param point2 Segundo ponto
 * @returns Distância em metros
 */
export const getDistanceBetweenPoints = (point1: Coordinate, point2: Coordinate): number => {
  return getDistanceFromLatLonInKm(point1.lat, point1.lng, point2.lat, point2.lng) * 1000; // converter km para metros
};

/**
 * Verifica se um novo ponto deve ser adicionado ao caminho
 * @param newPoint Novo ponto GPS
 * @param lastPoint Último ponto adicionado
 * @returns true se o ponto deve ser adicionado
 */
export const shouldAddPoint = (newPoint: Coordinate, lastPoint: Coordinate | null): boolean => {
  // Se não há ponto anterior, adiciona o primeiro
  if (!lastPoint) return true;

  // Calcula distância do último ponto
  const distance = getDistanceBetweenPoints(newPoint, lastPoint);

  // Só adiciona se a distância for maior que o mínimo
  return distance >= MIN_DISTANCE_BETWEEN_POINTS;
};

export const generateRandomColor = (): string => {
  const colors = ['#39ff14', '#ff073a', '#00e5ff', '#ffff00', '#bf00ff'];
  return colors[Math.floor(Math.random() * colors.length)];
};
