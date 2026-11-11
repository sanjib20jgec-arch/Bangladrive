import * as THREE from 'three';

// A short, isolated practice strip at the beginning of the existing road.
// It has no mode result, rewards, save state or scoring.
export class FirstDrivePractice {
  constructor(scene, state, body, modeSession, drift, clearInput, onChange) {
    Object.assign(this, { scene, state, body, modeSession, drift, clearInput, onChange });
    this.active = false;
    this.progress = { steer: false, brake: false, drift: false, nitro: false, checkpoint: false };
    this.position = { x: 0, y: 1.1, z: 48 };
    this.rotation = { x: 0, y: 0, z: 0, w: 1 };
    this.marker = new THREE.Group();
    this.marker.name = 'first-drive-practice-checkpoint';
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: '#62efd1' });
    for (const x of [-3.5, 3.5]) {
      const post = new THREE.Mesh(geometry, material); post.position.set(x, 1.5, 20); post.scale.set(.3, 3, .3); this.marker.add(post);
    }
    const bar = new THREE.Mesh(geometry, material); bar.position.set(0, 3, 20); bar.scale.set(7.3, .3, .3); this.marker.add(bar);
    this.geometry = geometry; this.material = material;
  }

  start() {
    if (this.active || this.modeSession.state.active) return false;
    // Return to the same free-roam location afterwards, but safely at rest.
    this.saved = { x: this.state.x, y: this.state.y, z: this.state.z, yaw: this.state.yaw, nitro: this.state.nitro };
    for (const key of Object.keys(this.progress)) this.progress[key] = false;
    this.clearInput(); this.drift.reset();
    Object.assign(this.state, { x: 0, y: 1.1, z: 48, yaw: 0, vx: 0, vy: 0, vz: 0, speed: 0, speedKmh: 0, steer: 0, handbrake: false, drifting: false, boost: 1 });
    this.body.setTranslation(this.position, true); this.body.setNextKinematicTranslation(this.position);
    this.body.setRotation(this.rotation, true); this.body.setNextKinematicRotation(this.rotation);
    this.scene.add(this.marker); this.active = true; this.onChange(this.progress, 'active');
    return true;
  }

  update(input) {
    if (!this.active) return;
    let changed = false;
    if (!this.progress.steer && Math.abs(input.left + input.right) > .2) { this.progress.steer = true; changed = true; }
    if (!this.progress.brake && input.brake > 0) { this.progress.brake = true; changed = true; }
    if (!this.progress.drift && input.handbrake > 0) { this.progress.drift = true; changed = true; }
    if (!this.progress.nitro && input.nitro > 0) { this.progress.nitro = true; changed = true; }
    if (!this.progress.checkpoint && this.state.z <= 20 && Math.abs(this.state.x) <= 7) { this.progress.checkpoint = true; changed = true; }
    if (!changed) return;
    if (Object.values(this.progress).every(Boolean)) this.finish('completed');
    else this.onChange(this.progress, 'active');
  }

  finish(reason = 'skipped') {
    if (!this.active) return false;
    this.active = false; this.scene.remove(this.marker); this.clearInput(); this.drift.reset();
    const saved = this.saved;
    Object.assign(this.state, { x: saved.x, y: saved.y, z: saved.z, yaw: saved.yaw, nitro: saved.nitro, vx: 0, vy: 0, vz: 0, speed: 0, speedKmh: 0, steer: 0, handbrake: false, drifting: false, boost: 1 });
    this.position.x = saved.x; this.position.y = saved.y; this.position.z = saved.z;
    this.rotation.y = Math.sin(saved.yaw * .5); this.rotation.w = Math.cos(saved.yaw * .5);
    this.body.setTranslation(this.position, true); this.body.setNextKinematicTranslation(this.position);
    this.body.setRotation(this.rotation, true); this.body.setNextKinematicRotation(this.rotation);
    this.position.x = 0; this.position.y = 1.1; this.position.z = 48; this.rotation.y = 0; this.rotation.w = 1;
    this.onChange(this.progress, reason);
    return true;
  }

  dispose() { this.scene.remove(this.marker); this.geometry.dispose(); this.material.dispose(); }
}
