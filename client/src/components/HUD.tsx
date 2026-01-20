import { useEffect, useState } from 'react';
import './HUD.css';

interface HUDProps {
  speed: number;
  position: number;
  totalPlayers: number;
  currentLap: number;
  totalLaps: number;
  lapTime: number;
  bestLapTime: number;
}

export default function HUD({
  speed,
  position,
  totalPlayers,
  currentLap,
  totalLaps,
  lapTime,
  bestLapTime
}: HUDProps) {
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setShowControls(!showControls);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showControls]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="hud">
        <div className="hud-top">
          <div className="hud-position">
            <div className="position-number">{position}</div>
            <div className="position-total">/ {totalPlayers}</div>
          </div>
          <div className="hud-lap">
            <div className="lap-label">LAP</div>
            <div className="lap-number">
              {currentLap} / {totalLaps}
            </div>
          </div>
        </div>

        <div className="hud-bottom">
          <div className="hud-speed">
            <div className="speed-number">{Math.round(speed)}</div>
            <div className="speed-unit">KM/H</div>
          </div>
          <div className="hud-times">
            <div className="time-item">
              <span className="time-label">Current:</span>
              <span className="time-value">{formatTime(lapTime)}</span>
            </div>
            {bestLapTime > 0 && (
              <div className="time-item">
                <span className="time-label">Best:</span>
                <span className="time-value best">{formatTime(bestLapTime)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="hud-hint">
          Press H for controls
        </div>
      </div>

      {showControls && (
        <div className="controls-overlay" onClick={() => setShowControls(false)}>
          <div className="controls-panel" onClick={(e) => e.stopPropagation()}>
            <h2>Controls</h2>
            <div className="controls-grid">
              <div className="control-item">
                <kbd>W</kbd> / <kbd>↑</kbd>
                <span>Accelerate</span>
              </div>
              <div className="control-item">
                <kbd>S</kbd> / <kbd>↓</kbd>
                <span>Brake / Reverse</span>
              </div>
              <div className="control-item">
                <kbd>A</kbd> / <kbd>←</kbd>
                <span>Steer Left</span>
              </div>
              <div className="control-item">
                <kbd>D</kbd> / <kbd>→</kbd>
                <span>Steer Right</span>
              </div>
              <div className="control-item">
                <kbd>Space</kbd>
                <span>Handbrake</span>
              </div>
              <div className="control-item">
                <kbd>R</kbd>
                <span>Reset Position</span>
              </div>
              <div className="control-item">
                <kbd>C</kbd>
                <span>Change Camera</span>
              </div>
              <div className="control-item">
                <kbd>H</kbd>
                <span>Toggle Help</span>
              </div>
            </div>
            <button className="btn-secondary" onClick={() => setShowControls(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
