import { EventBus } from '../core/EventBus.js';
export class NearMissSystem {
  constructor() { this.cooldowns = new Map(); }
  update(dt, player, entities, speedKmh) {
    for (const [id, left] of this.cooldowns) { const n = left - dt; if (n <= 0) this.cooldowns.delete(id); else this.cooldowns.set(id, n); }
    if (speedKmh <= 50) return 0;
    let hits = 0;
    for (const entity of entities) {
      if (this.cooldowns.has(entity.id)) continue;
      const dx = entity.x - player.x, dz = entity.z - player.z;
      if (Math.abs(dz) < 2.8 && Math.abs(dx) < 1.5 + (entity.radius || 0.5)) {
        this.cooldowns.set(entity.id, 0.8); hits++;
        EventBus.emit('nearMiss', { id: entity.id, speedKmh, style: 150, nitro: 12 });
      }
    }
    return hits;
  }
}
