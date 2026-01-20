import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, BufferGeometry, PointsMaterial, Sprite, SpriteMaterial, CanvasTexture, BufferAttribute } from 'three';

interface ParticleSystemProps {
  type: 'tire-smoke' | 'exhaust' | 'crash-dust' | 'rain' | 'sand' | 'drift-smoke';
  position: [number, number, number];
  intensity?: number;
  duration?: number;
  size?: number;
  color?: string;
  enabled?: boolean;
}

export default function ParticleSystem({
  type,
  position,
  intensity = 1,
  duration = 2000,
  size = 1,
  color = '#ffffff',
  enabled = true
}: ParticleSystemProps) {
  const pointsRef = useRef<Points>(null);
  const spriteRef = useRef<Sprite>(null);

  const { particleGeometry, particleMaterial, particleCount } = useMemo(() => {
    switch (type) {
      case 'tire-smoke':
      case 'drift-smoke':
        return createSmokeParticles();
      case 'exhaust':
        return createExhaustParticles();
      case 'crash-dust':
        return createDustParticles();
      case 'rain':
        return createRainParticles();
      case 'sand':
        return createSandParticles();
      default:
        return createSmokeParticles();
    }
  }, [type]);

  useFrame((state) => {
    if (!enabled || !pointsRef.current) return;

    const time = state.clock.getElapsedTime() * 1000;
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const velocities = pointsRef.current.geometry.attributes.velocity?.array as Float32Array;
    const lifetimes = pointsRef.current.geometry.attributes.lifetime?.array as Float32Array;
    const startTimes = pointsRef.current.geometry.attributes.startTime?.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      if (startTimes[i] === 0) {
        startTimes[i] = time + Math.random() * duration;
      }

      const age = time - startTimes[i];
      
      if (age < 0 || age > duration) {
        // Reset particle
        positions[i3] = position[0] + (Math.random() - 0.5) * 2;
        positions[i3 + 1] = position[1];
        positions[i3 + 2] = position[2] + (Math.random() - 0.5) * 2;
        startTimes[i] = time;
        lifetimes[i] = 1;
      } else {
        // Update particle position
        const lifeProgress = age / duration;
        const lifeRemaining = 1 - lifeProgress;
        
        positions[i3] += velocities[i3] * 0.016; // Assuming 60fps
        positions[i3 + 1] += velocities[i3 + 1] * 0.016;
        positions[i3 + 2] += velocities[i3 + 2] * 0.016;
        
        // Apply gravity and wind effects
        velocities[i3 + 1] -= 0.01; // Gravity
        velocities[i3] *= 0.99; // Air resistance
        velocities[i3 + 2] *= 0.99;
        
        // Update material opacity based on lifetime
        const material = pointsRef.current.material as PointsMaterial;
        material.opacity = lifeRemaining * intensity;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={particleGeometry}>
      <primitive object={particleMaterial} attach="material" />
    </points>
  );
}

function createSmokeParticles() {
  const particleCount = 100;
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const lifetimes = new Float32Array(particleCount);
  const startTimes = new Float32Array(particleCount);

  // Initialize particles
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 2;
    positions[i3 + 1] = 0;
    positions[i3 + 2] = (Math.random() - 0.5) * 2;
    
    velocities[i3] = (Math.random() - 0.5) * 0.5;
    velocities[i3 + 1] = Math.random() * 0.3 + 0.1;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.5;
    
    lifetimes[i] = 1;
    startTimes[i] = 0;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('velocity', new BufferAttribute(velocities, 3));
  geometry.setAttribute('lifetime', new BufferAttribute(lifetimes, 1));
  geometry.setAttribute('startTime', new BufferAttribute(startTimes, 1));

  // Create smoke texture
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(200, 200, 200, 0.8)');
  gradient.addColorStop(0.5, 'rgba(150, 150, 150, 0.4)');
  gradient.addColorStop(1, 'rgba(100, 100, 100, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  
  const texture = new CanvasTexture(canvas);
  
  const material = new PointsMaterial({
    size: 0.8,
    map: texture,
    transparent: true,
    opacity: 0.6,
    blending: 2, // THREE.AdditiveBlending
    depthWrite: false
  });

  return { particleGeometry: geometry, particleMaterial: material, particleCount };
}

function createExhaustParticles() {
  const particleCount = 50;
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const lifetimes = new Float32Array(particleCount);
  const startTimes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 0.5;
    positions[i3 + 1] = -0.2;
    positions[i3 + 2] = (Math.random() - 0.5) * 0.5;
    
    velocities[i3] = (Math.random() - 0.5) * 0.2;
    velocities[i3 + 1] = -Math.random() * 0.2 - 0.1;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.2;
    
    lifetimes[i] = 1;
    startTimes[i] = 0;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
  geometry.setAttribute('startTime', new THREE.BufferAttribute(startTimes, 1));

  // Create exhaust texture
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
  gradient.addColorStop(0.5, 'rgba(200, 50, 0, 0.4)');
  gradient.addColorStop(1, 'rgba(100, 20, 0, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  
  const texture = new CanvasTexture(canvas);
  
  const material = new PointsMaterial({
    size: 0.4,
    map: texture,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  return { particleGeometry: geometry, particleMaterial: material, particleCount };
}

function createDustParticles() {
  const particleCount = 80;
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const lifetimes = new Float32Array(particleCount);
  const startTimes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 4;
    positions[i3 + 1] = 0;
    positions[i3 + 2] = (Math.random() - 0.5) * 4;
    
    velocities[i3] = (Math.random() - 0.5) * 2;
    velocities[i3 + 1] = Math.random() * 1;
    velocities[i3 + 2] = (Math.random() - 0.5) * 2;
    
    lifetimes[i] = 1;
    startTimes[i] = 0;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
  geometry.setAttribute('startTime', new THREE.BufferAttribute(startTimes, 1));

  // Create dust texture
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(139, 115, 85, 0.8)');
  gradient.addColorStop(0.5, 'rgba(160, 140, 100, 0.4)');
  gradient.addColorStop(1, 'rgba(180, 160, 120, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  
  const texture = new CanvasTexture(canvas);
  
  const material = new PointsMaterial({
    size: 1.2,
    map: texture,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  return { particleGeometry: geometry, particleMaterial: material, particleCount };
}

function createRainParticles() {
  const particleCount = 200;
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const lifetimes = new Float32Array(particleCount);
  const startTimes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 100;
    positions[i3 + 1] = Math.random() * 50 + 10;
    positions[i3 + 2] = (Math.random() - 0.5) * 100;
    
    velocities[i3] = (Math.random() - 0.5) * 0.5;
    velocities[i3 + 1] = -Math.random() * 5 - 2;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.5;
    
    lifetimes[i] = 1;
    startTimes[i] = 0;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
  geometry.setAttribute('startTime', new THREE.BufferAttribute(startTimes, 1));

  const material = new PointsMaterial({
    size: 0.1,
    color: '#4169E1',
    transparent: true,
    opacity: 0.6
  });

  return { particleGeometry: geometry, particleMaterial: material, particleCount };
}

function createSandParticles() {
  const particleCount = 150;
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const lifetimes = new Float32Array(particleCount);
  const startTimes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 20;
    positions[i3 + 1] = Math.random() * 5;
    positions[i3 + 2] = (Math.random() - 0.5) * 20;
    
    velocities[i3] = (Math.random() - 0.5) * 3;
    velocities[i3 + 1] = Math.random() * 2;
    velocities[i3 + 2] = (Math.random() - 0.5) * 3;
    
    lifetimes[i] = 1;
    startTimes[i] = 0;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
  geometry.setAttribute('startTime', new THREE.BufferAttribute(startTimes, 1));

  const material = new PointsMaterial({
    size: 0.3,
    color: '#F4A460',
    transparent: true,
    opacity: 0.7
  });

  return { particleGeometry: geometry, particleMaterial: material, particleCount };
}

// Utility component for easy particle system integration
export function TireSmokeEffect({ position, intensity = 1, enabled = true }: { 
  position: [number, number, number]; 
  intensity?: number; 
  enabled?: boolean; 
}) {
  return (
    <ParticleSystem
      type="tire-smoke"
      position={position}
      intensity={intensity}
      duration={3000}
      size={1}
      color="#888888"
      enabled={enabled}
    />
  );
}

export function ExhaustEffect({ position, intensity = 1, enabled = true }: { 
  position: [number, number, number]; 
  intensity?: number; 
  enabled?: boolean; 
}) {
  return (
    <ParticleSystem
      type="exhaust"
      position={position}
      intensity={intensity}
      duration={2000}
      size={0.8}
      color="#FF4500"
      enabled={enabled}
    />
  );
}

export function CrashDustEffect({ position, intensity = 1, enabled = true }: { 
  position: [number, number, number]; 
  intensity?: number; 
  enabled?: boolean; 
}) {
  return (
    <ParticleSystem
      type="crash-dust"
      position={position}
      intensity={intensity}
      duration={4000}
      size={1.5}
      color="#D2B48C"
      enabled={enabled}
    />
  );
}