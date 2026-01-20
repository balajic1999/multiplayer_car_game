export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
  INSANE = 'insane'
}

export enum TrackType {
  CITY = 'city',
  MOUNTAIN = 'mountain',
  DESERT = 'desert'
}

export enum CarType {
  SPEEDSTER = 'speedster',
  BALANCED = 'balanced',
  HEAVY = 'heavy'
}

export enum GameMode {
  SINGLE_PLAYER = 'singlePlayer',
  MULTIPLAYER = 'multiplayer',
  TIME_TRIAL = 'timeTrial'
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface CarStats {
  speed: number;
  acceleration: number;
  handling: number;
  weight: number;
  durability: number;
}

export interface CarState {
  position: Vector3;
  rotation: Quaternion;
  velocity: Vector3;
  angularVelocity: Vector3;
  damage: number;
  currentLap: number;
  lastCheckpoint: number;
  speed: number;
}

export interface PlayerData {
  id: string;
  name: string;
  carType: CarType;
  carState: CarState;
  color: string;
  isReady: boolean;
  position: number;
  lapTimes: number[];
  totalTime: number;
  finished: boolean;
}

export interface LobbyData {
  id: string;
  name: string;
  hostId: string;
  players: PlayerData[];
  maxPlayers: number;
  trackType: TrackType;
  difficulty: DifficultyLevel;
  isStarted: boolean;
  isPublic: boolean;
}

export interface RaceState {
  lobbyId: string;
  startTime: number;
  isActive: boolean;
  playerStates: Record<string, PlayerData>;
  raceTime: number;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  trackType: TrackType;
  difficulty: DifficultyLevel;
  lapTime: number;
  totalTime: number;
  carType: CarType;
  timestamp: number;
}

export interface PlayerProfile {
  id: string;
  name: string;
  gamesPlayed: number;
  wins: number;
  totalRaceTime: number;
  bestLapTimes: Record<string, number>;
  unlockedTracks: TrackType[];
  level: number;
  experience: number;
}

export interface TrackData {
  type: TrackType;
  name: string;
  description: string;
  length: number;
  checkpoints: Vector3[];
  startPosition: Vector3;
  startRotation: number;
  requiredLevel: number;
  difficulty: DifficultyLevel;
}

export interface GameSettings {
  graphics: {
    quality: 'low' | 'medium' | 'high' | 'ultra';
    shadows: boolean;
    antialiasing: boolean;
    particleEffects: boolean;
  };
  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
  };
  controls: {
    sensitivity: number;
    invertY: boolean;
  };
}

export interface ServerToClientEvents {
  lobbyList: (lobbies: LobbyData[]) => void;
  lobbyCreated: (lobby: LobbyData) => void;
  lobbyJoined: (lobby: LobbyData) => void;
  lobbyLeft: () => void;
  lobbyUpdated: (lobby: LobbyData) => void;
  playerJoined: (player: PlayerData) => void;
  playerLeft: (playerId: string) => void;
  playerReady: (playerId: string, isReady: boolean) => void;
  raceStarting: (countdown: number) => void;
  raceStarted: (raceState: RaceState) => void;
  raceUpdate: (playerStates: Record<string, PlayerData>) => void;
  raceFinished: (results: PlayerData[]) => void;
  playerStateUpdate: (playerId: string, state: CarState) => void;
  error: (message: string) => void;
  leaderboardUpdate: (entries: LeaderboardEntry[]) => void;
}

export interface ClientToServerEvents {
  createLobby: (data: {
    name: string;
    maxPlayers: number;
    trackType: TrackType;
    difficulty: DifficultyLevel;
    isPublic: boolean;
  }) => void;
  joinLobby: (lobbyId: string) => void;
  leaveLobby: () => void;
  setReady: (isReady: boolean) => void;
  startRace: () => void;
  updateCarState: (state: CarState) => void;
  finishRace: (finalTime: number, lapTimes: number[]) => void;
  getLeaderboard: (trackType: TrackType, difficulty: DifficultyLevel) => void;
  updateProfile: (profile: Partial<PlayerProfile>) => void;
}

export interface DifficultySettings {
  aiSpeed: number;
  aiAggression: number;
  damageMultiplier: number;
  physicsRealism: number;
  allowReset: boolean;
}

export const DIFFICULTY_SETTINGS: Record<DifficultyLevel, DifficultySettings> = {
  [DifficultyLevel.EASY]: {
    aiSpeed: 0.6,
    aiAggression: 0.3,
    damageMultiplier: 0.5,
    physicsRealism: 0.7,
    allowReset: true
  },
  [DifficultyLevel.MEDIUM]: {
    aiSpeed: 0.8,
    aiAggression: 0.5,
    damageMultiplier: 0.75,
    physicsRealism: 0.85,
    allowReset: true
  },
  [DifficultyLevel.HARD]: {
    aiSpeed: 0.95,
    aiAggression: 0.7,
    damageMultiplier: 1.0,
    physicsRealism: 1.0,
    allowReset: true
  },
  [DifficultyLevel.EXPERT]: {
    aiSpeed: 1.1,
    aiAggression: 0.85,
    damageMultiplier: 1.25,
    physicsRealism: 1.0,
    allowReset: false
  },
  [DifficultyLevel.INSANE]: {
    aiSpeed: 1.3,
    aiAggression: 1.0,
    damageMultiplier: 1.5,
    physicsRealism: 1.0,
    allowReset: false
  }
};

export const CAR_STATS: Record<CarType, CarStats> = {
  [CarType.SPEEDSTER]: {
    speed: 100,
    acceleration: 85,
    handling: 70,
    weight: 800,
    durability: 60
  },
  [CarType.BALANCED]: {
    speed: 85,
    acceleration: 80,
    handling: 85,
    weight: 1000,
    durability: 80
  },
  [CarType.HEAVY]: {
    speed: 75,
    acceleration: 70,
    handling: 90,
    weight: 1300,
    durability: 100
  }
};
