import { QueryFilterFlags } from '@dimforge/rapier3d-compat';

// Rapier's character controller sweeps the actual vehicle collider and slides along obstacles.
// Keep input/output scratch objects stable across fixed steps.
export class VehicleCollision {
  constructor(world, collider) {
    this.world = world;
    this.collider = collider;
    this.controller = world.createCharacterController(.05);
    this.desired = { x: 0, y: 0, z: 0 };
    this.movement = { x: 0, z: 0 };
    this.rotationPosition = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0, w: 1 };
    this.shape = collider.shape;
    this.body = collider.parent();
  }

  rotationClear(x, y, z, yaw) {
    this.rotationPosition.x = x; this.rotationPosition.y = y; this.rotationPosition.z = z;
    this.rotation.y = Math.sin(yaw * .5); this.rotation.w = Math.cos(yaw * .5);
    return !this.world.intersectionWithShape(this.rotationPosition, this.rotation, this.shape,
      QueryFilterFlags.EXCLUDE_SENSORS, undefined, this.collider, this.body);
  }

  move(dx, dz) {
    this.desired.x = dx;
    this.desired.z = dz;
    this.controller.computeColliderMovement(this.collider, this.desired);
    const resolved = this.controller.computedMovement();
    this.movement.x = resolved.x;
    this.movement.z = resolved.z;
    return this.movement;
  }

  dispose() {
    this.world.removeCharacterController(this.controller);
  }
}
