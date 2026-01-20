import { useState } from 'react';
import { CarType, CAR_STATS } from '../../../shared/types/index';
import './CarSelection.css';

interface CarSelectionProps {
  selectedCar: CarType;
  onCarSelect: (carType: CarType) => void;
}

export default function CarSelection({ selectedCar, onCarSelect }: CarSelectionProps) {
  const [hoveredCar, setHoveredCar] = useState<CarType | null>(null);

  const carTypes = [
    {
      type: CarType.SPEEDSTER,
      name: '🚗 Speedster',
      description: 'Low center of gravity, high speed, responsive handling. Perfect for tight corners and quick acceleration.',
      stats: CAR_STATS[CarType.SPEEDSTER],
      color: '#ff4444',
      advantages: ['Fastest acceleration', 'Best handling', 'Lightweight'],
      disadvantages: ['Low durability', 'Poor braking at high speed']
    },
    {
      type: CarType.BALANCED,
      name: '🏎️ Balanced',
      description: 'Well-rounded performance with balanced stats across all categories. Great for beginners and versatile racing.',
      stats: CAR_STATS[CarType.BALANCED],
      color: '#4488ff',
      advantages: ['Balanced performance', 'Good durability', 'Versatile handling'],
      disadvantages: ['Not specialized for any specific track type']
    },
    {
      type: CarType.HEAVY,
      name: '🚙 Heavy',
      description: 'High center of gravity, excellent durability, stable at high speeds. Ideal for long straights and rough terrain.',
      stats: CAR_STATS[CarType.HEAVY],
      color: '#44aa44',
      advantages: ['Maximum durability', 'Most stable', 'Best braking'],
      disadvantages: ['Slowest acceleration', 'Heavier steering', 'Lower top speed']
    }
  ];

  const getStatBarColor = (value: number, maxValue: number = 100) => {
    const percentage = value / maxValue;
    if (percentage >= 0.8) return '#44aa44';
    if (percentage >= 0.6) return '#ffaa44';
    return '#ff4444';
  };

  const StatBar = ({ label, value, maxValue = 100 }: { label: string; value: number; maxValue?: number }) => (
    <div className="stat-bar">
      <div className="stat-label">{label}</div>
      <div className="stat-bar-container">
        <div 
          className="stat-bar-fill" 
          style={{ 
            width: `${(value / maxValue) * 100}%`,
            backgroundColor: getStatBarColor(value, maxValue)
          }}
        />
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );

  return (
    <div className="car-selection">
      <h2 className="car-selection-title">Choose Your Vehicle</h2>
      
      <div className="car-grid">
        {carTypes.map((car) => (
          <div
            key={car.type}
            className={`car-card ${selectedCar === car.type ? 'selected' : ''} ${hoveredCar === car.type ? 'hovered' : ''}`}
            onClick={() => onCarSelect(car.type)}
            onMouseEnter={() => setHoveredCar(car.type)}
            onMouseLeave={() => setHoveredCar(null)}
          >
            {/* Car Preview */}
            <div className="car-preview">
              <div 
                className="car-icon" 
                style={{ backgroundColor: car.color }}
              >
                <div className="car-body">
                  <div className="car-top"></div>
                  <div className="car-wheels">
                    <div className="wheel wheel-front-left"></div>
                    <div className="wheel wheel-front-right"></div>
                    <div className="wheel wheel-rear-left"></div>
                    <div className="wheel wheel-rear-right"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Car Info */}
            <div className="car-info">
              <h3 className="car-name">{car.name}</h3>
              <p className="car-description">{car.description}</p>
              
              {/* Stats */}
              <div className="car-stats">
                <StatBar label="Speed" value={car.stats.speed} />
                <StatBar label="Acceleration" value={car.stats.acceleration} />
                <StatBar label="Handling" value={car.stats.handling} />
                <StatBar label="Weight" value={2000 - car.stats.weight} maxValue={2000} />
                <StatBar label="Durability" value={car.stats.durability} />
              </div>

              {/* Pros and Cons */}
              <div className="car-characteristics">
                <div className="pros">
                  <h4>✓ Advantages</h4>
                  <ul>
                    {car.advantages.map((advantage, index) => (
                      <li key={index}>{advantage}</li>
                    ))}
                  </ul>
                </div>
                <div className="cons">
                  <h4>⚠ Considerations</h4>
                  <ul>
                    {car.disadvantages.map((disadvantage, index) => (
                      <li key={index}>{disadvantage}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Selection Indicator */}
            {selectedCar === car.type && (
              <div className="selection-indicator">
                <span className="selected-text">✓ SELECTED</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Tips */}
      <div className="car-selection-tips">
        <h3>💡 Quick Tips</h3>
        <div className="tips-grid">
          <div className="tip">
            <strong>City Circuit:</strong> Speedster excels with tight corners
          </div>
          <div className="tip">
            <strong>Mountain Pass:</strong> Balanced car handles elevation changes best
          </div>
          <div className="tip">
            <strong>Desert Highway:</strong> Heavy car dominates long straights
          </div>
          <div className="tip">
            <strong>Beginners:</strong> Start with Balanced for learning
          </div>
        </div>
      </div>
    </div>
  );
}