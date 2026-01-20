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
  
  // Physics constants
  private readonly ENGINE_FORCE = 3000;
  private readonly BRAKE_FORCE = 2000;
  private readonly MAX_SPEED = 120; // km/h
  private readonly GRAVITY = -9.82;
  
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
    const difficultySettings = DIFFICULTY_SETTINGS[this.difficulty];
    
    // Enhanced material properties
    const material = new CANNON.Material('carMaterial');
    const contactMaterial = new CANNON.ContactMaterial(material, material, {
      friction: 0.4,
      restitution: 0.1,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3,
      frictionEquationStiffness: 1e8,
      frictionEquationRelaxation: 3
    });
    
    this.carBody.material = material;
    this.carBody.mass = carStats.weight;
    this.carBody.linearDamping = 0.01;
    this.carBody.angularDamping = 0.3;
    
    // More realistic shape for better physics
    const shape = new CANNON.Box(new CANNON.Vec3(1, 0.4, 2));
    this.carBody.addShape(shape, new CANNON.Vec3(0, 0, 0));
    
    // Center of mass adjustments for different car types
    switch (this.carType) {
      case CarType.SPEEDSTER:
        this.carBody.centerOfMass = new CANNON.Vec3(0, -0.1, 0); // Lower center of mass
        break;
      case CarType.HEAVY:
        this.carBody.centerOfMass = new CANNON.Vec3(0, 0.1, 0); // Higher center of mass
        break;
      default:
        this.carBody.centerOfMass = new CANNON.Vec3(0, 0, 0);
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
    const carStats = CAR_STATS[this.carType];
    const difficultySettings = DIFFICULTY_SETTINGS[this.difficulty];
    
    // Apply gravity
    this.carBody.applyForce(new CANNON.Vec3(0, this.GRAVITY * this.carBody.mass, 0));
    
    // Update wheel physics
    this.wheelBodies.forEach((wheel, index) => {
      // Suspension forces
      const springForce = this.calculateSpringForce(wheel);
      wheel.applyForce(springForce, wheel.position);
    });
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
    
    // Calculate steering based on speed
    const speed = this.physics.speed;
    const maxSteer = Math.max(0.1, 1 - (speed / 100)); // Less steering at high speed
    
    // Steering forces
    if (this.controls.left) {
      const steerForce = this.ENGINE_FORCE * 0.3 * maxSteer;
      this.carBody.applyLocalForce(
        new CANNON.Vec3(-steerForce, 0, 0),
        new CANNON.Vec3(0, 0, -2)
      );
    }
    
    if (this.controls.right) {
      const steerForce = this.ENGINE_FORCE * 0.3 * maxSteer;
      this.carBody.applyLocalForce(
        new CANNON.Vec3(steerForce, 0, 0),
        new CANNON.Vec3(0, 0, -2)
      );
    }
    
    // Acceleration and braking
    if (this.controls.forward) {
      const engineForce = this.ENGINE_FORCE * (carStats.acceleration / 100) * difficultySettings.physicsRealism;
      this.carBody.applyLocalForce(
        new CANNON.Vec3(0, 0, engineForce),
        new CANNON.Vec3(0, 0, 0)
      );
    }
    
    if (this.controls.backward) {
      const brakeForce = this.BRAKE_FORCE * (this.controls.handbrake ? 1.5 : 1);
      const force = speed > 5 ? brakeForce : this.ENGINE_FORCE * 0.5; // Reverse if slow
      this.carBody.applyLocalForce(
        new CANNON.Vec3(0, 0, -force),
        new CANNON.Vec3(0, 0, 0)
      );
    }
    
    // Braking
    if (this.controls.brake) {
      const velocity = this.carBody.velocity.clone();
      const brakingForce = velocity.scale(-this.BRAKE_FORCE * deltaTime);
      this.carBody.applyForce(brakingForce, this.carBody.position);
    }
    
    // Handbrake for drifting
    if (this.controls.handbrake) {
      this.applyHandbrake();
    }
    
    // Air resistance
    this.applyAirResistance();
  }

  private applyHandbrake() {
    const velocity = this.carBody.velocity.clone();
    const horizontalVelocity = new CANNON.Vec3(velocity.x, 0, velocity.z);
    
    // Reduce grip and add rotational force
    this.physics.grip = 0.3;
    
    const rotationalForce = new CANNON.Vec3(
      -velocity.z * 2,
      0,
      velocity.x * 2
    );
    
    this.carBody.applyForce(rotationalForce, this.carBody.position);
  }

  private applyAirResistance() {
    const velocity = this.carBody.velocity;
    const speed = velocity.length();
    
    if (speed > 0) {
      const dragCoefficient = 0.425; // Typical car drag coefficient
      const frontalArea = this.getCarFrontalArea();
      const airDensity = 1.225; // kg/m³
      
      const dragForce = speed * speed * dragCoefficient * frontalArea * airDensity;
      const dragDirection = velocity.clone().scale(-1 / speed);
      
      this.carBody.applyForce(dragDirection.scale(dragForce), this.carBody.position);
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