import { Vector3 } from 'three';
import { TrackType, DifficultyLevel } from '../../../shared/types/index';

export interface TrackConfig {
  name: string;
  description: string;
  type: TrackType;
  length: number;
  width: number;
  difficulty: DifficultyLevel;
  requiredLevel: number;
  checkpoints: Vector3[];
  obstacles: TrackObstacle[];
  scenery: TrackScenery[];
  weatherEffects: string[];
  timeOfDay: 'day' | 'night' | 'sunset' | 'dawn';
}

export interface TrackObstacle {
  position: Vector3;
  rotation: number;
  type: 'wall' | 'barrier' | 'cone' | 'railing' | 'curb';
  size: Vector3;
}

export interface TrackScenery {
  position: Vector3;
  type: 'building' | 'tree' | 'rock' | 'sign' | 'light' | 'decoration';
  scale: number;
  rotation: number;
}

export const TRACK_CONFIGS: Record<TrackType, TrackConfig> = {
  [TrackType.CITY]: {
    name: '🏙️ City Circuit',
    description: 'Urban racing through tight streets with sharp corners and urban obstacles',
    type: TrackType.CITY,
    length: 5200,
    width: 12,
    difficulty: DifficultyLevel.MEDIUM,
    requiredLevel: 1,
    checkpoints: [
      new Vector3(0, 0, 0),
      new Vector3(40, 0, 0),
      new Vector3(70, 0, -25),
      new Vector3(75, 0, -60),
      new Vector3(55, 0, -90),
      new Vector3(15, 0, -95),
      new Vector3(-25, 0, -75),
      new Vector3(-50, 0, -40),
      new Vector3(-50, 0, 0),
      new Vector3(-20, 0, 20)
    ],
    obstacles: [
      // Buildings and walls
      { position: new Vector3(0, 3, -5), rotation: 0, type: 'wall', size: new Vector3(30, 6, 2) },
      { position: new Vector3(100, 3, 5), rotation: Math.PI/2, type: 'wall', size: new Vector3(20, 6, 2) },
      { position: new Vector3(140, 3, -20), rotation: 0, type: 'wall', size: new Vector3(25, 6, 2) },
      
      // Barriers and railings
      { position: new Vector3(60, 1, -5), rotation: Math.PI/4, type: 'barrier', size: new Vector3(4, 2, 0.5) },
      { position: new Vector3(40, 1, -15), rotation: Math.PI/3, type: 'barrier', size: new Vector3(3, 2, 0.5) },
      { position: new Vector3(90, 1, 20), rotation: 0, type: 'barrier', size: new Vector3(5, 2, 0.5) },
      
      // Curbs
      { position: new Vector3(80, 0.5, 25), rotation: Math.PI/2, type: 'curb', size: new Vector3(0.5, 1, 8) },
      { position: new Vector3(80, 0.5, -35), rotation: Math.PI/2, type: 'curb', size: new Vector3(0.5, 1, 12) },
      
      // Cones for tight corners
      { position: new Vector3(20, 0.5, -80), rotation: 0, type: 'cone', size: new Vector3(0.5, 1, 0.5) },
      { position: new Vector3(10, 0.5, -90), rotation: 0, type: 'cone', size: new Vector3(0.5, 1, 0.5) },
      { position: new Vector3(-30, 0.5, -100), rotation: 0, type: 'cone', size: new Vector3(0.5, 1, 0.5) },
      { position: new Vector3(-50, 0.5, -90), rotation: 0, type: 'cone', size: new Vector3(0.5, 1, 0.5) },
      
      // Railings for sharp turns
      { position: new Vector3(-70, 1.5, -20), rotation: Math.PI/6, type: 'railing', size: new Vector3(8, 3, 0.3) },
      { position: new Vector3(-120, 1.5, 20), rotation: Math.PI/3, type: 'railing', size: new Vector3(10, 3, 0.3) },
      { position: new Vector3(-40, 1.5, 100), rotation: Math.PI/2, type: 'railing', size: new Vector3(6, 3, 0.3) }
    ],
    scenery: [
      // Buildings
      { position: new Vector3(-50, 10, -50), type: 'building', scale: 8, rotation: 0 },
      { position: new Vector3(150, 15, -40), type: 'building', scale: 10, rotation: 0 },
      { position: new Vector3(-100, 12, 60), type: 'building', scale: 9, rotation: 0 },
      { position: new Vector3(50, 8, -150), type: 'building', scale: 7, rotation: 0 },
      
      // Urban trees and decorations
      { position: new Vector3(30, 5, 30), type: 'tree', scale: 2, rotation: 0 },
      { position: new Vector3(70, 5, -50), type: 'tree', scale: 2.5, rotation: 0 },
      { position: new Vector3(-20, 5, 50), type: 'tree', scale: 2, rotation: 0 },
      { position: new Vector3(-90, 5, -30), type: 'tree', scale: 2.2, rotation: 0 },
      
      // Street lights
      { position: new Vector3(40, 0, 15), type: 'light', scale: 1, rotation: 0 },
      { position: new Vector3(60, 0, -10), type: 'light', scale: 1, rotation: 0 },
      { position: new Vector3(100, 0, 15), type: 'light', scale: 1, rotation: 0 },
      { position: new Vector3(0, 0, -40), type: 'light', scale: 1, rotation: 0 },
      { position: new Vector3(-60, 0, -80), type: 'light', scale: 1, rotation: 0 },
      
      // Street signs and decorations
      { position: new Vector3(80, 2, 5), type: 'sign', scale: 1, rotation: Math.PI/2 },
      { position: new Vector3(20, 2, -80), type: 'sign', scale: 1, rotation: 0 },
      { position: new Vector3(-80, 2, 40), type: 'sign', scale: 1, rotation: Math.PI/3 },
      
      // Urban decorations
      { position: new Vector3(10, 0, 20), type: 'decoration', scale: 0.5, rotation: 0 },
      { position: new Vector3(90, 0, -30), type: 'decoration', scale: 0.5, rotation: 0 },
      { position: new Vector3(-40, 0, 70), type: 'decoration', scale: 0.5, rotation: 0 }
    ],
    weatherEffects: ['rain', 'night', 'fog'],
    timeOfDay: 'night'
  },
  
  [TrackType.MOUNTAIN]: {
    name: '🏔️ Mountain Pass',
    description: 'Winding mountain roads with elevation changes and scenic overlooks',
    type: TrackType.MOUNTAIN,
    length: 6800,
    width: 10,
    difficulty: DifficultyLevel.HARD,
    requiredLevel: 3,
    checkpoints: [
      new Vector3(0, 0, 0),
      new Vector3(30, 3, -20),
      new Vector3(55, 8, -45),
      new Vector3(75, 15, -65),
      new Vector3(85, 22, -80),
      new Vector3(75, 25, -105),
      new Vector3(50, 20, -120),
      new Vector3(20, 12, -110),
      new Vector3(-10, 6, -80),
      new Vector3(-15, 2, -40)
    ],
    obstacles: [
      // Mountain walls and rocks
      { position: new Vector3(-30, 8, 0), rotation: 0, type: 'wall', size: new Vector3(5, 16, 20) },
      { position: new Vector3(30, 12, -50), rotation: 0, type: 'wall', size: new Vector3(8, 24, 15) },
      { position: new Vector3(170, 30, 0), rotation: 0, type: 'wall', size: new Vector3(6, 20, 25) },
      { position: new Vector3(220, 45, 50), rotation: 0, type: 'wall', size: new Vector3(10, 30, 20) },
      
      // Guard rails
      { position: new Vector3(40, 8, -20), rotation: Math.PI/6, type: 'railing', size: new Vector3(15, 2, 0.4) },
      { position: new Vector3(110, 20, -60), rotation: Math.PI/4, type: 'railing', size: new Vector3(20, 2, 0.4) },
      { position: new Vector3(180, 35, 40), rotation: Math.PI/3, type: 'railing', size: new Vector3(18, 2, 0.4) },
      { position: new Vector3(140, 30, 100), rotation: Math.PI/2, type: 'railing', size: new Vector3(12, 2, 0.4) },
      
      // Rocky obstacles
      { position: new Vector3(80, 10, -70), rotation: 0, type: 'barrier', size: new Vector3(3, 4, 2) },
      { position: new Vector3(140, 22, -30), rotation: 0, type: 'barrier', size: new Vector3(4, 5, 3) },
      { position: new Vector3(160, 28, 10), rotation: 0, type: 'barrier', size: new Vector3(3, 4, 2) },
      
      // Mountain curbs
      { position: new Vector3(50, 1, -40), rotation: Math.PI/2, type: 'curb', size: new Vector3(0.8, 2, 6) },
      { position: new Vector3(100, 2, -90), rotation: Math.PI/2, type: 'curb', size: new Vector3(0.8, 3, 8) },
      { position: new Vector3(190, 3, 30), rotation: 0, type: 'curb', size: new Vector3(0.8, 4, 10) }
    ],
    scenery: [
      // Mountain peaks
      { position: new Vector3(-100, 50, -100), type: 'building', scale: 15, rotation: 0 },
      { position: new Vector3(200, 60, -50), type: 'building', scale: 18, rotation: 0 },
      { position: new Vector3(-50, 40, 150), type: 'building', scale: 12, rotation: 0 },
      
      // Trees and nature
      { position: new Vector3(-20, 8, 20), type: 'tree', scale: 3, rotation: 0 },
      { position: new Vector3(30, 15, -20), type: 'tree', scale: 4, rotation: 0 },
      { position: new Vector3(70, 18, -60), type: 'tree', scale: 3.5, rotation: 0 },
      { position: new Vector3(120, 25, -50), type: 'tree', scale: 4, rotation: 0 },
      { position: new Vector3(170, 32, 0), type: 'tree', scale: 3.8, rotation: 0 },
      { position: new Vector3(210, 42, 40), type: 'tree', scale: 4.2, rotation: 0 },
      { position: new Vector3(160, 35, 90), type: 'tree', scale: 3.6, rotation: 0 },
      
      // Rock formations
      { position: new Vector3(40, 5, -30), type: 'rock', scale: 2, rotation: 0 },
      { position: new Vector3(90, 12, -75), type: 'rock', scale: 2.5, rotation: 0 },
      { position: new Vector3(150, 24, -35), type: 'rock', scale: 3, rotation: 0 },
      { position: new Vector3(180, 32, 20), type: 'rock', scale: 2.8, rotation: 0 },
      
      // Scenic overlooks
      { position: new Vector3(110, 18, 0), type: 'decoration', scale: 1, rotation: 0 },
      { position: new Vector3(190, 38, 60), type: 'decoration', scale: 1, rotation: 0 },
      
      // Warning signs
      { position: new Vector3(40, 6, -20), type: 'sign', scale: 1.2, rotation: Math.PI/6 },
      { position: new Vector3(110, 18, -70), type: 'sign', scale: 1.2, rotation: Math.PI/4 },
      { position: new Vector3(180, 33, 40), type: 'sign', scale: 1.2, rotation: Math.PI/3 }
    ],
    weatherEffects: ['fog', 'rain', 'snow'],
    timeOfDay: 'day'
  },
  
  [TrackType.DESERT]: {
    name: '🏜️ Desert Highway',
    description: 'Long straights with sand dunes and desert mirages',
    type: TrackType.DESERT,
    length: 8500,
    width: 15,
    difficulty: DifficultyLevel.EASY,
    requiredLevel: 1,
    checkpoints: [
      new Vector3(0, 0, 0),
      new Vector3(80, 0, 0),
      new Vector3(150, 0, -10),
      new Vector3(210, 0, -30),
      new Vector3(250, 1, -60),
      new Vector3(250, 1, -100),
      new Vector3(210, 0, -130),
      new Vector3(150, 0, -140),
      new Vector3(80, 0, -135),
      new Vector3(20, 0, -100)
    ],
    obstacles: [
      // Sand dunes as barriers
      { position: new Vector3(150, 3, -20), rotation: Math.PI/4, type: 'wall', size: new Vector3(30, 6, 40) },
      { position: new Vector3(350, 4, 25), rotation: Math.PI/6, type: 'wall', size: new Vector3(25, 8, 35) },
      { position: new Vector3(550, 6, 45), rotation: Math.PI/3, type: 'wall', size: new Vector3(40, 12, 30) },
      { position: new Vector3(750, 8, 15), rotation: Math.PI/4, type: 'wall', size: new Vector3(35, 16, 45) },
      
      // Rock formations
      { position: new Vector3(250, 2, 35), rotation: 0, type: 'barrier', size: new Vector3(5, 4, 3) },
      { position: new Vector3(450, 3, -25), rotation: 0, type: 'barrier', size: new Vector3(6, 5, 4) },
      { position: new Vector3(650, 4, 55), rotation: 0, type: 'barrier', size: new Vector3(4, 3, 5) },
      { position: new Vector3(850, 6, -35), rotation: 0, type: 'barrier', size: new Vector3(7, 6, 4) },
      
      // Cacti as obstacles
      { position: new Vector3(180, 2, 25), rotation: 0, type: 'cone', size: new Vector3(1, 4, 1) },
      { position: new Vector3(320, 3, -15), rotation: 0, type: 'cone', size: new Vector3(1.2, 5, 1.2) },
      { position: new Vector3(480, 4, 40), rotation: 0, type: 'cone', size: new Vector3(0.8, 3, 0.8) },
      { position: new Vector3(720, 7, -20), rotation: 0, type: 'cone', size: new Vector3(1.5, 6, 1.5) },
      
      // Desert railings (minimal)
      { position: new Vector3(300, 1.5, 45), rotation: Math.PI/2, type: 'railing', size: new Vector3(8, 3, 0.3) },
      { position: new Vector3(500, 2.5, -50), rotation: 0, type: 'railing', size: new Vector3(6, 3, 0.3) },
      { position: new Vector3(700, 4.5, 65), rotation: Math.PI/2, type: 'railing', size: new Vector3(10, 3, 0.3) }
    ],
    scenery: [
      // Large rock formations
      { position: new Vector3(100, 8, 60), type: 'rock', scale: 8, rotation: 0 },
      { position: new Vector3(300, 10, -80), type: 'rock', scale: 10, rotation: 0 },
      { position: new Vector3(500, 12, 100), type: 'rock', scale: 12, rotation: 0 },
      { position: new Vector3(700, 15, -90), type: 'rock', scale: 9, rotation: 0 },
      { position: new Vector3(900, 18, 80), type: 'rock', scale: 11, rotation: 0 },
      
      // Desert vegetation
      { position: new Vector3(150, 1, 40), type: 'tree', scale: 2.5, rotation: 0 },
      { position: new Vector3(280, 1.5, -30), type: 'tree', scale: 3, rotation: 0 },
      { position: new Vector3(420, 2, 55), type: 'tree', scale: 2.8, rotation: 0 },
      { position: new Vector3(580, 3, -40), type: 'tree', scale: 3.2, rotation: 0 },
      { position: new Vector3(780, 4, 70), type: 'tree', scale: 2.6, rotation: 0 },
      
      // Desert structures
      { position: new Vector3(200, 6, 0), type: 'building', scale: 5, rotation: 0 },
      { position: new Vector3(600, 8, 80), type: 'building', scale: 6, rotation: 0 },
      
      // Directional signs
      { position: new Vector3(250, 2, 10), type: 'sign', scale: 1.5, rotation: Math.PI/2 },
      { position: new Vector3(450, 3, -20), type: 'sign', scale: 1.5, rotation: 0 },
      { position: new Vector3(650, 4, 30), type: 'sign', scale: 1.5, rotation: Math.PI/2 },
      
      // Desert decorations (skulls, artifacts)
      { position: new Vector3(180, 1, -15), type: 'decoration', scale: 0.8, rotation: 0 },
      { position: new Vector3(380, 1.5, 25), type: 'decoration', scale: 0.8, rotation: 0 },
      { position: new Vector3(520, 2, -35), type: 'decoration', scale: 0.8, rotation: 0 },
      { position: new Vector3(760, 3, 45), type: 'decoration', scale: 0.8, rotation: 0 }
    ],
    weatherEffects: ['sandstorm', 'heatwave', 'mirage'],
    timeOfDay: 'sunset'
  }
};

export const getTrackConfig = (trackType: TrackType): TrackConfig => {
  return TRACK_CONFIGS[trackType];
};

export const getTotalLaps = (difficulty: DifficultyLevel): number => {
  const lapCounts = {
    [DifficultyLevel.EASY]: 2,
    [DifficultyLevel.MEDIUM]: 3,
    [DifficultyLevel.HARD]: 4,
    [DifficultyLevel.EXPERT]: 5,
    [DifficultyLevel.INSANE]: 6
  };
  return lapCounts[difficulty];
};

export const getCheckpointPosition = (trackType: TrackType, checkpointIndex: number): Vector3 | null => {
  const config = getTrackConfig(trackType);
  const checkpoint = config.checkpoints[checkpointIndex];
  return checkpoint || null;
};

export const getTrackBounds = (trackType: TrackType): { min: Vector3; max: Vector3 } => {
  const config = getTrackConfig(trackType);
  const allPositions = [...config.checkpoints, ...config.obstacles.map(o => o.position), ...config.scenery.map(s => s.position)];
  
  const min = new Vector3(
    Math.min(...allPositions.map(p => p.x)) - 20,
    Math.min(...allPositions.map(p => p.y)) - 5,
    Math.min(...allPositions.map(p => p.z)) - 20
  );
  
  const max = new Vector3(
    Math.max(...allPositions.map(p => p.x)) + 20,
    Math.max(...allPositions.map(p => p.y)) + 20,
    Math.max(...allPositions.map(p => p.z)) + 20
  );
  
  return { min, max };
};