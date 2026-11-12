import { EventBus } from '../core/EventBus.js';

// Conservative, best-effort mirror; Preferences has no compare-and-swap transaction.
export class ProfileMirror {
  constructor(preferences, key) {
    this.preferences = preferences; this.key = key; this.state = 'initializing';
    this.expected = null; this.queue = Promise.resolve();
  }
  setState(state) {
    if (this.state !== state) { this.state = state; EventBus.emit('nativeMirrorStateChanged', state); }
  }
  async initialize(storage) {
    try {
      if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') throw Error('Local storage unavailable');
      const { value } = await this.preferences.get({ key: this.key });
      if (value !== null && typeof value !== 'string') throw Error('Unexpected native value');
      const local = storage.getItem(this.key);
      if (local === null && value !== null) {
        storage.setItem(this.key, value); // Preserve even unsupported data for ProfileManager to protect.
      } else if (local !== null && value !== null && local !== value) {
        this.setState('conflict'); return;
      }
      this.expected = value;
      this.setState('ready');
    } catch { this.setState('unavailable'); }
  }
  persist(value) {
    // Serialize rapid saves so delayed plugin calls cannot reorder older and newer snapshots.
    this.queue = this.queue.then(async () => {
      if (this.state !== 'ready') return false;
      try {
        const current = (await this.preferences.get({ key: this.key })).value;
        if (current !== this.expected) { this.setState('conflict'); return false; }
        await this.preferences.set({ key: this.key, value });
        this.expected = value;
        return true;
      } catch { this.setState('unavailable'); return false; }
    });
    return this.queue;
  }
}
