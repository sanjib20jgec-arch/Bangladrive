import { Cuboid, QueryFilterFlags } from '@dimforge/rapier3d-compat';

// Known road positions, away from world edges. Every candidate is checked before use.
const CANDIDATES = Object.freeze([8, 20, 32, 44].flatMap(z => [0, -4, 4].map(x => Object.freeze({ x, y: 1.1, z }))));
const UPRIGHT = Object.freeze({ x: 0, y: 0, z: 0, w: 1 });

export class VehicleRecovery {
  constructor(world, body, collider, state, session, drift, clearInput, props = []) {
    Object.assign(this, { world, body, collider, state, session, drift, clearInput, props });
    // A small margin makes a recovered vehicle less likely to start touching an obstacle.
    this.clearance = new Cuboid(.96, .58, 1.85);
  }

  findPosition() {
    for (const candidate of CANDIDATES) {
      const blocked = this.world.intersectionWithShape(candidate, UPRIGHT, this.clearance,
        QueryFilterFlags.EXCLUDE_SENSORS, undefined, this.collider, this.body);
      if (blocked) continue;
      // Scatter props have no Rapier collider, but can still trigger damage/score.
      if (this.props.some(p => !p.active && Math.abs(p.x - candidate.x) < 1.5 && Math.abs(p.z - candidate.z) < 2.1)) continue;
      return candidate;
    }
    return null;
  }

  recover() {
    const position = this.findPosition();
    if (!position) return false; // Do not cancel a run or move the car if no safe slot exists.
    this.clearInput();
    if (this.session.state.active) this.session.cancel('vehicle-recovery');
    this.drift.reset();
    Object.assign(this.state, { x: position.x, y: position.y, z: position.z, vx: 0, vy: 0, vz: 0, yaw: 0, speed: 0, speedKmh: 0, steer: 0, handbrake: false, drifting: false, boost: 1 });
    this.body.setTranslation(position, true);
    this.body.setNextKinematicTranslation(position);
    this.body.setRotation(UPRIGHT, true);
    this.body.setNextKinematicRotation(UPRIGHT);
    return true;
  }
}
