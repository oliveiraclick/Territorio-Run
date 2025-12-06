import { Coordinate } from '../types';

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

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export const generateRandomColor = (): string => {
  const colors = ['#39ff14', '#ff073a', '#00e5ff', '#ffff00', '#bf00ff'];
  return colors[Math.floor(Math.random() * colors.length)];
};
