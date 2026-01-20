import { useState } from 'react';
import { TrackType, DifficultyLevel, TrackData } from '../../../shared/types/index';
import { getTrackConfig } from '../utils/trackData';
import './TrackSelection.css';

interface TrackSelectionProps {
  selectedTrack: TrackType;
  selectedDifficulty: DifficultyLevel;
  onTrackSelect: (trackType: TrackType, difficulty: DifficultyLevel) => void;
}

export default function TrackSelection({ 
  selectedTrack, 
  selectedDifficulty, 
  onTrackSelect 
}: TrackSelectionProps) {
  const [hoveredTrack, setHoveredTrack] = useState<TrackType | null>(null);
  const [showPreview, setShowPreview] = useState<TrackType | null>(null);

  const tracks = [
    {
      type: TrackType.CITY,
      name: '🏙️ City Circuit',
      difficulty: DifficultyLevel.MEDIUM,
      requiredLevel: 1,
      description: 'Urban racing through tight streets with sharp corners and urban obstacles. Perfect for mastering precision driving.',
      features: ['Tight corners', 'Urban obstacles', 'Street racing', 'Technical driving'],
      stats: {
        length: '5.2 km',
        corners: '14',
        elevation: 'Minimal',
        complexity: 'Medium'
      }
    },
    {
      type: TrackType.MOUNTAIN,
      name: '🏔️ Mountain Pass',
      difficulty: DifficultyLevel.HARD,
      requiredLevel: 3,
      description: 'Winding mountain roads with elevation changes and scenic overlooks. Demands excellent car control and endurance.',
      features: ['Elevation changes', 'Winding roads', 'Guard rails', 'Scenic views'],
      stats: {
        length: '6.8 km',
        corners: '18',
        elevation: 'Significant',
        complexity: 'High'
      }
    },
    {
      type: TrackType.DESERT,
      name: '🏜️ Desert Highway',
      difficulty: DifficultyLevel.EASY,
      requiredLevel: 1,
      description: 'Long straights with sand dunes and desert mirages. Great for high-speed racing and overtaking opportunities.',
      features: ['Long straights', 'Sand dunes', 'High speeds', 'Overtaking'],
      stats: {
        length: '8.5 km',
        corners: '8',
        elevation: 'Rolling',
        complexity: 'Low'
      }
    }
  ];

  const difficulties = [
    {
      level: DifficultyLevel.EASY,
      name: 'Easy',
      description: 'Forgiving physics, slower AI opponents',
      color: '#22c55e',
      aiSpeed: 0.6,
      laps: 2
    },
    {
      level: DifficultyLevel.MEDIUM,
      name: 'Medium',
      description: 'Balanced gameplay for regular racing',
      color: '#eab308',
      aiSpeed: 0.8,
      laps: 3
    },
    {
      level: DifficultyLevel.HARD,
      name: 'Hard',
      description: 'Challenging AI, realistic physics',
      color: '#f97316',
      aiSpeed: 0.95,
      laps: 4
    },
    {
      level: DifficultyLevel.EXPERT,
      name: 'Expert',
      description: 'Advanced opponents, strict rules',
      color: '#ef4444',
      aiSpeed: 1.1,
      laps: 5
    },
    {
      level: DifficultyLevel.INSANE,
      name: 'Insane',
      description: 'Maximum challenge for racing masters',
      color: '#8b5cf6',
      aiSpeed: 1.3,
      laps: 6
    }
  ];

  const selectedTrackConfig = getTrackConfig(selectedTrack);

  return (
    <div className="track-selection">
      <h2 className="track-selection-title">Select Your Track</h2>
      
      <div className="track-grid">
        {tracks.map((track) => (
          <div
            key={track.type}
            className={`track-card ${selectedTrack === track.type ? 'selected' : ''} ${hoveredTrack === track.type ? 'hovered' : ''}`}
            onClick={() => onTrackSelect(track.type, selectedDifficulty)}
            onMouseEnter={() => setHoveredTrack(track.type)}
            onMouseLeave={() => setHoveredTrack(null)}
          >
            {/* Track Preview */}
            <div className="track-preview">
              <div className={`track-preview-bg ${track.type}`}>
                <div className="track-overlay">
                  <div className="track-icon">
                    {track.name.split(' ')[0]}
                  </div>
                </div>
              </div>
            </div>

            {/* Track Info */}
            <div className="track-info">
              <h3 className="track-name">{track.name}</h3>
              <p className="track-description">{track.description}</p>
              
              {/* Track Stats */}
              <div className="track-stats">
                <div className="stat-item">
                  <span className="stat-label">Length:</span>
                  <span className="stat-value">{track.stats.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Corners:</span>
                  <span className="stat-value">{track.stats.corners}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Elevation:</span>
                  <span className="stat-value">{track.stats.elevation}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Complexity:</span>
                  <span className="stat-value">{track.stats.complexity}</span>
                </div>
              </div>

              {/* Track Features */}
              <div className="track-features">
                <h4>Track Features:</h4>
                <div className="features-list">
                  {track.features.map((feature, index) => (
                    <span key={index} className="feature-tag">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Selection Indicator */}
            {selectedTrack === track.type && (
              <div className="selection-indicator">
                <span className="selected-text">✓ SELECTED</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Difficulty Selection */}
      <div className="difficulty-section">
        <h3 className="difficulty-title">Select Difficulty</h3>
        <div className="difficulty-grid">
          {difficulties.map((difficulty) => (
            <div
              key={difficulty.level}
              className={`difficulty-card ${selectedDifficulty === difficulty.level ? 'selected' : ''}`}
              onClick={() => onTrackSelect(selectedTrack, difficulty.level)}
            >
              <div className="difficulty-header">
                <h4 className="difficulty-name" style={{ color: difficulty.color }}>
                  {difficulty.name}
                </h4>
                <div className="difficulty-laps">{difficulty.laps} Laps</div>
              </div>
              
              <p className="difficulty-description">{difficulty.description}</p>
              
              <div className="difficulty-stats">
                <div className="difficulty-stat">
                  <span className="stat-label">AI Speed:</span>
                  <div className="ai-speed-bar">
                    <div 
                      className="ai-speed-fill" 
                      style={{ 
                        width: `${(difficulty.aiSpeed / 1.5) * 100}%`,
                        backgroundColor: difficulty.color
                      }}
                    />
                  </div>
                  <span className="stat-value">{Math.round(difficulty.aiSpeed * 100)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Track Preview Modal */}
      {showPreview && (
        <div className="track-preview-modal" onClick={() => setShowPreview(null)}>
          <div className="track-preview-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h2>{getTrackConfig(showPreview).name}</h2>
              <button className="btn-close" onClick={() => setShowPreview(null)}>
                ✕
              </button>
            </div>
            
            <div className="preview-body">
              <div className="track-map">
                <div className={`track-map-bg ${showPreview}`}>
                  {/* Simplified track visualization */}
                </div>
              </div>
              
              <div className="preview-details">
                <h3>Track Details</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{getTrackConfig(showPreview).name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Length:</span>
                    <span className="detail-value">{getTrackConfig(showPreview).length}m</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Difficulty:</span>
                    <span className="detail-value">{getTrackConfig(showPreview).difficulty}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Time of Day:</span>
                    <span className="detail-value">{getTrackConfig(showPreview).timeOfDay}</span>
                  </div>
                </div>
                
                <div className="weather-effects">
                  <h4>Weather Effects:</h4>
                  <div className="effects-list">
                    {getTrackConfig(showPreview).weatherEffects.map((effect, index) => (
                      <span key={index} className="effect-tag">
                        {effect}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}