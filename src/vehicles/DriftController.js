import { EventBus } from '../core/EventBus.js';

const TIERS = [
  { time: 1, torque: 1.15, seconds: 0.8, nitro: 0, color: '#43bfff' },
  { time: 2.2, torque: 1.3, seconds: 1.3, nitro: 0.10, color: '#ff8a32' },
  { time: 3.8, torque: 1.5, seconds: 2, nitro: 0.25, color: '#ffc844' },
];
export class DriftController {
  constructor() { this.reset(); }
  reset() { this.duration = 0; this.boostTime = 0; this.boostMultiplier = 1; this.tier = 0; this.slip = 0; }
  update(dt, lateral, forward, handbrake, nitroMax = 100) {
    this.slip = Math.atan2(Math.abs(lateral), Math.max(0.5, Math.abs(forward)));
    const drifting = this.slip > 0.28 && Math.abs(forward) > 3;
    if (drifting) {
      this.duration += dt;
      const tier = this.duration >= 3.8 ? 3 : this.duration >= 2.2 ? 2 : this.duration >= 1 ? 1 : 0;
      if (tier > this.tier) { this.tier = tier; EventBus.emit('driftTier', { tier, color: TIERS[tier - 1].color }); }
    } else if (this.duration > 0) {
      const tierData = TIERS[this.tier - 1];
      if (tierData) {
        this.boostTime = tierData.seconds; this.boostMultiplier = tierData.torque;
        EventBus.emit('driftBoost', { tier: this.tier, multiplier: tierData.torque, duration: tierData.seconds, nitro: tierData.nitro * nitroMax });
      }
      this.duration = 0; this.tier = 0;
    }
    this.boostTime = Math.max(0, this.boostTime - dt);
    if (this.boostTime === 0) this.boostMultiplier = 1;
    return drifting || (handbrake && Math.abs(forward) > 5);
  }
}
