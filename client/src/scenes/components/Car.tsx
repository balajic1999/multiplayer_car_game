import { useRef } from 'react';
import { Mesh } from 'three';

interface CarProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  scale?: number;
}

export default function Car({ position, rotation = [0, 0, 0], color = '#3b82f6', scale = 1 }: CarProps) {
  const carRef = useRef<Mesh>(null);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh ref={carRef} castShadow receiveShadow>
        <boxGeometry args={[2, 1, 4]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      
      <mesh position={[0, -0.3, 0]} castShadow>
        <boxGeometry args={[1.8, 0.4, 3.5]} />
        <meshStandardMaterial color="#222222" metalness={0.8} roughness={0.2} />
      </mesh>
      
      <mesh position={[0, 0.3, 0.5]} castShadow>
        <boxGeometry args={[1.6, 0.6, 1.5]} />
        <meshStandardMaterial color="#1a1a1a" transparent opacity={0.3} metalness={0.9} roughness={0.1} />
      </mesh>
      
      <mesh position={[-0.9, -0.5, 1.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[0.9, -0.5, 1.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[-0.9, -0.5, -1.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[0.9, -0.5, -1.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
      </mesh>
      
      <mesh position={[0, 0.2, -2]} castShadow>
        <boxGeometry args={[1.4, 0.3, 0.1]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.2, 2]} castShadow>
        <boxGeometry args={[1.4, 0.3, 0.1]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}
