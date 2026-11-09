import { EventBus } from '../core/EventBus.js';

export class QualityManager {
  constructor(renderer, { mobile = /Android|iPhone|iPad/i.test(navigator.userAgent) } = {}) {
    this.renderer = renderer; this.mobile = mobile; this.mode = 'auto'; this.scale = mobile ? 0.85 : 1;
    this.samples = new Float32Array(90); this.index = 0; this.count = 0; this.avgMs = 16.7;
    this.overMs = 0; this.underMs = 0; this.cooldown = 0; this.tier = 'high';
    this.apply();
  }
  tierForScale() {
    if(this.mode==='low'||this.scale<=.7)return 'low';
    if(this.mode==='medium'||this.scale<.95)return 'medium';
    if(this.mode==='ultra'||this.scale>1.04)return 'ultra';
    return 'high';
  }
  apply() {
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, this.mobile ? 1.5 : 2) * this.scale);
    const tier=this.tierForScale();if(tier!==this.tier){this.tier=tier;EventBus.emit('qualityTierChanged',{tier,scale:this.scale,averageMs:this.avgMs});}
  }
  setMode(mode) {
    this.mode = mode;
    this.scale = mode === 'low' ? 0.65 : mode === 'medium' ? 0.8 : mode === 'high' ? .95 : mode === 'ultra' ? (this.mobile ? 0.98 : 1.08) : Math.min(1, this.mobile ? 0.85 : 1);
    this.apply();
  }
  sample(ms, dt) {
    this.samples[this.index] = ms; this.index = (this.index + 1) % this.samples.length; this.count = Math.min(this.count + 1, this.samples.length);
    let sum = 0; for (let i = 0; i < this.count; i++) sum += this.samples[i]; this.avgMs = sum / this.count;
    this.cooldown = Math.max(0, this.cooldown - dt);
    if (this.mode !== 'auto') return;
    this.overMs = this.avgMs > 18.5 ? this.overMs + dt : 0;
    this.underMs = this.avgMs < 13.5 ? this.underMs + dt : 0;
    if (this.cooldown === 0 && this.overMs >= 2 && this.scale > 0.65) { this.scale = Math.max(0.65, this.scale - 0.1); this.overMs = 0; this.cooldown = 3; this.apply(); }
    else if (this.cooldown === 0 && this.underMs >= 5 && this.scale < 1) { this.scale = Math.min(1, this.scale + 0.1); this.underMs = 0; this.cooldown = 5; this.apply(); }
  }
}
