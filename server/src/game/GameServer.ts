import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  LobbyData,
  PlayerData,
  RaceState,
  TrackType,
  DifficultyLevel,
  CarState
} from '../../../shared/types/index.js';
import { CarType } from '../../../shared/types/index.js';

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export class GameServer {
  private io: Server<ClientToServerEvents, ServerToClientEvents>;
  private lobbies: Map<string, LobbyData>;
  private playerLobbies: Map<string, string>;
  private raceStates: Map<string, RaceState>;

  constructor(io: Server<ClientToServerEvents, ServerToClientEvents>) {
    this.io = io;
    this.lobbies = new Map();
    this.playerLobbies = new Map();
    this.raceStates = new Map();
  }

  initialize(): void {
    this.io.on('connection', (socket: GameSocket) => {
      console.log(`Player connected: ${socket.id}`);

      this.setupSocketHandlers(socket);

      socket.emit('lobbyList', Array.from(this.lobbies.values()));

      socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        this.handlePlayerDisconnect(socket);
      });
    });
  }

  private setupSocketHandlers(socket: GameSocket): void {
    socket.on('createLobby', (data) => {
      this.handleCreateLobby(socket, data);
    });

    socket.on('joinLobby', (lobbyId) => {
      this.handleJoinLobby(socket, lobbyId);
    });

    socket.on('leaveLobby', () => {
      this.handleLeaveLobby(socket);
    });

    socket.on('setReady', (isReady) => {
      this.handleSetReady(socket, isReady);
    });

    socket.on('startRace', () => {
      this.handleStartRace(socket);
    });

    socket.on('updateCarState', (state) => {
      this.handleUpdateCarState(socket, state);
    });

    socket.on('finishRace', (finalTime, lapTimes) => {
      this.handleFinishRace(socket, finalTime, lapTimes);
    });
  }

  private handleCreateLobby(
    socket: GameSocket,
    data: {
      name: string;
      maxPlayers: number;
      trackType: TrackType;
      difficulty: DifficultyLevel;
      isPublic: boolean;
    }
  ): void {
    const lobbyId = uuidv4();
    
    const player: PlayerData = {
      id: socket.id,
      name: `Player ${socket.id.substring(0, 4)}`,
      carType: CarType.BALANCED,
      carState: this.getInitialCarState(),
      color: this.getRandomColor(),
      isReady: false,
      position: 1,
      lapTimes: [],
      totalTime: 0,
      finished: false
    };

    const lobby: LobbyData = {
      id: lobbyId,
      name: data.name,
      hostId: socket.id,
      players: [player],
      maxPlayers: Math.min(Math.max(data.maxPlayers, 2), 8),
      trackType: data.trackType,
      difficulty: data.difficulty,
      isStarted: false,
      isPublic: data.isPublic
    };

    this.lobbies.set(lobbyId, lobby);
    this.playerLobbies.set(socket.id, lobbyId);
    
    socket.join(lobbyId);
    socket.emit('lobbyCreated', lobby);
    
    if (data.isPublic) {
      this.io.emit('lobbyList', Array.from(this.lobbies.values()));
    }

    console.log(`Lobby created: ${lobbyId} by ${socket.id}`);
  }

  private handleJoinLobby(socket: GameSocket, lobbyId: string): void {
    const lobby = this.lobbies.get(lobbyId);

    if (!lobby) {
      socket.emit('error', 'Lobby not found');
      return;
    }

    if (lobby.isStarted) {
      socket.emit('error', 'Race already started');
      return;
    }

    if (lobby.players.length >= lobby.maxPlayers) {
      socket.emit('error', 'Lobby is full');
      return;
    }

    const player: PlayerData = {
      id: socket.id,
      name: `Player ${socket.id.substring(0, 4)}`,
      carType: CarType.BALANCED,
      carState: this.getInitialCarState(),
      color: this.getRandomColor(),
      isReady: false,
      position: lobby.players.length + 1,
      lapTimes: [],
      totalTime: 0,
      finished: false
    };

    lobby.players.push(player);
    this.playerLobbies.set(socket.id, lobbyId);
    
    socket.join(lobbyId);
    socket.emit('lobbyJoined', lobby);
    this.io.to(lobbyId).emit('playerJoined', player);
    this.io.to(lobbyId).emit('lobbyUpdated', lobby);

    console.log(`Player ${socket.id} joined lobby ${lobbyId}`);
  }

  private handleLeaveLobby(socket: GameSocket): void {
    const lobbyId = this.playerLobbies.get(socket.id);
    if (!lobbyId) return;

    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return;

    lobby.players = lobby.players.filter(p => p.id !== socket.id);
    this.playerLobbies.delete(socket.id);
    socket.leave(lobbyId);

    if (lobby.players.length === 0) {
      this.lobbies.delete(lobbyId);
      this.raceStates.delete(lobbyId);
      this.io.emit('lobbyList', Array.from(this.lobbies.values()));
      console.log(`Lobby ${lobbyId} deleted (empty)`);
    } else {
      if (lobby.hostId === socket.id) {
        lobby.hostId = lobby.players[0].id;
      }
      
      this.io.to(lobbyId).emit('playerLeft', socket.id);
      this.io.to(lobbyId).emit('lobbyUpdated', lobby);
    }

    socket.emit('lobbyLeft');
    console.log(`Player ${socket.id} left lobby ${lobbyId}`);
  }

  private handleSetReady(socket: GameSocket, isReady: boolean): void {
    const lobbyId = this.playerLobbies.get(socket.id);
    if (!lobbyId) return;

    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return;

    const player = lobby.players.find(p => p.id === socket.id);
    if (!player) return;

    player.isReady = isReady;
    
    this.io.to(lobbyId).emit('playerReady', socket.id, isReady);
    this.io.to(lobbyId).emit('lobbyUpdated', lobby);

    console.log(`Player ${socket.id} ready status: ${isReady}`);
  }

  private handleStartRace(socket: GameSocket): void {
    const lobbyId = this.playerLobbies.get(socket.id);
    if (!lobbyId) return;

    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return;

    if (lobby.hostId !== socket.id) {
      socket.emit('error', 'Only the host can start the race');
      return;
    }

    const allReady = lobby.players.every(p => p.isReady || p.id === lobby.hostId);
    if (!allReady) {
      socket.emit('error', 'Not all players are ready');
      return;
    }

    lobby.isStarted = true;

    let countdown = 3;
    const countdownInterval = setInterval(() => {
      this.io.to(lobbyId).emit('raceStarting', countdown);
      countdown--;

      if (countdown < 0) {
        clearInterval(countdownInterval);
        this.startRace(lobbyId);
      }
    }, 1000);
  }

  private startRace(lobbyId: string): void {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return;

    const raceState: RaceState = {
      lobbyId,
      startTime: Date.now(),
      isActive: true,
      playerStates: {},
      raceTime: 0
    };

    lobby.players.forEach(player => {
      player.carState = this.getInitialCarState();
      player.lapTimes = [];
      player.totalTime = 0;
      player.finished = false;
      raceState.playerStates[player.id] = player;
    });

    this.raceStates.set(lobbyId, raceState);
    this.io.to(lobbyId).emit('raceStarted', raceState);

    console.log(`Race started in lobby ${lobbyId}`);
  }

  private handleUpdateCarState(socket: GameSocket, state: CarState): void {
    const lobbyId = this.playerLobbies.get(socket.id);
    if (!lobbyId) return;

    const raceState = this.raceStates.get(lobbyId);
    if (!raceState || !raceState.isActive) return;

    const player = raceState.playerStates[socket.id];
    if (!player) return;

    player.carState = state;
    
    socket.to(lobbyId).emit('playerStateUpdate', socket.id, state);
  }

  private handleFinishRace(socket: GameSocket, finalTime: number, lapTimes: number[]): void {
    const lobbyId = this.playerLobbies.get(socket.id);
    if (!lobbyId) return;

    const raceState = this.raceStates.get(lobbyId);
    if (!raceState) return;

    const player = raceState.playerStates[socket.id];
    if (!player) return;

    player.finished = true;
    player.totalTime = finalTime;
    player.lapTimes = lapTimes;

    const finishedPlayers = Object.values(raceState.playerStates).filter(p => p.finished);
    player.position = finishedPlayers.length;

    const allFinished = Object.values(raceState.playerStates).every(p => p.finished);
    
    if (allFinished) {
      raceState.isActive = false;
      const results = Object.values(raceState.playerStates).sort((a, b) => a.totalTime - b.totalTime);
      results.forEach((p, i) => p.position = i + 1);
      
      this.io.to(lobbyId).emit('raceFinished', results);
      
      const lobby = this.lobbies.get(lobbyId);
      if (lobby) {
        lobby.isStarted = false;
        lobby.players.forEach(p => p.isReady = false);
      }
      
      console.log(`Race finished in lobby ${lobbyId}`);
    }
  }

  private handlePlayerDisconnect(socket: GameSocket): void {
    this.handleLeaveLobby(socket);
  }

  private getInitialCarState(): CarState {
    return {
      position: { x: 0, y: 1, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      velocity: { x: 0, y: 0, z: 0 },
      angularVelocity: { x: 0, y: 0, z: 0 },
      damage: 0,
      currentLap: 0,
      lastCheckpoint: 0,
      speed: 0
    };
  }

  private getRandomColor(): string {
    const colors = [
      '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
      '#FF00FF', '#00FFFF', '#FFA500', '#800080'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
