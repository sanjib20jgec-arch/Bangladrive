const ACTIONS = Object.freeze(['left', 'right', 'throttle', 'brake', 'handbrake', 'nitro']);

// Each physical input owns a separate source; releasing one must not release another.
export class DrivingInput {
  constructor() {
    this.values = { left: 0, right: 0, throttle: 0, brake: 0, handbrake: 0, nitro: 0 };
    this.sources = new Map();
  }

  set(source, action, value) {
    if (typeof source !== 'string' || !ACTIONS.includes(action) || !Number.isFinite(value)) return false;
    const bounded = action === 'left' ? Math.max(-1, Math.min(0, value)) : Math.max(0, Math.min(1, value));
    if (bounded === 0) this.sources.delete(source);
    else this.sources.set(source, { action, value: bounded });
    this.refresh();
    return true;
  }

  release(source) {
    if (this.sources.delete(source)) this.refresh();
  }

  clear() {
    this.sources.clear();
    for (const action of ACTIONS) this.values[action] = 0;
  }

  refresh() {
    for (const action of ACTIONS) this.values[action] = 0;
    for (const entry of this.sources.values()) {
      const current = this.values[entry.action];
      if (Math.abs(entry.value) > Math.abs(current)) this.values[entry.action] = entry.value;
    }
  }
}
