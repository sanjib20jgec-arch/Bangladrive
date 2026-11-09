import { EventBus } from './EventBus.js';

export class ComboSystem {
  constructor() {
    this.points = 0; this.multiplier = 1; this.timer = 0; this.peak = 1;
    this._off = EventBus.on('styleAction', ({ points = 100 } = {}) => this.add(points));
  }
  add(points) {
    this.timer = 3.5;
    this.points += Math.round(points * this.multiplier);
    this.multiplier = this.points >= 1800 ? 5 : this.points >= 900 ? 3 : this.points >= 300 ? 2 : 1;
    this.peak = Math.max(this.peak, this.multiplier);
    EventBus.emit('comboChanged', this.snapshot());
  }
  update(dt) {
    if (this.timer > 0 && (this.timer -= dt) <= 0) {
      this.multiplier = 1; this.points = 0;
      EventBus.emit('comboChanged', this.snapshot());
    }
  }
  snapshot() { const label = this.multiplier === 5 ? 'BANGLA OVERDRIVE' : this.multiplier === 3 ? 'FATAFATI' : this.multiplier === 2 ? 'JOME GECHE' : ''; return { points: this.points, multiplier: this.multiplier, label, timer: this.timer }; }
  dispose() { this._off(); }
}
