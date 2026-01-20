# Multiplayer Car Racing Game

A full-featured 3D multiplayer racing game built with Three.js, React, TypeScript, and Socket.io.

## Features

- **Real-time Multiplayer**: Race against 2-8 players using WebSocket connections
- **Multiple Tracks**: 3 unique racing circuits (City, Mountain, Desert)
- **Progression System**: 5 difficulty levels with unlockable content
- **Vehicle Variety**: 3 different car models with unique stats
- **Realistic Physics**: Powered by Cannon.js for authentic car handling
- **Leaderboards**: Track top times per track and difficulty
- **Player Profiles**: Persistent stats and progress tracking

## Tech Stack

- **Frontend**: React + Three.js + TypeScript + Vite
- **Backend**: Node.js + Express + Socket.io
- **Physics**: Cannon.js
- **3D Rendering**: Three.js (WebGL)

## Project Structure

```
/
  client/         - React frontend with Three.js
  server/         - Node.js backend with Socket.io
  shared/         - Shared TypeScript types
```

## Quick Start

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Run development servers**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   - Game client: http://localhost:5173
   - Server API: http://localhost:3000

## Controls

- **W / Arrow Up**: Accelerate
- **S / Arrow Down**: Brake / Reverse
- **A / Arrow Left**: Steer left
- **D / Arrow Right**: Steer right
- **Space**: Handbrake
- **R**: Reset car position
- **C**: Change camera view

## Game Modes

- **Single Player**: Race against AI opponents
- **Multiplayer**: Join or create a lobby to race with friends
- **Time Trial**: Beat your best lap times

## Difficulty Levels

1. **Easy**: Forgiving physics, slower AI
2. **Medium**: Balanced gameplay
3. **Hard**: Challenging AI, realistic physics
4. **Expert**: Advanced opponents, strict rules
5. **Insane**: Maximum challenge for pros

## Building for Production

```bash
npm run build
npm start
```

## License

MIT
