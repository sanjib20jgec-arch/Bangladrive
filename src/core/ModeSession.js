import { EventBus } from './EventBus.js';
import { DELIVERY_RULES, MODE_TARGETS, RELAY_RULES, RESCUE_RULES } from './ModeTargets.js';

const medalRank = { none: 0, bronze: 1, silver: 2, gold: 3 };

export function medalForScore(mode, score) {
  const targets = MODE_TARGETS[mode];
  if (!targets || !Number.isFinite(score)) return 'none';
  if (mode === 'Time Trial') {
    return score <= targets.gold ? 'gold' : score <= targets.silver ? 'silver' : score <= targets.bronze ? 'bronze' : 'none';
  }
  return score >= targets.gold ? 'gold' : score >= targets.silver ? 'silver' : score >= targets.bronze ? 'bronze' : 'none';
}

export class ModeSession {
  constructor(profile) {
    this.profile = profile;
    this.state = {
      mode: 'Free Roam', active: false, elapsed: 0, score: 0, integrity: 100, heat: 0,
      lastX: 0, lastZ: 0, startX: 0, startZ: 0, justStarted: false, distance: 0, checkpoints: 0,
      pickupIndex: 0, rescued: 0, relayIndex: 0, relaysActivated: 0, terminal: false, outcome: null, reason: null, lastResult: null,
    };
    this._off = [
      EventBus.on('modeSelected', ({ mode }) => this.start(mode)),
      EventBus.on('modeFinished', ({ mode, score }) => this.finish(mode, score)),
    ];
  }

  start(mode) {
    if (!MODE_TARGETS[mode]) return false;
    this.state.mode = mode;
    this.state.active = true;
    this.state.elapsed = 0;
    this.state.score = 0;
    this.state.integrity = 100;
    this.state.heat = 0;
    this.state.lastX = 0;
    this.state.lastZ = 0;
    this.state.justStarted = true;
    this.state.distance = 0;
    this.state.checkpoints = 0;
    this.state.pickupIndex = 0;
    this.state.rescued = 0;
    this.state.relayIndex = 0;
    this.state.relaysActivated = 0;
    this.state.terminal = false;
    this.state.outcome = null;
    this.state.reason = null;
    this.state.lastResult = null;
    EventBus.emit('modeStarted', { mode });
    return true;
  }

  update(dt, player) {
    if (!this.state.active || !Number.isFinite(dt) || dt <= 0) return;
    if (this.state.justStarted) {
      this.state.lastX = player.x;
      this.state.lastZ = player.z;
      this.state.startX = player.x;
      this.state.startZ = player.z;
      this.state.justStarted = false;
    }
    this.state.elapsed += dt;

    if (this.state.mode === 'Delivery') {
      this.updateDelivery(dt, player);
      return;
    }
    if (this.state.mode === 'Rescue') {
      this.updateRescue(dt, player);
      return;
    }
    if (this.state.mode === 'Drone Delivery') {
      this.updateRelay(dt, player);
      return;
    }

    if (this.state.mode === 'Escape') this.state.heat = Math.min(3, Math.max(0, Math.floor((player.speedKmh - 45) / 28) + 1));
    if (this.state.mode === 'Escape' || this.state.mode === 'Time Trial') this.state.score = this.state.elapsed;
    else if (this.state.mode === 'No Damage') this.state.score = this.state.integrity;
    else this.state.score = Math.round(player.style || 0);
  }

  updateDelivery(dt, player) {
    // Route runs toward negative world Z; ignore reversing and sideways movement.
    const speed = Number.isFinite(player.vz)
      ? Math.max(0, -player.vz)
      : Math.max(0, Number.isFinite(player.speed) ? player.speed : Number.isFinite(player.speedKmh) ? player.speedKmh / 3.6 : 0);
    this.state.distance += speed * dt;
    this.state.score = Math.round(this.state.distance * this.state.integrity / 100);

    const maxCheckpoints = Math.ceil(DELIVERY_RULES.distance / DELIVERY_RULES.checkpointDistance);
    while (this.state.checkpoints < maxCheckpoints && this.state.distance >= (this.state.checkpoints + 1) * DELIVERY_RULES.checkpointDistance) {
      this.state.checkpoints++;
      EventBus.emit('deliveryCheckpoint', {
        checkpoint: this.state.checkpoints,
        total: maxCheckpoints,
        distance: this.state.distance,
      });
    }

    if (this.state.integrity <= 0) {
      this.endDelivery('failure', 'cargo-damaged');
    } else if (this.state.distance >= DELIVERY_RULES.distance) {
      this.endDelivery('success', 'destination-reached');
    } else if (this.state.elapsed >= DELIVERY_RULES.timeLimit) {
      if (this.state.distance >= DELIVERY_RULES.minimumDistance) this.endDelivery('success', 'time-limit');
      else this.endDelivery('failure', 'time-expired');
    }
  }

  updateRescue(dt, player) {
    // Rescue follows the same forward road, but parcels are only recovered if the car stays in the marked lane.
    const speed = Number.isFinite(player.vz)
      ? Math.max(0, -player.vz)
      : Math.max(0, Number.isFinite(player.speed) ? player.speed : Number.isFinite(player.speedKmh) ? player.speedKmh / 3.6 : 0);
    this.state.distance += speed * dt;
    while (this.state.pickupIndex < RESCUE_RULES.pickupDistances.length && this.state.distance >= RESCUE_RULES.pickupDistances[this.state.pickupIndex]) {
      const index = this.state.pickupIndex++;
      const saved = Number.isFinite(player.x) && Math.abs(player.x) <= RESCUE_RULES.laneLimit;
      if (saved) this.state.rescued++;
      this.state.checkpoints = this.state.pickupIndex;
      EventBus.emit('rescueParcel', { index: index + 1, total: RESCUE_RULES.pickupDistances.length, saved, rescued: this.state.rescued });
    }
    this.state.score = this.state.rescued;

    if (this.state.integrity <= 0) {
      this.endObjective('Rescue', 'failure', 'cargo-damaged');
    } else if (this.state.distance >= RESCUE_RULES.distance) {
      const outcome = this.state.rescued >= RESCUE_RULES.minimumRescues ? 'success' : 'failure';
      this.endObjective('Rescue', outcome, outcome === 'success' ? 'safe-dropoff' : 'no-parcels-recovered');
    } else if (this.state.elapsed >= RESCUE_RULES.timeLimit) {
      this.endObjective('Rescue', 'failure', 'time-expired');
    }
  }

  updateRelay(dt, player) {
    const speed = Number.isFinite(player.vz)
      ? Math.max(0, -player.vz)
      : Math.max(0, Number.isFinite(player.speed) ? player.speed : Number.isFinite(player.speedKmh) ? player.speedKmh / 3.6 : 0);
    this.state.distance += speed * dt;
    while (this.state.relayIndex < RELAY_RULES.relayDistances.length && this.state.distance >= RELAY_RULES.relayDistances[this.state.relayIndex]) {
      const index = this.state.relayIndex++;
      const activated = Number.isFinite(player.x) && Math.abs(player.x) <= RELAY_RULES.laneLimit;
      if (activated) this.state.relaysActivated++;
      this.state.checkpoints = this.state.relayIndex;
      EventBus.emit('droneRelay', { index: index + 1, total: RELAY_RULES.relayDistances.length, activated, relaysActivated: this.state.relaysActivated });
    }
    this.state.score = this.relayScore();

    if (this.state.integrity <= 0) {
      this.endObjective('Drone Delivery', 'failure', 'kit-damaged');
    } else if (this.state.distance >= RELAY_RULES.distance) {
      const outcome = this.state.relaysActivated >= RELAY_RULES.minimumRelays ? 'success' : 'failure';
      this.endObjective('Drone Delivery', outcome, outcome === 'success' ? 'relay-dropoff' : 'insufficient-relays');
    } else if (this.state.elapsed >= RELAY_RULES.timeLimit) {
      this.endObjective('Drone Delivery', 'failure', 'time-expired');
    }
  }

  relayScore() {
    return this.state.relaysActivated * RELAY_RULES.relayScore
      + Math.round(RELAY_RULES.integrityBonus * this.state.integrity / 100);
  }

  endObjective(mode, outcome, reason) {
    this.state.terminal = true;
    this.state.outcome = outcome;
    this.state.reason = reason;
    this.state.score = mode === 'Rescue' ? this.state.rescued
      : mode === 'Drone Delivery' ? this.relayScore()
        : this.state.score;
    this.finish(mode, this.state.score);
  }

  endDelivery(outcome, reason) {
    this.state.terminal = true;
    this.state.outcome = outcome;
    this.state.reason = reason;
    this.state.score = Math.round(this.state.distance * this.state.integrity / 100);
    this.finish('Delivery', this.state.score);
  }

  damage(amount) {
    if (!this.state.active || !Number.isFinite(amount) || amount <= 0) return false;
    if (this.state.mode !== 'Delivery' && this.state.mode !== 'Rescue' && this.state.mode !== 'Drone Delivery' && this.state.mode !== 'No Damage') return false;
    this.state.integrity = Math.max(0, this.state.integrity - amount);
    if (this.state.mode === 'Delivery' && this.state.integrity <= 0) this.endDelivery('failure', 'cargo-damaged');
    if (this.state.mode === 'Rescue' && this.state.integrity <= 0) this.endObjective('Rescue', 'failure', 'cargo-damaged');
    if (this.state.mode === 'Drone Delivery' && this.state.integrity <= 0) this.endObjective('Drone Delivery', 'failure', 'kit-damaged');
    return true;
  }

  finish(mode = this.state.mode, score = this.state.score) {
    if (!this.state.active || mode !== this.state.mode) return 'none';
    if (['Delivery', 'Rescue', 'Drone Delivery'].includes(mode) && !this.state.terminal) return 'none';
    const finalScore = mode === 'Delivery' ? this.state.score : score;
    if (!Number.isFinite(finalScore)) return 'none';
    this.state.active = false;
    this.state.justStarted = false;
    // Failed objectives may have accumulated points; they must never earn a medal or reward.
    const medal = this.state.outcome === 'failure' ? 'none' : medalForScore(mode, finalScore);
    const old = this.profile.data.modeMedals[mode] || 'none';
    const newBest = medalRank[medal] > medalRank[old];
    if (newBest) this.profile.data.modeMedals[mode] = medal;
    this.profile.save();
    this.state.lastResult = {
      mode,
      score: finalScore,
      medal,
      newBest,
      outcome: this.state.outcome || (medal === 'none' ? 'incomplete' : 'success'),
      reason: this.state.reason,
    };
    EventBus.emit('modeResult', this.state.lastResult);
    return medal;
  }

  cancel(reason = 'aborted') {
    if (!this.state.active) return false;
    const { mode, elapsed, score } = this.state;
    this.state.active = false;
    this.state.justStarted = false;
    EventBus.emit('modeCancelled', { mode, elapsed, score, reason });
    return true;
  }

  dispose() { this._off.forEach(off => off()); }
}
