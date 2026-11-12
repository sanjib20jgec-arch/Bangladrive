// One set of reusable vectors keeps application scratch allocations out of fixed steps.
export class RoadActorMotion {
  constructor(actors, playerShape = null) {
    this.actors = actors;
    this.playerShape = playerShape;
    this.translation = { x: 0, y: 0, z: 0 };
    this.origin = { x: 0, y: 0, z: 0 };
    this.delta = { x: 0, y: 0, z: 0 };
    this.end = { x: 0, y: 0, z: 0 };
    this.identity = { x: 0, y: 0, z: 0, w: 1 };
    for (const actor of actors) actor.motionShape = actor.collider?.shape || null;
  }

  conflictsWithPlayer(actor, dx, dz, path) {
    if (!path || !this.playerShape || !actor.motionShape) return false;
    // Conservative broad phase avoids WASM shape casts for actors far from the car.
    const radius = (actor.type === 'traffic' ? 2 : 1.2) + 2.1;
    if (Math.abs(actor.x - path.start.x) > radius + Math.abs(dx) + Math.abs(path.delta.x)
      || Math.abs(actor.z - path.start.z) > radius + Math.abs(dz) + Math.abs(path.delta.z)) return false;
    this.origin.x = actor.x; this.origin.y = actor.y; this.origin.z = actor.z;
    this.delta.x = dx; this.delta.z = dz;
    this.end.x = actor.x + dx; this.end.y = actor.y; this.end.z = actor.z + dz;
    // Cast both translations together. If they could meet, hold the actor at its
    // old position: the player's own sweep has already accounted for that position.
    const hit = actor.motionShape.castShape(this.origin, this.identity, this.delta,
      this.playerShape, path.start, path.startRotation, path.delta, .05, 1, false);
    if (hit) return true;
    // The cast is linear at the starting orientation; also check the final yaw.
    return actor.motionShape.intersectsShape(this.end, this.identity,
      this.playerShape, path.end, path.endRotation);
  }

  update(dt, player, now, path = null) {
    for (const actor of this.actors) {
      let dx = 0, dz = 0;
      if (actor.type === 'traffic' && actor.yieldUntil > now) {
        dx = (actor.x > player.x ? 1 : -1) * dt * 1.8;
      } else if (actor.type === 'cow') {
        if (actor.scatterUntil > now) dx = (actor.x >= 0 ? 1 : -1) * dt * 2.1;
        else if (actor.chargeUntil > now) {
          dx = (player.x > actor.x ? 1 : -1) * dt * 2.4;
          dz = dt * 3;
        }
      }
      if ((!dx && !dz) || this.conflictsWithPlayer(actor, dx, dz, path)) continue;
      actor.x += dx; actor.z += dz;
      actor.mesh.position.set(actor.x, actor.y, actor.z);
      this.translation.x = actor.x; this.translation.y = actor.y; this.translation.z = actor.z;
      // Set before world.step() so Rapier and the visual occupy the same position.
      actor.body.setNextKinematicTranslation(this.translation);
    }
  }
}
