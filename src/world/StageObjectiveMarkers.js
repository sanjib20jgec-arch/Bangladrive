import * as THREE from 'three';
import { RELAY_RULES, RESCUE_RULES } from '../core/ModeTargets.js';

const SPECS = Object.freeze({
  Rescue: Object.freeze({ id: 'chand-bazaar-rescue', name: 'Chand Bazaar Rescue', rule: RESCUE_RULES, items: 'pickupDistances' }),
  'Drone Delivery': Object.freeze({ id: 'shapla-ghat-relay', name: 'Shapla Ghat Relay', rule: RELAY_RULES, items: 'relayDistances' }),
});

export class StageObjectiveMarkers {
  constructor(scene) {
    this.scene = scene;
    this.group = null;
    this.mode = null;
    this.pickups = [];
    this.crateGeometry = new THREE.BoxGeometry(1, .8, .8);
    this.baseGeometry = new THREE.CylinderGeometry(1.8, 2, .22, 16);
    this.ringGeometry = new THREE.TorusGeometry(1.5, .1, 6, 20);
    this.antennaGeometry = new THREE.CylinderGeometry(.12, .18, 2.8, 8);
    this.signalGeometry = new THREE.SphereGeometry(.55, 10, 8);
    this.postGeometry = new THREE.BoxGeometry(.28, 3, .28);
    this.barGeometry = new THREE.BoxGeometry(7, .28, .3);
    this.pickupMaterial = new THREE.MeshStandardMaterial({ color: '#e8b64a', emissive: '#4b2d08', roughness: .55 });
    this.baseMaterial = new THREE.MeshStandardMaterial({ color: '#315a5d', emissive: '#123335', roughness: .45 });
    this.ringMaterial = new THREE.MeshBasicMaterial({ color: '#49e8d2', transparent: true, opacity: .82, side: THREE.DoubleSide });
    this.relayMaterial = new THREE.MeshStandardMaterial({ color: '#69bfff', emissive: '#164875', roughness: .4 });
    this.gateMaterial = new THREE.MeshStandardMaterial({ color: '#6be0c1', emissive: '#174b43', roughness: .4 });
  }

  update(session, player) {
    const spec = session?.active ? SPECS[session.mode] : null;
    if (!spec) {
      this.clear();
      return;
    }
    if (this.group && this.mode !== session.mode) this.clear();
    if (!this.group) this.create(session.startZ ?? player.z, session.mode, spec);
    const currentIndex = session.mode === 'Rescue' ? session.pickupIndex : session.relayIndex;
    for (let i = 0; i < this.pickups.length; i++) this.pickups[i].visible = i >= currentIndex;
  }

  create(startZ, mode, spec) {
    this.mode = mode;
    this.group = new THREE.Group();
    this.group.name = `${spec.id}-objectives`;
    this.pickups.length = 0;
    spec.rule[spec.items].forEach((distance, index) => {
      const marker = new THREE.Group();
      marker.name = `${spec.id}-point-${index + 1}`;
      marker.position.set(index === 1 ? 2 : index === 0 ? -2 : 0, 0, startZ - distance);
      const base = new THREE.Mesh(this.baseGeometry, this.baseMaterial);
      base.position.y = .12;
      const ring = new THREE.Mesh(this.ringGeometry, this.ringMaterial);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = .28;
      marker.add(base, ring);
      if (mode === 'Rescue') {
        const crate = new THREE.Mesh(this.crateGeometry, this.pickupMaterial);
        crate.position.y = .72;
        crate.castShadow = true;
        marker.add(crate);
      } else {
        const antenna = new THREE.Mesh(this.antennaGeometry, this.relayMaterial);
        antenna.position.y = 1.7;
        const signal = new THREE.Mesh(this.signalGeometry, this.relayMaterial);
        signal.position.y = 3.5;
        marker.add(antenna, signal);
      }
      this.group.add(marker);
      this.pickups.push(marker);
    });

    const destination = new THREE.Group();
    destination.name = `${spec.id}-safe-dropoff`;
    destination.position.set(0, 0, startZ - spec.rule.distance);
    for (const x of [-3.5, 3.5]) {
      const post = new THREE.Mesh(this.postGeometry, this.gateMaterial);
      post.position.set(x, 1.5, 0);
      destination.add(post);
    }
    const bar = new THREE.Mesh(this.barGeometry, this.gateMaterial);
    bar.position.y = 3;
    destination.add(bar);
    this.group.add(destination);
    this.scene.add(this.group);
  }

  clear() {
    if (this.group) this.scene.remove(this.group);
    this.group = null;
    this.mode = null;
    this.pickups.length = 0;
  }

  dispose() {
    this.clear();
    for (const geometry of [this.crateGeometry, this.baseGeometry, this.ringGeometry, this.antennaGeometry, this.signalGeometry, this.postGeometry, this.barGeometry]) geometry.dispose();
    for (const material of [this.pickupMaterial, this.baseMaterial, this.ringMaterial, this.relayMaterial, this.gateMaterial]) material.dispose();
  }
}
