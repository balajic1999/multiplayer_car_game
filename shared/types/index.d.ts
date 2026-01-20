export declare enum DifficultyLevel {
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard",
    EXPERT = "expert",
    INSANE = "insane"
}
export declare enum TrackType {
    CITY = "city",
    MOUNTAIN = "mountain",
    DESERT = "desert"
}
export declare enum CarType {
    SPEEDSTER = "speedster",
    BALANCED = "balanced",
    HEAVY = "heavy"
}
export declare enum GameMode {
    SINGLE_PLAYER = "singlePlayer",
    MULTIPLAYER = "multiplayer",
    TIME_TRIAL = "timeTrial"
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
export declare const DIFFICULTY_SETTINGS: Record<DifficultyLevel, DifficultySettings>;
export declare const CAR_STATS: Record<CarType, CarStats>;
//# sourceMappingURL=index.d.ts.map