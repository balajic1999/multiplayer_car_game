import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as CANNON from 'cannon-es';
import { Vector3, Euler } from 'three';
import { useGameStore } from '../store/gameStore';
import { CarController, CarControls } from '../utils/carController';
import { createPhysicsWorld, createGroundBody, createCarBody } from '../utils/physics';
import { getCheckpointPosition, getTotalLaps } from '../utils/trackData';
import Car from './components/Car';
import Track from './components/Track';
import HUD from '../components/HUD';
import { CarType } from '../../../shared/types/index';

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

  const worldRef = useRef<CANNON.World | null>(null);
  const carBodyRef = useRef<CANNON.Body | null>(null);
  const carControllerRef = useRef<CarController | null>(null);
  const controlsRef = useRef<CarControls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false
  });
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(Date.now());
  const otherPlayersRef = useRef<Map<string, { position: Vector3; rotation: Euler }>>(new Map());

  const totalLaps = currentLobby ? getTotalLaps(currentLobby.difficulty) : 3;

  useEffect(() => {
    if (!currentLobby || !raceState) return;

    const world = createPhysicsWorld();
    const groundBody = createGroundBody();
    world.addBody(groundBody);

    const startPos = new CANNON.Vec3(
      currentLobby.trackType === 'city' ? 0 : 0,
      2,
      currentLobby.trackType === 'city' ? 5 : 10
    );
    const carBody = createCarBody(1000);
    carBody.position.copy(startPos);
    world.addBody(carBody);

    const controller = new CarController(carBody, CarType.BALANCED, currentLobby.difficulty);

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

        setSpeed(controller.getSpeed());
        setLapTime(now - lastLapTime);

        checkCheckpoints(carBody);

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
            damage: 0,
            currentLap,
            lastCheckpoint,
            speed: controller.getSpeed()
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
  }, [currentLobby, raceState]);

  useEffect(() => {
    if (!socket) return;

    const handlePlayerStateUpdate = (playerId: string, state: any) => {
      if (playerId !== localPlayerId) {
        otherPlayersRef.current.set(playerId, {
          position: new Vector3(state.position.x, state.position.y, state.position.z),
          rotation: new Euler(state.rotation.x, state.rotation.y, state.rotation.z)
        });
      }
    };

    socket.on('playerStateUpdate', handlePlayerStateUpdate);

    return () => {
      socket.off('playerStateUpdate', handlePlayerStateUpdate);
    };
  }, [socket, localPlayerId]);

  const checkCheckpoints = useCallback((carBody: CANNON.Body) => {
    if (!currentLobby || hasFinished) return;

    const checkpointPos = getCheckpointPosition(currentLobby.trackType, lastCheckpoint);
    if (!checkpointPos) return;

    const distance = Math.sqrt(
      Math.pow(carBody.position.x - checkpointPos.x, 2) +
      Math.pow(carBody.position.z - checkpointPos.z, 2)
    );

    if (distance < 8) {
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
        case 'c':
          setCameraMode(mode => mode === 'follow' ? 'orbit' : mode === 'orbit' ? 'top' : 'follow');
          break;
        case 'r':
          if (carBodyRef.current && currentLobby) {
            const startPos = new CANNON.Vec3(0, 2, 5);
            carControllerRef.current?.reset(startPos, 0);
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
  }, [currentLobby]);

  if (!currentLobby || !raceState) {
    return null;
  }

  const playerCar = carBodyRef.current;
  const totalPlayers = currentLobby.players.length;

  return (
    <>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 10, 20]} />
        
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[50, 50, 0]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />
        <hemisphereLight args={['#87CEEB', '#2d5016', 0.3]} />

        <Track trackType={currentLobby.trackType} />

        {playerCar && (
          <PlayerCarWrapper
            carBody={playerCar}
            color={currentLobby.players.find(p => p.id === localPlayerId)?.color}
          />
        )}

        {Array.from(otherPlayersRef.current.entries()).map(([playerId, data]) => {
          const player = currentLobby.players.find(p => p.id === playerId);
          return (
            <Car
              key={playerId}
              position={[data.position.x, data.position.y, data.position.z]}
              rotation={[data.rotation.x, data.rotation.y, data.rotation.z]}
              color={player?.color}
            />
          );
        })}

        {cameraMode === 'orbit' && <OrbitControls />}
        {cameraMode === 'follow' && playerCar && (
          <FollowCamera
            carBody={playerCar}
          />
        )}
        {cameraMode === 'top' && playerCar && (
          <TopCamera
            target={new Vector3(playerCar.position.x, playerCar.position.y, playerCar.position.z)}
          />
        )}
      </Canvas>

      <HUD
        speed={speed}
        position={1}
        totalPlayers={totalPlayers}
        currentLap={currentLap}
        totalLaps={totalLaps}
        lapTime={lapTime}
        bestLapTime={bestLapTime}
      />
    </>
  );
}

function PlayerCarWrapper({ carBody, color }: { carBody: CANNON.Body; color?: string }) {
  const euler = new CANNON.Vec3();
  carBody.quaternion.toEuler(euler);
  
  return (
    <Car
      position={[carBody.position.x, carBody.position.y, carBody.position.z]}
      rotation={[euler.x, euler.y, euler.z]}
      color={color}
    />
  );
}

function FollowCamera({ carBody }: { carBody: CANNON.Body }) {
  const cameraRef = useRef<any>();

  useEffect(() => {
    if (cameraRef.current) {
      const euler = new CANNON.Vec3();
      carBody.quaternion.toEuler(euler);
      const target = new Vector3(carBody.position.x, carBody.position.y, carBody.position.z);
      const offset = new Vector3(0, 5, 10);
      const rotatedOffset = offset.applyAxisAngle(new Vector3(0, 1, 0), euler.y);
      cameraRef.current.position.copy(target).add(rotatedOffset);
      cameraRef.current.lookAt(target);
    }
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault />;
}

function TopCamera({ target }: { target: Vector3 }) {
  const cameraRef = useRef<any>();

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.set(target.x, target.y + 30, target.z);
      cameraRef.current.lookAt(target);
    }
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault />;
}
