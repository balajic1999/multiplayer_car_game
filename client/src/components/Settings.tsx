import { useGameStore } from '../store/gameStore';
import './Settings.css';

export default function Settings() {
  const { settings, updateSettings, setScreen } = useGameStore();

  return (
    <div className="container">
      <div className="settings-screen card">
        <h1>⚙️ Settings</h1>

        <div className="settings-section">
          <h2>Graphics</h2>
          <div className="setting-item">
            <label>Quality</label>
            <select
              className="select-field"
              value={settings.graphics.quality}
              onChange={(e) =>
                updateSettings({
                  graphics: {
                    ...settings.graphics,
                    quality: e.target.value as any
                  }
                })
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="ultra">Ultra</option>
            </select>
          </div>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.graphics.shadows}
                onChange={(e) =>
                  updateSettings({
                    graphics: {
                      ...settings.graphics,
                      shadows: e.target.checked
                    }
                  })
                }
              />
              Shadows
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.graphics.antialiasing}
                onChange={(e) =>
                  updateSettings({
                    graphics: {
                      ...settings.graphics,
                      antialiasing: e.target.checked
                    }
                  })
                }
              />
              Anti-aliasing
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.graphics.particleEffects}
                onChange={(e) =>
                  updateSettings({
                    graphics: {
                      ...settings.graphics,
                      particleEffects: e.target.checked
                    }
                  })
                }
              />
              Particle Effects
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2>Audio</h2>
          <div className="setting-item">
            <label>Master Volume: {Math.round(settings.audio.masterVolume * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.audio.masterVolume}
              onChange={(e) =>
                updateSettings({
                  audio: {
                    ...settings.audio,
                    masterVolume: parseFloat(e.target.value)
                  }
                })
              }
            />
          </div>
          <div className="setting-item">
            <label>Music Volume: {Math.round(settings.audio.musicVolume * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.audio.musicVolume}
              onChange={(e) =>
                updateSettings({
                  audio: {
                    ...settings.audio,
                    musicVolume: parseFloat(e.target.value)
                  }
                })
              }
            />
          </div>
          <div className="setting-item">
            <label>SFX Volume: {Math.round(settings.audio.sfxVolume * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.audio.sfxVolume}
              onChange={(e) =>
                updateSettings({
                  audio: {
                    ...settings.audio,
                    sfxVolume: parseFloat(e.target.value)
                  }
                })
              }
            />
          </div>
        </div>

        <div className="settings-section">
          <h2>Controls</h2>
          <div className="setting-item">
            <label>Sensitivity: {settings.controls.sensitivity.toFixed(1)}</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.controls.sensitivity}
              onChange={(e) =>
                updateSettings({
                  controls: {
                    ...settings.controls,
                    sensitivity: parseFloat(e.target.value)
                  }
                })
              }
            />
          </div>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.controls.invertY}
                onChange={(e) =>
                  updateSettings({
                    controls: {
                      ...settings.controls,
                      invertY: e.target.checked
                    }
                  })
                }
              />
              Invert Y-Axis
            </label>
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn-primary" onClick={() => setScreen('menu')}>
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
