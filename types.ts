
export interface Coordinate {
  lat: number;
  lng: number;
  timestamp: number;
}

export type ActivityMode = 'running' | 'cycling';

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
  conquestCount?: number; // Número de vezes que foi conquistado
  previousOwnerId?: string; // ID do dono anterior
  previousOwnerName?: string; // Nome do dono anterior
  originalDistance?: number; // Distância original do percurso em km
  challengeId?: string; // ID do desafio (se for território de desafio)
  visibility: 'public' | 'team'; // Visibilidade do território
  teamId?: string; // ID da equipe (se visibility = 'team')
  activityMode?: ActivityMode; // Modalidade usada (corrida ou bike)
  avgSpeed?: number; // Velocidade média em km/h
  maxSpeed?: number; // Velocidade máxima em km/h
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
  teamId?: string; // ID da equipe
  teamName?: string; // Nome da equipe
  role?: 'owner' | 'member' | 'individual'; // Papel do usuário
}

export interface ActivityEvent {
  id: string;
  type: 'conquer' | 'lost' | 'defend' | 'levelup' | 'stars' | 'fraud';
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

export interface Team {
  id: string;
  name: string;
  slug: string; // URL-friendly: "equipe-nike"
  ownerId: string;
  ownerName: string;
  createdAt: number;
  memberCount: number;
}

export interface Challenge {
  id: string;
  name: string;
  description?: string;
  teamId: string;
  territoryId: string;
  points: number; // Pontos que vale o desafio
  startDate: number;
  endDate: number;
  isActive: boolean;
  createdAt: number;
  createdBy: string;
}

export interface TeamMember {
  userId: string;
  userName: string;
  joinedAt: number;
  totalDistance: number;
  totalTerritories: number;
  totalStars: number;
  challengesCompleted: number;
}
