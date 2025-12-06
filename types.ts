
export interface Coordinate {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface Territory {
  id: string;
  name: string;
  coordinates: Coordinate[]; // simplified polygon
  ownerId: string;
  ownerName: string; // The display name of the owner (e.g., "Viper")
  color: string;
  value: number; // Points value
  conqueredAt: number;
  description?: string; // AI Generated description
}

export interface UserStats {
  stars: number; // Mudado de xp para stars
  level: number;
  totalDistance: number; // km
  totalTerritories: number;
  totalTime: number; // seconds
  lastActive: number;
}

export interface User {
  id: string;
  name: string; // The "Codinome"
  phone?: string;
  score: number;
  territoriesHeld: number;
  joinedAt: number;
  stats?: UserStats;
}

export interface ActivityEvent {
  id: string;
  type: 'conquer' | 'lost' | 'defend' | 'levelup' | 'stars';
  message: string;
  timestamp: number;
  territoryId?: string; // Optional link to a specific territory
}

export interface RunMetrics {
  area: number; // m²
  distance: number; // km
  duration: number; // seconds
  avgPace: number; // min/km
  currentSpeed: number; // km/h
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  level: number;
  stars: number; // Mudado de xp para stars
  totalTerritories: number;
  totalDistance: number;
}

export interface StarGain {
  amount: number;
  reason: string;
  leveledUp?: boolean;
  newLevel?: number;
}
