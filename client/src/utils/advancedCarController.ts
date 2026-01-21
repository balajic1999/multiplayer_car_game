import * as CANNON from 'cannon-es';
import { Vector3, Euler } from 'three';
import { CarType, DifficultyLevel, CAR_STATS, DIFFICULTY_SETTINGS } from '../../../shared/types/index';

export interface CarControls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
  handbrake?: boolean;
}

export interface CarPhysics {
  speed: number;
  acceleration: number;
  velocity: Vector3;
  angularVelocity: Vector3;
  grip: number;
  tireTemp: number;
  damage: number;
  lastCheckpoint: number;
}

export class AdvancedCarController {
  private carBody: CANNON.Body;
  private carType: CarType;
  private difficulty: DifficultyLevel;
  private controls: CarControls = { forward: false, backward: false, left: false, right: false, brake: false };
  private physics: CarPhysics;
  private wheelBodies: CANNON.Body[] = [];
  private suspensionConstraints: CANNON.DistanceConstraint[] = [];
  private lastUpdateTime: number = 0;
  
  // Physics constants - More realistic values
  private readonly ENGINE_FORCE = 1500;
  private readonly BRAKE_FORCE = 800;
  private readonly MAX_SPEED = 150; // km/h
  private readonly STEER_FORCE = 8;
  private readonly STEER_SPEED_FACTOR = 0.7;
  
  // Suspension settings
  private readonly SUSPENSION_STIFFNESS = 30;
  private readonly SUSPENSION_DAMPING = 2.5;
  private readonly SUSPENSION_REST_LENGTH = 0.35;
  
  // Tire properties
  private readonly TIRE_FRICTION = 0.9;
  private readonly DRIFT_THRESHOLD = 0.3;
  private readonly TIRE_TEMP_OPTIMAL = 85;
  private readonly TIRE_TEMP_MIN = 60;
  private readonly TIRE_TEMP_MAX = 120;

  constructor(carBody: CANNON.Body, carType: CarType, difficulty: DifficultyLevel) {
    this.carBody = carBody;
    this.carType = carType;
    this.difficulty = difficulty;
    
    this.physics = {
      speed: 0,
      acceleration: 0,
      velocity: new Vector3(),
      angularVelocity: new Vector3(),
      grip: 1.0,
      tireTemp: this.TIRE_TEMP_MIN,
      damage: 0,
      lastCheckpoint: 0
    };
    
    this.setupAdvancedPhysics();
    this.setupWheelPhysics();
  }

  private setupAdvancedPhysics() {
    const carStats = CAR_STATS[this.carType];
    
    // Enhanced material properties with better friction
    const material = new CANNON.Material('carMaterial');
    
    this.carBody.material = material;
    this.carBody.mass = carStats.weight;
    this.carBody.linearDamping = 0.15;
    this.carBody.angularDamping = 0.5;
    
    // Center of mass adjustments for different car types (affects handling)
    switch (this.carType) {
      case CarType.SPEEDSTER:
        this.carBody.centerOfMass = new CANNON.Vec3(0, -0.2, 0.1);
        break;
      case CarType.HEAVY:
        this.carBody.centerOfMass = new CANNON.Vec3(0, -0.05, 0);
        break;
      default:
        this.carBody.centerOfMass = new CANNON.Vec3(0, -0.15, 0.05);
    }
  }

  private setupWheelPhysics() {
    const wheelPositions = [
      new CANNON.Vec3(-1, 0, -1.5), // Front left
      new CANNON.Vec3(1, 0, -1.5),  // Front right
      new CANNON.Vec3(-1, 0, 1.5),  // Rear left
      new CANNON.Vec3(1, 0, 1.5)    // Rear right
    ];

    wheelPositions.forEach((position, index) => {
      // Create wheel body
      const wheelBody = new CANNON.Body({
        mass: 50,
        material: new CANNON.Material('wheelMaterial')
      });
      
      const wheelShape = new CANNON.Sphere(0.375);
      wheelBody.addShape(wheelShape);
      wheelBody.position.copy(position);
      
      // Create suspension constraint
      const suspensionConstraint = new CANNON.DistanceConstraint(
        this.carBody,
        wheelBody,
        this.SUSPENSION_REST_LENGTH,
        this.SUSPENSION_STIFFNESS
      );
      
      this.wheelBodies.push(wheelBody);
      this.suspensionConstraints.push(suspensionConstraint);
    });
  }

  public setControls(controls: CarControls) {
    this.controls = controls;
  }

  public update() {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    this.updateTireTemperature(deltaTime);
    this.updatePhysics(deltaTime);
    this.applyForces(deltaTime);
    this.updateGrip();
    
    // Update physics properties
    this.physics.speed = this.carBody.velocity.length() * 3.6; // Convert to km/h
    this.physics.velocity.set(
      this.carBody.velocity.x,
      this.carBody.velocity.y,
      this.carBody.velocity.z
    );
    this.physics.angularVelocity.set(
      this.carBody.angularVelocity.x,
      this.carBody.angularVelocity.y,
      this.carBody.angularVelocity.z
    );
  }

  private updateTireTemperature(deltaTime: number) {
    const speed = this.physics.speed;
    const isBraking = this.controls.brake || this.controls.handbrake;
    const isAccelerating = this.controls.forward;
    
    // Temperature increases with speed and friction
    let tempChange = 0;
    
    if (isBraking) {
      tempChange += 30 * deltaTime; // Braking generates heat
    }
    
    if (isAccelerating) {
      tempChange += 15 * deltaTime; // Acceleration generates some heat
    }
    
    // Speed-based heat generation (more heat at high speed)
    tempChange += (speed / 120) * 20 * deltaTime;
    
    // Natural cooling
    tempChange -= 10 * deltaTime;
    
    this.physics.tireTemp = Math.max(
      this.TIRE_TEMP_MIN,
      Math.min(this.TIRE_TEMP_MAX, this.physics.tireTemp + tempChange)
    );
  }

  private updatePhysics(deltaTime: number) {
    // Limit max speed
    const currentSpeed = this.carBody.velocity.length() * 3.6;
    if (currentSpeed > this.MAX_SPEED) {
      const velocityDirection = this.carBody.velocity.clone().normalize();
      this.carBody.velocity.copy(velocityDirection.scale(this.MAX_SPEED / 3.6));
    }
  }

  private calculateSpringForce(wheelBody: CANNON.Body): CANNON.Vec3 {
    const currentLength = this.carBody.position.distanceTo(wheelBody.position);
    const displacement = this.SUSPENSION_REST_LENGTH - currentLength;
    
    // Spring force proportional to displacement
    const springForce = displacement * this.SUSPENSION_STIFFNESS;
    
    // Damping force proportional to relative velocity
    const relativeVelocity = wheelBody.velocity.distanceTo(this.carBody.velocity);
    const dampingForce = relativeVelocity * this.SUSPENSION_DAMPING;
    
    return new CANNON.Vec3(0, springForce + dampingForce, 0);
  }

  private applyForces(deltaTime: number) {
    const carStats = CAR_STATS[this.carType];
    const difficultySettings = DIFFICULTY_SETTINGS[this.difficulty];
    
    const speed = this.physics.speed;
    const speedFactor = Math.max(0.3, 1 - (speed / this.MAX_SPEED) * this.STEER_SPEED_FACTOR);
    
    // Improved steering with angular velocity
    let steerAngle = 0;
    if (this.controls.left) {
      steerAngle = this.STEER_FORCE * speedFactor;
    }
    if (this.controls.right) {
      steerAngle = -this.STEER_FORCE * speedFactor;
    }
    
    if (steerAngle !== 0) {
      const angularVelocity = new CANNON.Vec3(0, steerAngle, 0);
      this.carBody.angularVelocity.y = angularVelocity.y;
    }
    
    // Forward acceleration with speed-based power curve
    if (this.controls.forward) {
      const speedRatio = speed / this.MAX_SPEED;
      const powerMultiplier = Math.max(0.3, 1 - speedRatio * 0.7);
      const engineForce = this.ENGINE_FORCE * 
        (carStats.acceleration / 100) * 
        difficultySettings.physicsRealism * 
        powerMultiplier;
      
      this.carBody.applyLocalForce(
        new CANNON.Vec3(0, 0, -engineForce),
        new CANNON.Vec3(0, 0, 0)
      );
    }
    
    // Backward/Reverse
    if (this.controls.backward) {
      if (speed > 5) {
        const brakeForce = this.BRAKE_FORCE * (this.controls.handbrake ? 1.5 : 1);
        this.carBody.applyLocalForce(
          new CANNON.Vec3(0, 0, brakeForce),
          new CANNON.Vec3(0, 0, 0)
        );
      } else {
        this.carBody.applyLocalForce(
          new CANNON.Vec3(0, 0, this.ENGINE_FORCE * 0.4),
          new CANNON.Vec3(0, 0, 0)
        );
      }
    }
    
    // Dedicated brake
    if (this.controls.brake && !this.controls.backward) {
      const velocity = this.carBody.velocity.clone();
      if (velocity.length() > 0.1) {
        const brakingForce = velocity.normalize().scale(-this.BRAKE_FORCE * 0.8);
        this.carBody.applyForce(brakingForce, this.carBody.position);
      }
    }
    
    // Handbrake for drifting
    if (this.controls.handbrake && speed > 10) {
      this.applyHandbrake();
    }
    
    // Realistic air resistance
    this.applyAirResistance();
    
    // Apply rolling resistance
    this.applyRollingResistance();
  }

  private applyHandbrake() {
    this.physics.grip = 0.3;
    
    const lateralVelocity = new CANNON.Vec3();
    this.carBody.vectorToWorldFrame(new CANNON.Vec3(1, 0, 0), lateralVelocity);
    
    const lateralSpeed = this.carBody.velocity.dot(lateralVelocity);
    const driftForce = lateralVelocity.scale(-lateralSpeed * 5);
    
    this.carBody.applyForce(driftForce, this.carBody.position);
    
    this.carBody.angularVelocity.y *= 1.3;
  }

  private applyAirResistance() {
    const velocity = this.carBody.velocity;
    const speed = velocity.length();
    
    if (speed > 0.1) {
      const dragCoefficient = 0.015;
      const dragForce = speed * speed * dragCoefficient;
      const dragDirection = velocity.clone().normalize().scale(-dragForce);
      
      this.carBody.applyForce(dragDirection, this.carBody.position);
    }
  }

  private applyRollingResistance() {
    const velocity = this.carBody.velocity;
    const speed = velocity.length();
    
    if (speed > 0.1) {
      const rollingCoefficient = 0.02;
      const rollingForce = speed * rollingCoefficient * this.carBody.mass;
      const rollingDirection = velocity.clone().normalize().scale(-rollingForce);
      
      this.carBody.applyForce(rollingDirection, this.carBody.position);
    }
  }

  private getCarFrontalArea(): number {
    switch (this.carType) {
      case CarType.SPEEDSTER:
        return 2.0;
      case CarType.HEAVY:
        return 2.8;
      case CarType.BALANCED:
      default:
        return 2.3;
    }
  }

  private updateGrip() {
    const speed = this.physics.speed;
    const tireTemp = this.physics.tireTemp;
    
    // Base grip
    let grip = 1.0;
    
    // Speed affects grip (less grip at very high speed)
    if (speed > 80) {
      grip *= Math.max(0.6, 1 - (speed - 80) / 100);
    }
    
    // Tire temperature affects grip
    const tempDiff = Math.abs(tireTemp - this.TIRE_TEMP_OPTIMAL);
    grip *= Math.max(0.5, 1 - tempDiff / 40);
    
    // Damage affects grip
    grip *= Math.max(0.3, 1 - this.physics.damage / 200);
    
    // Difficulty affects grip
    const difficultySettings = DIFFICULTY_SETTINGS[this.difficulty];
    grip *= difficultySettings.physicsRealism;
    
    this.physics.grip = Math.max(0.1, Math.min(1.0, grip));
  }

  public getSpeed(): number {
    return this.physics.speed;
  }

  public getAcceleration(): number {
    return this.physics.acceleration;
  }

  public getGrip(): number {
    return this.physics.grip;
  }

  public getTireTemperature(): number {
    return this.physics.tireTemp;
  }

  public getDamage(): number {
    return this.physics.damage;
  }

  public isDrifting(): boolean {
    return this.physics.grip < this.DRIFT_THRESHOLD && this.physics.speed > 20;
  }

  public getPhysicsState(): CarPhysics {
    return { ...this.physics };
  }

  public reset(position: CANNON.Vec3, rotation: number) {
    this.carBody.position.copy(position);
    this.carBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotation);
    this.carBody.velocity.setZero();
    this.carBody.angularVelocity.setZero();
    
    // Reset physics state
    this.physics.speed = 0;
    this.physics.acceleration = 0;
    this.physics.tireTemp = this.TIRE_TEMP_MIN;
    this.physics.damage = Math.max(0, this.physics.damage - 10); // Minor damage repair
    
    this.wheelBodies.forEach(wheel => {
      wheel.position.copy(this.carBody.position);
      wheel.velocity.setZero();
    });
  }

  public addDamage(amount: number) {
    this.physics.damage = Math.min(100, this.physics.damage + amount);
  }
}