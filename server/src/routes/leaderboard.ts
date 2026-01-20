import express from 'express';
import type { LeaderboardEntry, TrackType, DifficultyLevel } from '../../../shared/types/index.js';

export const leaderboardRouter = express.Router();

const leaderboards: Map<string, LeaderboardEntry[]> = new Map();

function getLeaderboardKey(trackType: TrackType, difficulty: DifficultyLevel): string {
  return `${trackType}-${difficulty}`;
}

leaderboardRouter.get('/:trackType/:difficulty', (req, res) => {
  const { trackType, difficulty } = req.params;
  const key = getLeaderboardKey(trackType as TrackType, difficulty as DifficultyLevel);
  
  const entries = leaderboards.get(key) || [];
  const sorted = entries.sort((a, b) => a.lapTime - b.lapTime).slice(0, 10);
  
  res.json(sorted);
});

leaderboardRouter.post('/', (req, res) => {
  const entry: LeaderboardEntry = req.body;
  const key = getLeaderboardKey(entry.trackType, entry.difficulty);
  
  const entries = leaderboards.get(key) || [];
  entries.push(entry);
  leaderboards.set(key, entries);
  
  res.json({ success: true });
});

leaderboardRouter.get('/all', (req, res) => {
  const allEntries: Record<string, LeaderboardEntry[]> = {};
  
  leaderboards.forEach((entries, key) => {
    allEntries[key] = entries.sort((a, b) => a.lapTime - b.lapTime).slice(0, 10);
  });
  
  res.json(allEntries);
});
