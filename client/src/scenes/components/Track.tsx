import { useMemo } from 'react';
import { TrackType } from '../../../../shared/types/index';
import { TRACKS } from '../../utils/trackData';

interface TrackProps {
  trackType: TrackType;
}

export default function Track({ trackType }: TrackProps) {
  const trackData = TRACKS[trackType];

  const trackElements = useMemo(() => {
    switch (trackType) {
      case TrackType.CITY:
        return <CityTrack />;
      case TrackType.MOUNTAIN:
        return <MountainTrack />;
      case TrackType.DESERT:
        return <DesertTrack />;
      default:
        return <CityTrack />;
    }
  }, [trackType]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#2d5016" roughness={0.8} />
      </mesh>
      
      {trackElements}
      
      {trackData.checkpoints.map((checkpoint, index) => (
        <group key={index} position={[checkpoint.x, checkpoint.y + 2, checkpoint.z]}>
          <mesh position={[-3, 0, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 4, 8]} />
            <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[3, 0, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 4, 8]} />
            <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, 2, 0]}>
            <boxGeometry args={[6, 0.5, 0.1]} />
            <meshStandardMaterial
              color={index === 0 ? "#00ff00" : "#ffff00"}
              emissive={index === 0 ? "#00ff00" : "#ffff00"}
              emissiveIntensity={0.5}
              transparent
              opacity={0.7}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CityTrack() {
  return (
    <group>
      <mesh position={[0, 0.05, -30]} receiveShadow castShadow>
        <boxGeometry args={[15, 0.1, 80]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
      </mesh>
      <mesh position={[30, 0.05, -30]} receiveShadow castShadow>
        <boxGeometry args={[15, 0.1, 15]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
      </mesh>
      <mesh position={[60, 0.05, 0]} receiveShadow castShadow>
        <boxGeometry args={[15, 0.1, 80]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
      </mesh>
      <mesh position={[30, 0.05, 45]} receiveShadow castShadow>
        <boxGeometry args={[80, 0.1, 15]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
      </mesh>
      <mesh position={[-45, 0.05, 0]} receiveShadow castShadow>
        <boxGeometry args={[80, 0.1, 15]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
      </mesh>
      
      <mesh position={[20, 3, -40]} castShadow>
        <boxGeometry args={[8, 6, 8]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      <mesh position={[-20, 4, 20]} castShadow>
        <boxGeometry args={[6, 8, 6]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      <mesh position={[40, 5, 20]} castShadow>
        <boxGeometry args={[10, 10, 10]} />
        <meshStandardMaterial color="#777777" />
      </mesh>
    </group>
  );
}

function MountainTrack() {
  return (
    <group>
      <mesh position={[20, 2.5, -30]} receiveShadow castShadow>
        <boxGeometry args={[50, 0.1, 80]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.9} />
      </mesh>
      <mesh position={[30, 7.5, -90]} receiveShadow castShadow>
        <boxGeometry args={[60, 0.1, 40]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.9} />
      </mesh>
      <mesh position={[-30, 7.5, -90]} receiveShadow castShadow>
        <boxGeometry args={[60, 0.1, 40]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.9} />
      </mesh>
      <mesh position={[-20, 2.5, -30]} receiveShadow castShadow>
        <boxGeometry args={[50, 0.1, 80]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.9} />
      </mesh>
      
      <mesh position={[30, 8, -70]} castShadow>
        <coneGeometry args={[10, 20, 6]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      <mesh position={[-30, 8, -70]} castShadow>
        <coneGeometry args={[12, 25, 6]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      <mesh position={[0, 5, -50]} castShadow>
        <coneGeometry args={[8, 15, 6]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
    </group>
  );
}

function DesertTrack() {
  return (
    <group>
      <mesh position={[0, 0.05, -60]} receiveShadow castShadow>
        <boxGeometry args={[20, 0.1, 100]} />
        <meshStandardMaterial color="#DEB887" roughness={0.9} />
      </mesh>
      <mesh position={[60, 0.05, -100]} receiveShadow castShadow>
        <boxGeometry args={[100, 0.1, 20]} />
        <meshStandardMaterial color="#DEB887" roughness={0.9} />
      </mesh>
      <mesh position={[100, 0.05, -40]} receiveShadow castShadow>
        <boxGeometry args={[20, 0.1, 100]} />
        <meshStandardMaterial color="#DEB887" roughness={0.9} />
      </mesh>
      <mesh position={[60, 0.05, 20]} receiveShadow castShadow>
        <boxGeometry args={[100, 0.1, 20]} />
        <meshStandardMaterial color="#DEB887" roughness={0.9} />
      </mesh>
      
      <mesh position={[30, 2, -80]} castShadow>
        <sphereGeometry args={[4, 8, 8]} />
        <meshStandardMaterial color="#F4A460" />
      </mesh>
      <mesh position={[80, 3, -70]} castShadow>
        <sphereGeometry args={[6, 8, 8]} />
        <meshStandardMaterial color="#F4A460" />
      </mesh>
      <mesh position={[90, 2.5, 10]} castShadow>
        <sphereGeometry args={[5, 8, 8]} />
        <meshStandardMaterial color="#F4A460" />
      </mesh>
    </group>
  );
}
