import { useEffect, useState } from 'react';
import { CarType } from '../../../shared/types/index';
import './HUD.css';

interface AdvancedHUDProps {
  speed: number;
  position: number;
  totalPlayers: number;
  currentLap: number;
  totalLaps: number;
  lapTime: number;
  bestLapTime: number;
  carDamage: number;
  tireGrip: number;
  tireTemperature: number;
  carType: CarType;
  cameraMode: 'follow' | 'orbit' | 'top';
  onCameraModeChange: (mode: 'follow' | 'orbit' | 'top') => void;
}

export default function AdvancedHUD({
  speed,
  position,
  totalPlayers,
  currentLap,
  totalLaps,
  lapTime,
  bestLapTime,
  carDamage,
  tireGrip,
  tireTemperature,
  carType,
  cameraMode,
  onCameraModeChange
}: AdvancedHUDProps) {
  const [showControls, setShowControls] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [gear, setGear] = useState(1);
  const [isBraking, setIsBraking] = useState(false);
  const [isAccelerating, setIsAccelerating] = useState(false);

  useEffect(() => {
    // Calculate gear based on speed
    if (speed < 10) setGear(1);
    else if (speed < 25) setGear(2);
    else if (speed < 45) setGear(3);
    else if (speed < 70) setGear(4);
    else if (speed < 90) setGear(5);
    else setGear(6);

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setShowControls(!showControls);
      } else if (e.key === 'i' || e.key === 'I') {
        setShowStats(!showStats);
      } else if (e.key === 'c' || e.key === 'C') {
        const modes: ('follow' | 'orbit' | 'top')[] = ['follow', 'orbit', 'top'];
        const currentIndex = modes.indexOf(cameraMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        onCameraModeChange(modes[nextIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showControls, showStats, cameraMode, onCameraModeChange]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const getSpeedColor = () => {
    if (speed < 30) return '#22c55e';
    if (speed < 60) return '#eab308';
    if (speed < 90) return '#f97316';
    return '#ef4444';
  };

  const getTireTempColor = () => {
    if (tireTemperature < 70) return '#3b82f6'; // Too cold - blue
    if (tireTemperature <= 95) return '#22c55e'; // Optimal - green
    if (tireTemperature <= 110) return '#eab308'; // Hot - yellow
    return '#ef4444'; // Too hot - red
  };

  const getGripColor = () => {
    if (tireGrip > 0.8) return '#22c55e';
    if (tireGrip > 0.5) return '#eab308';
    return '#ef4444';
  };

  const getCarTypeIcon = () => {
    switch (carType) {
      case CarType.SPEEDSTER:
        return '🏎️';
      case CarType.HEAVY:
        return '🚙';
      case CarType.BALANCED:
      default:
        return '🚗';
    }
  };

  const getCarTypeName = () => {
    switch (carType) {
      case CarType.SPEEDSTER:
        return 'Speedster';
      case CarType.HEAVY:
        return 'Heavy';
      case CarType.BALANCED:
      default:
        return 'Balanced';
    }
  };

  return (
    <>
      {/* Main HUD */}
      <div className="advanced-hud">
        {/* Top Left - Position and Lap Info */}
        <div className="hud-top-left">
          <div className="position-container">
            <div className="position-number">{position}</div>
            <div className="position-separator">/</div>
            <div className="position-total">{totalPlayers}</div>
            <div className="position-label">POSITION</div>
          </div>
          
          <div className="lap-container">
            <div className="lap-label">LAP</div>
            <div className="lap-info">
              <span className="lap-current">{currentLap}</span>
              <span className="lap-separator">/</span>
              <span className="lap-total">{totalLaps}</span>
            </div>
          </div>
        </div>

        {/* Top Center - Car Info */}
        <div className="hud-top-center">
          <div className="car-info">
            <span className="car-icon">{getCarTypeIcon()}</span>
            <span className="car-name">{getCarTypeName()}</span>
          </div>
        </div>

        {/* Top Right - Camera Mode */}
        <div className="hud-top-right">
          <div className="camera-info">
            <div className="camera-label">CAMERA</div>
            <div className="camera-mode">{cameraMode.toUpperCase()}</div>
          </div>
        </div>

        {/* Center Left - Speedometer */}
        <div className="hud-center-left">
          <div className="speedometer">
            <div className="speed-display">
              <div 
                className="speed-number" 
                style={{ color: getSpeedColor() }}
              >
                {Math.round(speed)}
              </div>
              <div className="speed-unit">KM/H</div>
            </div>
            
            <div className="speed-gauge">
              <div 
                className="speed-gauge-fill" 
                style={{ 
                  height: `${(speed / 120) * 100}%`,
                  backgroundColor: getSpeedColor()
                }}
              />
            </div>
            
            <div className="gear-display">
              <div className="gear-label">GEAR</div>
              <div className="gear-number">{gear}</div>
            </div>
          </div>
        </div>

        {/* Center Right - Tire Information */}
        <div className="hud-center-right">
          <div className="tire-info">
            <div className="tire-grip">
              <div className="tire-label">GRIP</div>
              <div className="tire-bar">
                <div 
                  className="tire-bar-fill" 
                  style={{ 
                    width: `${tireGrip * 100}%`,
                    backgroundColor: getGripColor()
                  }}
                />
              </div>
              <div className="tire-value">{Math.round(tireGrip * 100)}%</div>
            </div>
            
            <div className="tire-temp">
              <div className="tire-label">TIRE TEMP</div>
              <div className="tire-temp-display" style={{ color: getTireTempColor() }}>
                {Math.round(tireTemperature)}°C
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Left - Lap Times */}
        <div className="hud-bottom-left">
          <div className="time-info">
            <div className="time-item">
              <span className="time-label">CURRENT LAP</span>
              <span className="time-value current">{formatTime(lapTime)}</span>
            </div>
            {bestLapTime > 0 && (
              <div className="time-item">
                <span className="time-label">BEST LAP</span>
                <span className="time-value best">{formatTime(bestLapTime)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Center - Damage Indicator */}
        <div className="hud-bottom-center">
          <div className="damage-info">
            <div className="damage-label">DAMAGE</div>
            <div className="damage-bar">
              <div 
                className="damage-bar-fill" 
                style={{ 
                  width: `${carDamage}%`,
                  backgroundColor: carDamage > 70 ? '#ef4444' : carDamage > 40 ? '#eab308' : '#22c55e'
                }}
              />
            </div>
            <div className="damage-value">{Math.round(carDamage)}%</div>
          </div>
        </div>

        {/* Bottom Right - Controls Hint */}
        <div className="hud-bottom-right">
          <div className="hud-hints">
            <div className="hint">H - Help</div>
            <div className="hint">I - Stats</div>
            <div className="hint">C - Camera</div>
          </div>
        </div>
      </div>

      {/* Controls Overlay */}
      {showControls && (
        <div className="controls-overlay" onClick={() => setShowControls(false)}>
          <div className="controls-panel" onClick={(e) => e.stopPropagation()}>
            <h2>🎮 Controls</h2>
            <div className="controls-grid">
              <div className="control-section">
                <h3>Driving</h3>
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
                  <span>Brake</span>
                </div>
                <div className="control-item">
                  <kbd>Shift</kbd>
                  <span>Handbrake (Drift)</span>
                </div>
              </div>
              
              <div className="control-section">
                <h3>Camera & UI</h3>
                <div className="control-item">
                  <kbd>C</kbd>
                  <span>Change Camera View</span>
                </div>
                <div className="control-item">
                  <kbd>R</kbd>
                  <span>Reset Car Position</span>
                </div>
                <div className="control-item">
                  <kbd>H</kbd>
                  <span>Toggle Help</span>
                </div>
                <div className="control-item">
                  <kbd>I</kbd>
                  <span>Toggle Statistics</span>
                </div>
              </div>
            </div>
            <button className="btn-secondary" onClick={() => setShowControls(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Statistics Overlay */}
      {showStats && (
        <div className="stats-overlay" onClick={() => setShowStats(false)}>
          <div className="stats-panel" onClick={(e) => e.stopPropagation()}>
            <h2>📊 Race Statistics</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Current Speed</span>
                <span className="stat-value">{Math.round(speed)} km/h</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Current Gear</span>
                <span className="stat-value">{gear}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Tire Grip</span>
                <span className="stat-value">{Math.round(tireGrip * 100)}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Tire Temperature</span>
                <span className="stat-value">{Math.round(tireTemperature)}°C</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Car Damage</span>
                <span className="stat-value">{Math.round(carDamage)}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Current Position</span>
                <span className="stat-value">{position}/{totalPlayers}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Current Lap</span>
                <span className="stat-value">{currentLap}/{totalLaps}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Vehicle Type</span>
                <span className="stat-value">{getCarTypeName()}</span>
              </div>
            </div>
            <button className="btn-secondary" onClick={() => setShowStats(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}