import type { TrackData, Vector3 } from '../../../shared/types/index';
import { TrackType, DifficultyLevel } from '../../../shared/types/index';

export const TRACKS: Record<TrackType, TrackData> = {
  [TrackType.CITY]: {
    type: TrackType.CITY,
    name: 'City Circuit',
    description: 'Urban racing with tight corners and city streets',
    length: 2500,
    checkpoints: [
      { x: 0, y: 0, z: 0 },
      { x: 30, y: 0, z: -30 },
      { x: 60, y: 0, z: -30 },
      { x: 60, y: 0, z: 30 },
      { x: 30, y: 0, z: 60 },
      { x: -30, y: 0, z: 60 },
      { x: -60, y: 0, z: 30 },
      { x: -60, y: 0, z: -30 },
      { x: -30, y: 0, z: -60 },
      { x: 0, y: 0, z: -60 }
    ],
    startPosition: { x: 0, y: 2, z: 5 },
    startRotation: 0,
    requiredLevel: 0,
    difficulty: DifficultyLevel.EASY
  },
  [TrackType.MOUNTAIN]: {
    type: TrackType.MOUNTAIN,
    name: 'Mountain Pass',
    description: 'Challenging mountain roads with elevation changes',
    length: 3200,
    checkpoints: [
      { x: 0, y: 0, z: 0 },
      { x: 40, y: 5, z: -20 },
      { x: 60, y: 10, z: -50 },
      { x: 50, y: 15, z: -80 },
      { x: 20, y: 20, z: -100 },
      { x: -20, y: 20, z: -100 },
      { x: -50, y: 15, z: -80 },
      { x: -60, y: 10, z: -50 },
      { x: -40, y: 5, z: -20 },
      { x: 0, y: 0, z: -10 }
    ],
    startPosition: { x: 0, y: 2, z: 5 },
    startRotation: 0,
    requiredLevel: 3,
    difficulty: DifficultyLevel.MEDIUM
  },
  [TrackType.DESERT]: {
    type: TrackType.DESERT,
    name: 'Desert Highway',
    description: 'High-speed straights through sandy dunes',
    length: 4000,
    checkpoints: [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: -80 },
      { x: 40, y: 0, z: -120 },
      { x: 80, y: 0, z: -120 },
      { x: 120, y: 0, z: -80 },
      { x: 120, y: 0, z: 0 },
      { x: 80, y: 0, z: 40 },
      { x: 40, y: 0, z: 40 },
      { x: 0, y: 0, z: 20 }
    ],
    startPosition: { x: 0, y: 2, z: 10 },
    startRotation: 0,
    requiredLevel: 5,
    difficulty: DifficultyLevel.HARD
  }
};

export function getCheckpointPosition(trackType: TrackType, index: number): Vector3 | null {
  const track = TRACKS[trackType];
  if (!track || index >= track.checkpoints.length) {
    return null;
  }
  return track.checkpoints[index];
}

export function getTrackInfo(trackType: TrackType): TrackData {
  return TRACKS[trackType];
}

export function getTotalLaps(difficulty: DifficultyLevel): number {
  switch (difficulty) {
    case DifficultyLevel.EASY:
      return 2;
    case DifficultyLevel.MEDIUM:
      return 3;
    case DifficultyLevel.HARD:
      return 4;
    case DifficultyLevel.EXPERT:
      return 5;
    case DifficultyLevel.INSANE:
      return 6;
    default:
      return 3;
  }
}
