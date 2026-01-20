import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  LobbyData,
  PlayerData,
  RaceState,
  TrackType,
  DifficultyLevel,
  GameSettings,
  LeaderboardEntry
} from '../../../shared/types/index';

type GameScreen = 'menu' | 'lobby' | 'race' | 'results' | 'settings';

interface GameState {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  currentScreen: GameScreen;
  lobbies: LobbyData[];
  currentLobby: LobbyData | null;
  raceState: RaceState | null;
  raceResults: PlayerData[];
  localPlayerId: string | null;
  settings: GameSettings;
  leaderboard: LeaderboardEntry[];
  countdown: number;
  
  setScreen: (screen: GameScreen) => void;
  initializeSocket: () => void;
  createLobby: (name: string, maxPlayers: number, trackType: TrackType, difficulty: DifficultyLevel, isPublic: boolean) => void;
  joinLobby: (lobbyId: string) => void;
  leaveLobby: () => void;
  setReady: (isReady: boolean) => void;
  startRace: () => void;
  finishRace: (finalTime: number, lapTimes: number[]) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  socket: null,
  currentScreen: 'menu',
  lobbies: [],
  currentLobby: null,
  raceState: null,
  raceResults: [],
  localPlayerId: null,
  leaderboard: [],
  countdown: 0,
  settings: {
    graphics: {
      quality: 'medium',
      shadows: true,
      antialiasing: true,
      particleEffects: true
    },
    audio: {
      masterVolume: 0.7,
      musicVolume: 0.5,
      sfxVolume: 0.8
    },
    controls: {
      sensitivity: 1.0,
      invertY: false
    }
  },

  setScreen: (screen) => set({ currentScreen: screen }),

  initializeSocket: () => {
    const socket = io('http://localhost:3000');

    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
      set({ localPlayerId: socket.id });
    });

    socket.on('lobbyList', (lobbies) => {
      set({ lobbies });
    });

    socket.on('lobbyCreated', (lobby) => {
      set({ currentLobby: lobby, currentScreen: 'lobby' });
    });

    socket.on('lobbyJoined', (lobby) => {
      set({ currentLobby: lobby, currentScreen: 'lobby' });
    });

    socket.on('lobbyLeft', () => {
      set({ currentLobby: null, currentScreen: 'menu' });
    });

    socket.on('lobbyUpdated', (lobby) => {
      set({ currentLobby: lobby });
    });

    socket.on('playerJoined', (player) => {
      const { currentLobby } = get();
      if (currentLobby) {
        const playerExists = currentLobby.players.some(p => p.id === player.id);
        if (!playerExists) {
          set({
            currentLobby: {
              ...currentLobby,
              players: [...currentLobby.players, player]
            }
          });
        }
      }
    });

    socket.on('playerLeft', (playerId) => {
      const { currentLobby } = get();
      if (currentLobby) {
        set({
          currentLobby: {
            ...currentLobby,
            players: currentLobby.players.filter(p => p.id !== playerId)
          }
        });
      }
    });

    socket.on('playerReady', (playerId, isReady) => {
      const { currentLobby } = get();
      if (currentLobby) {
        set({
          currentLobby: {
            ...currentLobby,
            players: currentLobby.players.map(p =>
              p.id === playerId ? { ...p, isReady } : p
            )
          }
        });
      }
    });

    socket.on('raceStarting', (countdown) => {
      set({ countdown });
    });

    socket.on('raceStarted', (raceState) => {
      set({ raceState, currentScreen: 'race', countdown: 0 });
    });

    socket.on('raceFinished', (results) => {
      set({ raceResults: results, currentScreen: 'results' });
    });

    socket.on('error', (message) => {
      console.error('Server error:', message);
      alert(message);
    });

    set({ socket });
  },

  createLobby: (name, maxPlayers, trackType, difficulty, isPublic) => {
    const { socket } = get();
    if (socket) {
      socket.emit('createLobby', { name, maxPlayers, trackType, difficulty, isPublic });
    }
  },

  joinLobby: (lobbyId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('joinLobby', lobbyId);
    }
  },

  leaveLobby: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('leaveLobby');
    }
  },

  setReady: (isReady) => {
    const { socket } = get();
    if (socket) {
      socket.emit('setReady', isReady);
    }
  },

  startRace: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('startRace');
    }
  },

  finishRace: (finalTime, lapTimes) => {
    const { socket } = get();
    if (socket) {
      socket.emit('finishRace', finalTime, lapTimes);
    }
  },

  updateSettings: (newSettings) => {
    const { settings } = get();
    set({ settings: { ...settings, ...newSettings } });
  }
}));
