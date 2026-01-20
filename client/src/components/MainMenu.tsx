import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { TrackType, DifficultyLevel, CarType } from '../../../shared/types/index';
import CarSelection from './CarSelection';
import TrackSelection from './TrackSelection';
import './MainMenu.css';

export default function MainMenu() {
  const { setScreen, createLobby, joinLobby, lobbies } = useGameStore();
  const [showCreateLobby, setShowCreateLobby] = useState(false);
  const [showJoinLobby, setShowJoinLobby] = useState(false);
  const [showCarSelection, setShowCarSelection] = useState(false);
  const [showTrackSelection, setShowTrackSelection] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarType>(CarType.BALANCED);
  const [selectedTrack, setSelectedTrack] = useState<TrackType>(TrackType.CITY);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(DifficultyLevel.MEDIUM);
  const [lobbyName, setLobbyName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [trackType, setTrackType] = useState<TrackType>(TrackType.CITY);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.MEDIUM);

  const handleCreateLobby = () => {
    if (lobbyName.trim()) {
      createLobby(lobbyName, maxPlayers, trackType, difficulty, true);
      setShowCreateLobby(false);
    }
  };

  const handleQuickRace = () => {
    setShowCarSelection(true);
  };

  const handleCarSelect = (carType: CarType) => {
    setSelectedCar(carType);
  };

  const handleTrackSelect = (trackType: TrackType, difficulty: DifficultyLevel) => {
    setSelectedTrack(trackType);
    setSelectedDifficulty(difficulty);
  };

  const handleStartQuickRace = () => {
    // Create a quick race with selected car and track
    const quickRaceName = `Quick Race - ${new Date().toLocaleTimeString()}`;
    createLobby(quickRaceName, 1, selectedTrack, selectedDifficulty, false); // Single player
    setShowTrackSelection(false);
    setShowCarSelection(false);
  };

  return (
    <div className="container">
      <div className="main-menu">
        <h1 className="game-title">🏎️ RACING LEAGUE</h1>
        <p className="game-subtitle">Multiplayer Racing Championship</p>

        <div className="menu-buttons">
          <button className="btn-primary" onClick={() => setShowTrackSelection(true)}>
            🏎️ Quick Race
          </button>
          <button className="btn-primary" onClick={() => setShowCreateLobby(true)}>
            🏁 Create Race
          </button>
          <button className="btn-primary" onClick={() => setShowJoinLobby(true)}>
            🤝 Join Race
          </button>
          <button className="btn-secondary" onClick={() => setScreen('settings')}>
            ⚙️ Settings
          </button>
        </div>

        {showTrackSelection ? (
          <div className="modal-overlay" onClick={() => setShowTrackSelection(false)}>
            <div className="track-selection-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Choose Your Track & Difficulty</h2>
                <button className="btn-close" onClick={() => setShowTrackSelection(false)}>
                  ✕
                </button>
              </div>
              
              <TrackSelection 
                selectedTrack={selectedTrack}
                selectedDifficulty={selectedDifficulty}
                onTrackSelect={handleTrackSelect}
              />
              
              <div className="modal-buttons">
                <button className="btn-secondary" onClick={() => setShowTrackSelection(false)}>
                  Back
                </button>
                <button className="btn-primary" onClick={() => setShowCarSelection(true)}>
                  Next: Choose Car
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {showCarSelection ? (
          <div className="modal-overlay" onClick={() => setShowCarSelection(false)}>
            <div className="car-selection-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Select Your Vehicle</h2>
                <button className="btn-close" onClick={() => setShowCarSelection(false)}>
                  ✕
                </button>
              </div>
              
              <CarSelection 
                selectedCar={selectedCar} 
                onCarSelect={handleCarSelect} 
              />
              
              <div className="modal-buttons">
                <button className="btn-secondary" onClick={() => setShowCarSelection(false)}>
                  Back
                </button>
                <button className="btn-success" onClick={handleStartQuickRace}>
                  Start Race
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {showCreateLobby && (
          <div className="modal-overlay" onClick={() => setShowCreateLobby(false)}>
            <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
              <h2>Create Lobby</h2>
              <div className="form-group">
                <label>Lobby Name</label>
                <input
                  className="input-field"
                  type="text"
                  value={lobbyName}
                  onChange={(e) => setLobbyName(e.target.value)}
                  placeholder="Enter lobby name"
                />
              </div>
              <div className="form-group">
                <label>Max Players (2-8)</label>
                <input
                  className="input-field"
                  type="number"
                  min="2"
                  max="8"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>Track</label>
                <select
                  className="select-field"
                  value={trackType}
                  onChange={(e) => setTrackType(e.target.value as TrackType)}
                >
                  <option value={TrackType.CITY}>🏙️ City Circuit</option>
                  <option value={TrackType.MOUNTAIN}>🏔️ Mountain Pass</option>
                  <option value={TrackType.DESERT}>🏜️ Desert Highway</option>
                </select>
              </div>
              <div className="form-group">
                <label>Difficulty</label>
                <select
                  className="select-field"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                >
                  <option value={DifficultyLevel.EASY}>Easy</option>
                  <option value={DifficultyLevel.MEDIUM}>Medium</option>
                  <option value={DifficultyLevel.HARD}>Hard</option>
                  <option value={DifficultyLevel.EXPERT}>Expert</option>
                  <option value={DifficultyLevel.INSANE}>Insane</option>
                </select>
              </div>
              <div className="modal-buttons">
                <button className="btn-success" onClick={handleCreateLobby}>
                  Create
                </button>
                <button className="btn-secondary" onClick={() => setShowCreateLobby(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showJoinLobby && (
          <div className="modal-overlay" onClick={() => setShowJoinLobby(false)}>
            <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
              <h2>Available Lobbies</h2>
              <div className="lobby-list">
                {lobbies.length === 0 ? (
                  <p>No lobbies available. Create one!</p>
                ) : (
                  lobbies.map((lobby) => (
                    <div key={lobby.id} className="lobby-item">
                      <div className="lobby-info">
                        <h3>{lobby.name}</h3>
                        <p>
                          {lobby.players.length}/{lobby.maxPlayers} players
                        </p>
                        <p>
                          Track: {lobby.trackType} | {lobby.difficulty}
                        </p>
                      </div>
                      <button
                        className="btn-primary"
                        onClick={() => {
                          joinLobby(lobby.id);
                          setShowJoinLobby(false);
                        }}
                        disabled={lobby.isStarted || lobby.players.length >= lobby.maxPlayers}
                      >
                        Join
                      </button>
                    </div>
                  ))
                )}
              </div>
              <button className="btn-secondary" onClick={() => setShowJoinLobby(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
