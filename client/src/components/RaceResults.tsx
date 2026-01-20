import { useGameStore } from '../store/gameStore';
import './RaceResults.css';

export default function RaceResults() {
  const { raceResults, setScreen, leaveLobby } = useGameStore();

  const handleBackToLobby = () => {
    setScreen('lobby');
  };

  const handleBackToMenu = () => {
    leaveLobby();
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container">
      <div className="results-screen card">
        <h1>🏆 Race Results</h1>
        
        <div className="podium">
          {raceResults.slice(0, 3).map((player, index) => (
            <div key={player.id} className={`podium-place place-${index + 1}`}>
              <div className="podium-medal">
                {index === 0 && '🥇'}
                {index === 1 && '🥈'}
                {index === 2 && '🥉'}
              </div>
              <div
                className="podium-color"
                style={{ backgroundColor: player.color }}
              />
              <h3>{player.name}</h3>
              <p className="podium-time">{formatTime(player.totalTime)}</p>
            </div>
          ))}
        </div>

        <div className="results-table">
          <table>
            <thead>
              <tr>
                <th>Pos</th>
                <th>Player</th>
                <th>Total Time</th>
                <th>Best Lap</th>
                <th>Laps</th>
              </tr>
            </thead>
            <tbody>
              {raceResults.map((player) => (
                <tr key={player.id}>
                  <td className="position">{player.position}</td>
                  <td>
                    <div className="player-cell">
                      <div
                        className="player-color-small"
                        style={{ backgroundColor: player.color }}
                      />
                      {player.name}
                    </div>
                  </td>
                  <td>{formatTime(player.totalTime)}</td>
                  <td>
                    {player.lapTimes.length > 0
                      ? formatTime(Math.min(...player.lapTimes))
                      : '-'}
                  </td>
                  <td>{player.carState.currentLap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="results-actions">
          <button className="btn-primary" onClick={handleBackToLobby}>
            Back to Lobby
          </button>
          <button className="btn-secondary" onClick={handleBackToMenu}>
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
