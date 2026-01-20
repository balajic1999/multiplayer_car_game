import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameServer } from './game/GameServer.js';
import { leaderboardRouter } from './routes/leaderboard.js';
import { profileRouter } from './routes/profile.js';

const app = express();
const httpServer = createServer(app);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/profile', profileRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

const gameServer = new GameServer(io);
gameServer.initialize();

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`🎮 Game server running on port ${PORT}`);
  console.log(`🌐 WebSocket server ready`);
});
