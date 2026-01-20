import { useGameStore } from '../store/gameStore';
import './LobbyScreen.css';

export default function LobbyScreen() {
  const { currentLobby, localPlayerId, leaveLobby, setReady, startRace, countdown } = useGameStore();

  if (!currentLobby) {
    return null;
  }

  const localPlayer = currentLobby.players.find(p => p.id === localPlayerId);
  const isHost = currentLobby.hostId === localPlayerId;
  const allReady = currentLobby.players.every(p => p.isReady || p.id === currentLobby.hostId);

  return (
    <div className="container">
      <div className="lobby-screen card">
        <h1>{currentLobby.name}</h1>
        <div className="lobby-details">
          <p>Track: <strong>{currentLobby.trackType}</strong></p>
          <p>Difficulty: <strong>{currentLobby.difficulty}</strong></p>
          <p>Players: <strong>{currentLobby.players.length}/{currentLobby.maxPlayers}</strong></p>
        </div>

        <div className="players-grid">
          {currentLobby.players.map((player) => (
            <div
              key={player.id}
              className={`player-card ${player.isReady ? 'ready' : ''}`}
            >
              <div
                className="player-color"
                style={{ backgroundColor: player.color }}
              />
              <div className="player-info">
                <h3>
                  {player.name}
                  {player.id === currentLobby.hostId && ' 👑'}
                </h3>
                <p>{player.carType}</p>
                <span className="ready-badge">
                  {player.isReady ? '✓ Ready' : '⏳ Not Ready'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {countdown > 0 && (
          <div className="countdown-overlay">
            <div className="countdown-number">{countdown}</div>
            <p>Race starting...</p>
          </div>
        )}

        <div className="lobby-actions">
          {!isHost && (
            <button
              className={localPlayer?.isReady ? 'btn-secondary' : 'btn-success'}
              onClick={() => setReady(!localPlayer?.isReady)}
            >
              {localPlayer?.isReady ? 'Not Ready' : 'Ready'}
            </button>
          )}
          {isHost && (
            <button
              className="btn-success"
              onClick={startRace}
              disabled={!allReady || currentLobby.players.length < 2}
            >
              Start Race
            </button>
          )}
          <button className="btn-danger" onClick={leaveLobby}>
            Leave Lobby
          </button>
        </div>
      </div>
    </div>
  );
}
