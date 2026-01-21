import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as CANNON from 'cannon-es';
import { Vector3, Euler } from 'three';
import { useGameStore } from '../store/gameStore';
import { AdvancedCarController } from '../utils/advancedCarController';
import { createPhysicsWorld, createGroundBody, createCarBody } from '../utils/physics';
import { getCheckpointPosition, getTotalLaps } from '../utils/trackData';
import RealisticCar from './components/RealisticCar';
import AdvancedTrack from './components/AdvancedTrack';
import AdvancedHUD from '../components/AdvancedHUD';
import { TireSmokeEffect, ExhaustEffect, CrashDustEffect } from '../components/ParticleSystem';
import { CarType, DifficultyLevel } from '../../../shared/types/index';
import { getTrackConfig } from '../utils/trackData';

export default function RaceScene() {
  const { currentLobby, raceState, localPlayerId, socket, finishRace } = useGameStore();
  const [cameraMode, setCameraMode] = useState<'follow' | 'orbit' | 'top'>('follow');
  const [speed, setSpeed] = useState(0);
  const [currentLap, setCurrentLap] = useState(1);
  const [lapTime, setLapTime] = useState(0);
  const [bestLapTime, setBestLapTime] = useState(0);
  const [lapTimes, setLapTimes] = useState<number[]>([]);
  const [lastCheckpoint, setLastCheckpoint] = useState(0);
  const [raceStartTime, setRaceStartTime] = useState(0);
  const [lastLapTime, setLastLapTime] = useState(0);
  const [hasFinished, setHasFinished] = useState(false);
  const [carDamage, setCarDamage] = useState(0);
  const [tireGrip, setTireGrip] = useState(1.0);
  const [tireTemperature, setTireTemperature] = useState(80);
  const [showTireSmoke, setShowTireSmoke] = useState(false);
  const [showExhaust, setShowExhaust] = useState(false);
  const [showCrashDust, setShowCrashDust] = useState(false);

  const worldRef = useRef<CANNON.World | null>(null);
  const carBodyRef = useRef<CANNON.Body | null>(null);
  const carControllerRef = useRef<AdvancedCarController | null>(null);
  const controlsRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
    handbrake: false
  });
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(Date.now());
  const otherPlayersRef = useRef<Map<string, { position: Vector3; rotation: Euler; carType: CarType }>>(new Map());

  const totalLaps = currentLobby ? getTotalLaps(currentLobby.difficulty) : 3;
  const trackConfig = currentLobby ? getTrackConfig(currentLobby.trackType) : null;

  useEffect(() => {
    if (!currentLobby || !raceState) return;

    const world = createPhysicsWorld();
    const groundBody = createGroundBody();
    world.addBody(groundBody);

    // Get start position from first checkpoint
    const startCheckpoint = trackConfig?.checkpoints[0];
    const startPos = new CANNON.Vec3(
      startCheckpoint?.x || 0,
      2,
      startCheckpoint?.z || 0
    );
    
    const carBody = createCarBody(1000);
    carBody.position.copy(startPos);
    world.addBody(carBody);

    // Use advanced car controller with selected car type
    const playerCarType = CarType.BALANCED; // Default, should be from player selection
    const controller = new AdvancedCarController(carBody, playerCarType, currentLobby.difficulty);

    worldRef.current = world;
    carBodyRef.current = carBody;
    carControllerRef.current = controller;
    setRaceStartTime(Date.now());
    setLastLapTime(Date.now());

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000;
      lastUpdateRef.current = now;

      if (world && carBody && controller) {
        controller.update();
        world.step(1 / 60, deltaTime, 3);

        const physicsState = controller.getPhysicsState();
        setSpeed(physicsState.speed);
        setCarDamage(physicsState.damage);
        setTireGrip(physicsState.grip);
        setTireTemperature(physicsState.tireTemp);
        setLapTime(now - lastLapTime);

        // Update particle effects
        setShowTireSmoke(physicsState.grip < 0.4 || physicsState.speed > 80);
        setShowExhaust(controlsRef.current.forward || physicsState.speed > 20);
        setShowCrashDust(physicsState.damage > 15 || carBody.velocity.length() > 15);

        checkCheckpoints(carBody);

        // Send car state to server
        if (socket && now % 100 < 16) {
          socket.emit('updateCarState', {
            position: { x: carBody.position.x, y: carBody.position.y, z: carBody.position.z },
            rotation: {
              x: carBody.quaternion.x,
              y: carBody.quaternion.y,
              z: carBody.quaternion.z,
              w: carBody.quaternion.w
            },
            velocity: { x: carBody.velocity.x, y: carBody.velocity.y, z: carBody.velocity.z },
            angularVelocity: {
              x: carBody.angularVelocity.x,
              y: carBody.angularVelocity.y,
              z: carBody.angularVelocity.z
            },
            damage: physicsState.damage,
            currentLap,
            lastCheckpoint,
            speed: physicsState.speed
          });
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentLobby, raceState, socket]);

  useEffect(() => {
    if (!socket) return;

    const handlePlayerStateUpdate = (playerId: string, state: any) => {
      if (playerId !== localPlayerId) {
        const player = currentLobby?.players.find(p => p.id === playerId);
        otherPlayersRef.current.set(playerId, {
          position: new Vector3(state.position.x, state.position.y, state.position.z),
          rotation: new Euler(state.rotation.x, state.rotation.y, state.rotation.z),
          carType: player?.carType || CarType.BALANCED
        });
      }
    };

    socket.on('playerStateUpdate', handlePlayerStateUpdate);

    return () => {
      socket.off('playerStateUpdate', handlePlayerStateUpdate);
    };
  }, [socket, localPlayerId, currentLobby]);

  const checkCheckpoints = useCallback((carBody: CANNON.Body) => {
    if (!currentLobby || hasFinished) return;

    const checkpointPos = getCheckpointPosition(currentLobby.trackType, lastCheckpoint);
    if (!checkpointPos) return;

    const distance = Math.sqrt(
      Math.pow(carBody.position.x - checkpointPos.x, 2) +
      Math.pow(carBody.position.z - checkpointPos.z, 2)
    );

    const checkpointRadius = 15;

    if (distance < checkpointRadius) {
      const totalCheckpoints = currentLobby ? 10 : 10;
      const nextCheckpoint = (lastCheckpoint + 1) % totalCheckpoints;

      if (nextCheckpoint === 0) {
        const now = Date.now();
        const lapDuration = now - lastLapTime;
        const newLapTimes = [...lapTimes, lapDuration];
        setLapTimes(newLapTimes);
        setLastLapTime(now);

        if (bestLapTime === 0 || lapDuration < bestLapTime) {
          setBestLapTime(lapDuration);
        }

        if (currentLap >= totalLaps) {
          setHasFinished(true);
          finishRace(now - raceStartTime, newLapTimes);
        } else {
          setCurrentLap(currentLap + 1);
        }
      }

      setLastCheckpoint(nextCheckpoint);
    }
  }, [currentLobby, lastCheckpoint, currentLap, lapTimes, bestLapTime, lastLapTime, raceStartTime, totalLaps, hasFinished, finishRace]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          controlsRef.current.forward = true;
          break;
        case 's':
        case 'arrowdown':
          controlsRef.current.backward = true;
          break;
        case 'a':
        case 'arrowleft':
          controlsRef.current.left = true;
          break;
        case 'd':
        case 'arrowright':
          controlsRef.current.right = true;
          break;
        case ' ':
          controlsRef.current.brake = true;
          break;
        case 'shift':
          controlsRef.current.handbrake = true;
          break;
        case 'c':
          setCameraMode(mode => mode === 'follow' ? 'orbit' : mode === 'orbit' ? 'top' : 'follow');
          break;
        case 'r':
          if (carBodyRef.current && carControllerRef.current && currentLobby && trackConfig) {
            const resetCheckpoint = trackConfig.checkpoints[lastCheckpoint] || trackConfig.checkpoints[0];
            const resetPos = new CANNON.Vec3(resetCheckpoint.x, 2, resetCheckpoint.z);
            carControllerRef.current.reset(resetPos, 0);
          }
          break;
      }
      
      if (carControllerRef.current) {
        carControllerRef.current.setControls(controlsRef.current);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          controlsRef.current.forward = false;
          break;
        case 's':
        case 'arrowdown':
          controlsRef.current.backward = false;
          break;
        case 'a':
        case 'arrowleft':
          controlsRef.current.left = false;
          break;
        case 'd':
        case 'arrowright':
          controlsRef.current.right = false;
          break;
        case ' ':
          controlsRef.current.brake = false;
          break;
        case 'shift':
          controlsRef.current.handbrake = false;
          break;
      }
      
      if (carControllerRef.current) {
        carControllerRef.current.setControls(controlsRef.current);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentLobby, trackConfig, lastCheckpoint]);

  if (!currentLobby || !raceState) {
    return null;
  }

  const playerCar = carBodyRef.current;
  const totalPlayers = currentLobby.players.length;
  const localPlayer = currentLobby.players.find(p => p.id === localPlayerId);
  const selectedCarType = localPlayer?.carType || CarType.BALANCED;

  return (
    <>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 10, 20]} />
        
        {/* Advanced Lighting based on track */}
        {trackConfig && (
          <AdvancedLighting timeOfDay={trackConfig.timeOfDay} />
        )}

        {/* Advanced Track */}
        {trackConfig && (
          <AdvancedTrack trackConfig={trackConfig} />
        )}

        {/* Player Car with realistic model */}
        {playerCar && (
          <PlayerRealisticCar
            carBody={playerCar}
            carType={selectedCarType}
            color={localPlayer?.color}
            damage={carDamage}
          />
        )}

        {/* Particle Effects */}
        {playerCar && showTireSmoke && (
          <TireSmokeEffect
            position={[playerCar.position.x, playerCar.position.y - 0.5, playerCar.position.z]}
            intensity={tireGrip < 0.5 ? 1.0 : 0.5}
            enabled={true}
          />
        )}

        {playerCar && showExhaust && (
          <ExhaustEffect
            position={[playerCar.position.x, playerCar.position.y - 0.5, playerCar.position.z - 2.5]}
            intensity={controlsRef.current.forward ? 0.8 : 0.3}
            enabled={true}
          />
        )}

        {playerCar && showCrashDust && (
          <CrashDustEffect
            position={[playerCar.position.x, playerCar.position.y, playerCar.position.z]}
            intensity={carDamage > 20 ? 0.8 : 0.3}
            enabled={true}
          />
        )}

        {/* Other players with realistic cars */}
        {Array.from(otherPlayersRef.current.entries()).map(([playerId, data]) => {
          const player = currentLobby.players.find(p => p.id === playerId);
          return (
            <RealisticCar
              key={playerId}
              position={[data.position.x, data.position.y, data.position.z]}
              rotation={[data.rotation.x, data.rotation.y, data.rotation.z]}
              carType={data.carType}
              color={player?.color}
            />
          );
        })}

        {/* Camera modes */}
        {cameraMode === 'orbit' && <OrbitControls />}
        {cameraMode === 'follow' && playerCar && (
          <AdvancedFollowCamera
            carBody={playerCar}
            carController={carControllerRef.current}
          />
        )}
        {cameraMode === 'top' && playerCar && (
          <AdvancedTopCamera
            target={new Vector3(playerCar.position.x, playerCar.position.y, playerCar.position.z)}
          />
        )}
      </Canvas>

      <AdvancedHUD
        speed={speed}
        position={1}
        totalPlayers={totalPlayers}
        currentLap={currentLap}
        totalLaps={totalLaps}
        lapTime={lapTime}
        bestLapTime={bestLapTime}
        carDamage={carDamage}
        tireGrip={tireGrip}
        tireTemperature={tireTemperature}
        carType={selectedCarType}
        cameraMode={cameraMode}
        onCameraModeChange={setCameraMode}
      />
    </>
  );
}

function PlayerRealisticCar({ 
  carBody, 
  carType, 
  color, 
  damage 
}: { 
  carBody: CANNON.Body; 
  carType: CarType; 
  color?: string; 
  damage: number;
}) {
  const euler = new CANNON.Vec3();
  carBody.quaternion.toEuler(euler);
  
  return (
    <RealisticCar
      position={[carBody.position.x, carBody.position.y, carBody.position.z]}
      rotation={[euler.x, euler.y, euler.z]}
      carType={carType}
      color={color}
      damage={damage}
    />
  );
}

function AdvancedFollowCamera({ 
  carBody, 
  carController 
}: { 
  carBody: CANNON.Body; 
  carController: AdvancedCarController | null;
}) {
  const cameraRef = useRef<any>();
  const targetPosRef = useRef(new Vector3());
  const currentPosRef = useRef(new Vector3());

  useEffect(() => {
    if (cameraRef.current && carBody) {
      const euler = new CANNON.Vec3();
      carBody.quaternion.toEuler(euler);
      const carPosition = new Vector3(carBody.position.x, carBody.position.y, carBody.position.z);
      
      // Dynamic camera distance based on speed
      const speed = carController?.getSpeed() || 0;
      const baseDistance = 10;
      const speedBonus = Math.min(speed / 40, 6);
      const distance = baseDistance + speedBonus;
      const height = 4 + speedBonus * 0.3;
      
      // Calculate desired camera position behind the car
      const offset = new Vector3(0, height, distance);
      const rotatedOffset = offset.applyAxisAngle(new Vector3(0, 1, 0), euler.y);
      
      targetPosRef.current.copy(carPosition).add(rotatedOffset);
      
      // Smooth camera movement
      currentPosRef.current.lerp(targetPosRef.current, 0.1);
      
      cameraRef.current.position.copy(currentPosRef.current);
      cameraRef.current.lookAt(carPosition.x, carPosition.y + 1, carPosition.z);
    }
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault fov={75} />;
}

function AdvancedTopCamera({ target }: { target: Vector3 }) {
  const cameraRef = useRef<any>();
  const currentPosRef = useRef(new Vector3());

  useEffect(() => {
    if (cameraRef.current) {
      const targetPos = new Vector3(target.x, target.y + 50, target.z + 5);
      
      currentPosRef.current.lerp(targetPos, 0.1);
      
      cameraRef.current.position.copy(currentPosRef.current);
      cameraRef.current.lookAt(target.x, target.y, target.z);
    }
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault fov={60} />;
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
