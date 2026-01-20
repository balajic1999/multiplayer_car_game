import * as CANNON from 'cannon-es';

export function createPhysicsWorld(): CANNON.World {
  const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0)
  });
  
  world.broadphase = new CANNON.SAPBroadphase(world);
  
  return world;
}

export function createGroundBody(): CANNON.Body {
  const groundShape = new CANNON.Plane();
  const groundBody = new CANNON.Body({
    mass: 0,
    shape: groundShape,
    material: new CANNON.Material({ friction: 0.3, restitution: 0.3 })
  });
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  
  return groundBody;
}

export function createBoxBody(
  width: number,
  height: number,
  depth: number,
  mass: number = 0
): CANNON.Body {
  const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
  const body = new CANNON.Body({
    mass,
    shape,
    material: new CANNON.Material({ friction: 0.3, restitution: 0.3 })
  });
  
  return body;
}

export function createCarBody(mass: number = 1000): CANNON.Body {
  const carShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2));
  const carBody = new CANNON.Body({
    mass,
    shape: carShape,
    position: new CANNON.Vec3(0, 2, 0),
    material: new CANNON.Material({ friction: 0.1, restitution: 0.1 })
  });
  
  carBody.linearDamping = 0.05;
  carBody.angularDamping = 0.5;
  
  return carBody;
}
