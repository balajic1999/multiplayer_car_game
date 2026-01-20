import { useMemo, useRef } from 'react';
import { Mesh, Group } from 'three';
import { TrackConfig } from '../../utils/trackData';

interface AdvancedTrackProps {
  trackConfig: TrackConfig;
}

export default function AdvancedTrack({ trackConfig }: AdvancedTrackProps) {
  const trackRef = useRef<Group>(null);

  const trackElements = useMemo(() => {
    const elements = [];

    // Track surface
    elements.push(
      <mesh key="track-surface" position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[1200, 800]} />
        <meshStandardMaterial 
          color={getTrackColor(trackConfig.type)} 
          roughness={0.8} 
          metalness={0.1}
        />
      </mesh>
    );

    // Road surface
    elements.push(
      <mesh key="road-surface" position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[trackConfig.width * 2, trackConfig.length]} />
        <meshStandardMaterial 
          color="#2a2a2a" 
          roughness={0.9} 
          metalness={0.05}
        />
      </mesh>
    );

    // Track border lines
    elements.push(
      <mesh key="border-left" position={[-trackConfig.width, 0.01, 0]} receiveShadow>
        <planeGeometry args={[0.2, trackConfig.length]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    );
    elements.push(
      <mesh key="border-right" position={[trackConfig.width, 0.01, 0]} receiveShadow>
        <planeGeometry args={[0.2, trackConfig.length]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    );

    // Center line (dashed)
    elements.push(
      <mesh key="center-line" position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[0.1, trackConfig.length]} />
        <meshStandardMaterial color="#ffff00" />
      </mesh>
    );

    // Start/Finish line
    const startPos = trackConfig.checkpoints[0];
    elements.push(
      <mesh key="start-finish" position={[startPos.x, 0.05, startPos.z]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
        <planeGeometry args={[trackConfig.width * 1.5, 2]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff" 
          emissiveIntensity={0.3}
        />
      </mesh>
    );

    // Add obstacles
    trackConfig.obstacles.forEach((obstacle, index) => {
      elements.push(
        <ObstacleComponent 
          key={`obstacle-${index}`}
          obstacle={obstacle}
        />
      );
    });

    // Add scenery
    trackConfig.scenery.forEach((scenery, index) => {
      elements.push(
        <SceneryComponent 
          key={`scenery-${index}`}
          scenery={scenery}
        />
      );
    });

    // Add checkpoints
    trackConfig.checkpoints.forEach((checkpoint, index) => {
      elements.push(
        <CheckpointComponent 
          key={`checkpoint-${index}`}
          position={checkpoint}
          index={index}
        />
      );
    });

    // Add lighting based on time of day
    elements.push(
      <AdvancedLighting 
        key="advanced-lighting"
        timeOfDay={trackConfig.timeOfDay}
      />
    );

    return elements;
  }, [trackConfig]);

  return (
    <group ref={trackRef}>
      {trackElements}
    </group>
  );
}

function getTrackColor(trackType: string): string {
  switch (trackType) {
    case 'city':
      return '#1a4a1a'; // Dark green for city
    case 'mountain':
      return '#2d5016'; // Forest green for mountain
    case 'desert':
      return '#8b7355'; // Sandy brown for desert
    default:
      return '#2a2a2a';
  }
}

function ObstacleComponent({ obstacle }: { obstacle: any }) {
  const getObstacleGeometry = () => {
    switch (obstacle.type) {
      case 'wall':
        return (
          <boxGeometry args={[obstacle.size.x, obstacle.size.y, obstacle.size.z]} />
        );
      case 'barrier':
        return (
          <boxGeometry args={[obstacle.size.x, obstacle.size.y, obstacle.size.z]} />
        );
      case 'cone':
        return (
          <coneGeometry args={[obstacle.size.x * 0.5, obstacle.size.y, 8]} />
        );
      case 'railing':
        return (
          <boxGeometry args={[obstacle.size.x, obstacle.size.y, obstacle.size.z]} />
        );
      case 'curb':
        return (
          <boxGeometry args={[obstacle.size.x, obstacle.size.y, obstacle.size.z]} />
        );
      default:
        return (
          <boxGeometry args={[obstacle.size.x, obstacle.size.y, obstacle.size.z]} />
        );
    }
  };

  const getObstacleMaterial = () => {
    switch (obstacle.type) {
      case 'wall':
        return <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.2} />;
      case 'barrier':
        return <meshStandardMaterial color="#ff6600" metalness={0.3} roughness={0.7} />;
      case 'cone':
        return <meshStandardMaterial color="#ff4400" metalness={0.2} roughness={0.8} />;
      case 'railing':
        return <meshStandardMaterial color="#888888" metalness={0.6} roughness={0.4} />;
      case 'curb':
        return <meshStandardMaterial color="#aaaaaa" metalness={0.4} roughness={0.6} />;
      default:
        return <meshStandardMaterial color="#666666" />;
    }
  };

  return (
    <mesh 
      position={[obstacle.position.x, obstacle.position.y, obstacle.position.z]}
      rotation={[0, obstacle.rotation, 0]}
      castShadow
      receiveShadow
    >
      {getObstacleGeometry()}
      {getObstacleMaterial()}
    </mesh>
  );
}

function SceneryComponent({ scenery }: { scenery: any }) {
  const getSceneryGeometry = () => {
    switch (scenery.type) {
      case 'building':
        return (
          <boxGeometry args={[scenery.scale * 3, scenery.scale * 6, scenery.scale * 3]} />
        );
      case 'tree':
        return (
          <group>
            <mesh position={[0, scenery.scale * 2, 0]}>
              <cylinderGeometry args={[scenery.scale * 0.3, scenery.scale * 0.5, scenery.scale * 4, 8]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            <mesh position={[0, scenery.scale * 4, 0]}>
              <sphereGeometry args={[scenery.scale * 1.5, 8, 6]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
          </group>
        );
      case 'rock':
        return (
          <dodecahedronGeometry args={[scenery.scale * 1.5]} />
        );
      case 'sign':
        return (
          <group>
            <mesh position={[0, scenery.scale * 2, 0]}>
              <boxGeometry args={[0.2, scenery.scale * 4, 0.2]} />
              <meshStandardMaterial color="#666666" />
            </mesh>
            <mesh position={[0, scenery.scale * 4.5, 0]}>
              <boxGeometry args={[scenery.scale * 2, scenery.scale * 1, 0.2]} />
              <meshStandardMaterial color="#ffff00" />
            </mesh>
          </group>
        );
      case 'light':
        return (
          <group>
            <mesh position={[0, scenery.scale * 3, 0]}>
              <cylinderGeometry args={[0.1, 0.1, scenery.scale * 6, 8]} />
              <meshStandardMaterial color="#444444" />
            </mesh>
            <mesh position={[0, scenery.scale * 6.5, 0]}>
              <sphereGeometry args={[scenery.scale * 0.8, 8, 6]} />
              <meshStandardMaterial 
                color="#ffffff" 
                emissive="#ffffff" 
                emissiveIntensity={0.8}
                transparent
                opacity={0.7}
              />
            </mesh>
          </group>
        );
      case 'decoration':
        return (
          <sphereGeometry args={[scenery.scale * 0.3, 6, 4]} />
        );
      default:
        return (
          <boxGeometry args={[scenery.scale, scenery.scale, scenery.scale]} />
        );
    }
  };

  const getSceneryMaterial = () => {
    switch (scenery.type) {
      case 'building':
        return <meshStandardMaterial color="#808080" metalness={0.3} roughness={0.7} />;
      case 'rock':
        return <meshStandardMaterial color="#696969" metalness={0.1} roughness={0.9} />;
      case 'decoration':
        return <meshStandardMaterial color="#ff6347" metalness={0.2} roughness={0.8} />;
      default:
        return null;
    }
  };

  return (
    <group 
      position={[scenery.position.x, scenery.position.y, scenery.position.z]}
      rotation={[0, scenery.rotation, 0]}
      scale={scenery.scale}
    >
      {getSceneryGeometry()}
      {getSceneryMaterial()}
    </group>
  );
}

function CheckpointComponent({ position, index }: { position: any; index: number }) {
  const isStartFinish = index === 0;
  
  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Checkpoint pillar */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 4, 8]} />
        <meshStandardMaterial 
          color={isStartFinish ? "#ffff00" : "#00ff00"} 
          emissive={isStartFinish ? "#ffff00" : "#00ff00"}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Checkpoint flag */}
      <mesh position={[0.5, 3, 0]} rotation={[0, 0, Math.PI/8]} castShadow>
        <planeGeometry args={[1.5, 1]} />
        <meshStandardMaterial 
          color={isStartFinish ? "#ffff00" : "#00ff00"} 
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Checkpoint number */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[0.5, 0.3, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function AdvancedLighting({ timeOfDay }: { timeOfDay: string }) {
  const getLightingConfig = () => {
    switch (timeOfDay) {
      case 'day':
        return {
          ambient: { intensity: 0.6, color: '#87CEEB' },
          directional: { intensity: 1.2, color: '#ffffff', position: [100, 100, 50] },
          shadows: true
        };
      case 'night':
        return {
          ambient: { intensity: 0.2, color: '#191970' },
          directional: { intensity: 0.3, color: '#4169E1', position: [-50, 50, -50] },
          shadows: true
        };
      case 'sunset':
        return {
          ambient: { intensity: 0.4, color: '#FF6347' },
          directional: { intensity: 0.8, color: '#FF4500', position: [50, 50, 0] },
          shadows: true
        };
      case 'dawn':
        return {
          ambient: { intensity: 0.3, color: '#FFA07A' },
          directional: { intensity: 0.9, color: '#FF69B4', position: [75, 75, 25] },
          shadows: true
        };
      default:
        return {
          ambient: { intensity: 0.5, color: '#ffffff' },
          directional: { intensity: 1, color: '#ffffff', position: [50, 50, 0] },
          shadows: true
        };
    }
  };

  const config = getLightingConfig();

  return (
    <>
      <ambientLight intensity={config.ambient.intensity} color={config.ambient.color} />
      <directionalLight
        position={config.directional.position}
        intensity={config.directional.intensity}
        color={config.directional.color}
        castShadow={config.shadows}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
      />
      <hemisphereLight 
        args={[config.ambient.color, '#2d5016', 0.3]} 
      />
    </>
  );
}