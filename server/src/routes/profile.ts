import express from 'express';
import type { PlayerProfile } from '../../../shared/types/index.js';

export const profileRouter = express.Router();

const profiles: Map<string, PlayerProfile> = new Map();

profileRouter.get('/:playerId', (req, res) => {
  const { playerId } = req.params;
  const profile = profiles.get(playerId);
  
  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }
  
  res.json(profile);
});

profileRouter.post('/:playerId', (req, res) => {
  const { playerId } = req.params;
  const profileData: Partial<PlayerProfile> = req.body;
  
  const existingProfile = profiles.get(playerId);
  
  if (existingProfile) {
    const updatedProfile = { ...existingProfile, ...profileData };
    profiles.set(playerId, updatedProfile);
    res.json(updatedProfile);
  } else {
    const newProfile: PlayerProfile = {
      id: playerId,
      name: profileData.name || `Player ${playerId.substring(0, 4)}`,
      gamesPlayed: 0,
      wins: 0,
      totalRaceTime: 0,
      bestLapTimes: {},
      unlockedTracks: [],
      level: 1,
      experience: 0,
      ...profileData
    };
    profiles.set(playerId, newProfile);
    res.json(newProfile);
  }
});
