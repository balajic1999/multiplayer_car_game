import * as CANNON from 'cannon-es';
import { CAR_STATS, CarType, DifficultyLevel, DIFFICULTY_SETTINGS } from '../../../shared/types/index';

export interface CarControls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
}

export class CarController {
  private body: CANNON.Body;
  private carType: CarType;
  private difficulty: DifficultyLevel;
  private controls: CarControls;
  
  constructor(body: CANNON.Body, carType: CarType, difficulty: DifficultyLevel) {
    this.body = body;
    this.carType = carType;
    this.difficulty = difficulty;
    this.controls = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      brake: false
    };
  }

  setControls(controls: Partial<CarControls>): void {
    this.controls = { ...this.controls, ...controls };
  }

  update(): void {
    const stats = CAR_STATS[this.carType];
    const difficultySettings = DIFFICULTY_SETTINGS[this.difficulty];
    
    const maxSpeed = (stats.speed / 3.6) * difficultySettings.physicsRealism;
    const acceleration = stats.acceleration * 5 * difficultySettings.physicsRealism;
    const turnSpeed = stats.handling * 0.02;
    
    const forward = new CANNON.Vec3();
    this.body.quaternion.vmult(new CANNON.Vec3(0, 0, -1), forward);
    
    const right = new CANNON.Vec3();
    this.body.quaternion.vmult(new CANNON.Vec3(1, 0, 0), right);
    
    const currentSpeed = this.body.velocity.length();
    
    if (this.controls.forward && currentSpeed < maxSpeed) {
      const force = forward.scale(acceleration * this.body.mass);
      this.body.applyForce(force, this.body.position);
    }
    
    if (this.controls.backward) {
      if (currentSpeed > 0.1) {
        const brakeForce = forward.scale(acceleration * this.body.mass * 0.5);
        this.body.applyForce(brakeForce, this.body.position);
      } else {
        const reverseForce = forward.scale(-acceleration * 0.5 * this.body.mass);
        this.body.applyForce(reverseForce, this.body.position);
      }
    }
    
    if (this.controls.brake) {
      this.body.velocity.scale(0.95, this.body.velocity);
      this.body.angularVelocity.scale(0.9, this.body.angularVelocity);
    }
    
    if (currentSpeed > 0.5) {
      if (this.controls.left) {
        const torque = new CANNON.Vec3(0, turnSpeed * currentSpeed, 0);
        this.body.angularVelocity.vadd(torque, this.body.angularVelocity);
      }
      
      if (this.controls.right) {
        const torque = new CANNON.Vec3(0, -turnSpeed * currentSpeed, 0);
        this.body.angularVelocity.vadd(torque, this.body.angularVelocity);
      }
    }
    
    this.body.velocity.y = Math.max(this.body.velocity.y, -20);
  }

  reset(position: CANNON.Vec3, rotation: number = 0): void {
    this.body.position.copy(position);
    this.body.quaternion.setFromEuler(0, rotation, 0);
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
  }

  getSpeed(): number {
    return this.body.velocity.length() * 3.6;
  }
}
