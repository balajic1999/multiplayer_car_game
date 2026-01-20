import { useRef } from 'react';
import { Mesh } from 'three';
import { CarType } from '../../../../shared/types/index';

interface RealisticCarProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  carType: CarType;
  color?: string;
  scale?: number;
  damage?: number;
}

export default function RealisticCar({ 
  position, 
  rotation = [0, 0, 0], 
  carType, 
  color = '#3b82f6',
  scale = 1,
  damage = 0
}: RealisticCarProps) {
  const carRef = useRef<Mesh>(null);

  const getCarGeometry = () => {
    switch (carType) {
      case CarType.SPEEDSTER:
        return {
          body: { width: 1.8, height: 0.8, length: 3.8 },
          hood: { width: 1.6, height: 0.6, length: 1.2 },
          roof: { width: 1.4, height: 0.7, length: 1.8 },
          wheels: { radius: 0.35, width: 0.3 }
        };
      case CarType.HEAVY:
        return {
          body: { width: 2.1, height: 1.0, length: 4.5 },
          hood: { width: 1.9, height: 0.8, length: 1.5 },
          roof: { width: 1.7, height: 0.9, length: 2.2 },
          wheels: { radius: 0.4, width: 0.35 }
        };
      case CarType.BALANCED:
      default:
        return {
          body: { width: 2.0, height: 0.9, length: 4.0 },
          hood: { width: 1.8, height: 0.7, length: 1.3 },
          roof: { width: 1.6, height: 0.8, length: 2.0 },
          wheels: { radius: 0.375, width: 0.325 }
        };
    }
  };

  const geometry = getCarGeometry();
  const damageEffect = Math.min(damage / 100, 1);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main Body */}
      <mesh ref={carRef} castShadow receiveShadow>
        <boxGeometry args={[geometry.body.width, geometry.body.height, geometry.body.length]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.8} 
          roughness={0.3}
          emissive={damageEffect > 0.3 ? `#ff4400` : '#000000'}
          emissiveIntensity={damageEffect * 0.2}
        />
      </mesh>
      
      {/* Hood/Engine Compartment */}
      <mesh position={[0, geometry.body.height/2 + geometry.hood.height/2 - 0.1, -geometry.body.length/2 + geometry.hood.length/2 + 0.2]} castShadow>
        <boxGeometry args={[geometry.hood.width, geometry.hood.height, geometry.hood.length]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.4} />
      </mesh>
      
      {/* Roof/Cabin */}
      <mesh position={[0, geometry.body.height/2 + geometry.roof.height/2 + 0.2, 0]} castShadow>
        <boxGeometry args={[geometry.roof.width, geometry.roof.height, geometry.roof.length]} />
        <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.5} />
      </mesh>
      
      {/* Windows */}
      <mesh position={[0, geometry.body.height/2 + geometry.roof.height/2 + 0.3, -0.3]} castShadow>
        <boxGeometry args={[geometry.roof.width * 0.9, geometry.roof.height * 0.6, geometry.roof.length * 0.8]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          transparent 
          opacity={0.4} 
          metalness={0.9} 
          roughness={0.1}
        />
      </mesh>
      
      {/* Chassis */}
      <mesh position={[0, -geometry.body.height/2 - 0.2, 0]} castShadow>
        <boxGeometry args={[geometry.body.width * 0.9, 0.3, geometry.body.length * 0.9]} />
        <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.2} />
      </mesh>
      
      {/* Wheels */}
      {[-1, 1].map((side) => 
        [-1, 1].map((front) => {
          const wheelX = side * (geometry.body.width/2 - 0.3);
          const wheelZ = front * (geometry.body.length/2 - 0.6);
          return (
            <group key={`${side}-${front}`} position={[wheelX, -geometry.body.height/2, wheelZ]}>
              <mesh rotation={[Math.PI/2, 0, 0]} castShadow>
                <cylinderGeometry args={[geometry.wheels.radius, geometry.wheels.radius, geometry.wheels.width, 16]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.8} />
              </mesh>
              <mesh rotation={[Math.PI/2, 0, 0]} position={[0, 0, 0.01]}>
                <cylinderGeometry args={[geometry.wheels.radius * 0.7, geometry.wheels.radius * 0.7, geometry.wheels.width * 0.9, 8]} />
                <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.3} />
              </mesh>
            </group>
          );
        })
      )}
      
      {/* Front Bumper */}
      <mesh position={[0, -0.2, geometry.body.length/2 + 0.3]} castShadow>
        <boxGeometry args={[geometry.body.width * 0.95, 0.6, 0.4]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Rear Bumper */}
      <mesh position={[0, -0.2, -geometry.body.length/2 - 0.3]} castShadow>
        <boxGeometry args={[geometry.body.width * 0.95, 0.6, 0.4]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Side Mirrors */}
      <mesh position={[geometry.body.width/2 + 0.1, geometry.body.height/2 + 0.3, -0.5]} castShadow>
        <boxGeometry args={[0.1, 0.2, 0.3]} />
        <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-geometry.body.width/2 - 0.1, geometry.body.height/2 + 0.3, -0.5]} castShadow>
        <boxGeometry args={[0.1, 0.2, 0.3]} />
        <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Headlights */}
      <mesh position={[0.6, 0, geometry.body.length/2 + 0.31]} castShadow>
        <boxGeometry args={[0.4, 0.2, 0.1]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff" 
          emissiveIntensity={1.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh position={[-0.6, 0, geometry.body.length/2 + 0.31]} castShadow>
        <boxGeometry args={[0.4, 0.2, 0.1]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff" 
          emissiveIntensity={1.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Taillights */}
      <mesh position={[0.7, 0, -geometry.body.length/2 - 0.31]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.1]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000" 
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh position={[-0.7, 0, -geometry.body.length/2 - 0.31]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.1]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000" 
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Exhaust */}
      <mesh position={[0.4, -0.5, -geometry.body.length/2 - 0.2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Hood Details (grille) */}
      {carType === CarType.SPEEDSTER && (
        <mesh position={[0, geometry.body.height/2 + 0.2, -geometry.body.length/2 + 0.5]} castShadow>
          <boxGeometry args={[geometry.hood.width * 0.8, 0.1, 0.3]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
        </mesh>
      )}
      
      {/* Roof Rack (for HEAVY type) */}
      {carType === CarType.HEAVY && (
        <group position={[0, geometry.body.height/2 + geometry.roof.height/2 + 0.3, 0]}>
          <mesh position={[0, 0, -0.8]} castShadow>
            <boxGeometry args={[1.2, 0.1, 0.1]} />
            <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.8]} castShadow>
            <boxGeometry args={[1.2, 0.1, 0.1]} />
            <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[-0.6, 0, 0]} castShadow>
            <boxGeometry args={[0.1, 0.1, 1.6]} />
            <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0.6, 0, 0]} castShadow>
            <boxGeometry args={[0.1, 0.1, 1.6]} />
            <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      )}
    </group>
  );
}