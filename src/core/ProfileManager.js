import { EventBus } from './EventBus.js';
import { MODE_TARGETS } from './ModeTargets.js';
import {
  CONTROL_MODES, CONTRACTS, HUD_SIZES, LIVERIES, MAX_RESPECT_XP, MAX_TAKA, MODE_MEDALS, MOTION_MODES,
  PROFILE_SCHEMA_VERSION, QUALITY_MODES, UPGRADES, VEHICLES,
} from './ProfileCatalog.js';

const KEY = 'bangladrive_save_v6';
const today = () => new Date().toISOString().slice(0, 10);
const defaults = () => ({
  version: PROFILE_SCHEMA_VERSION,
  taka: 0,
  respectXP: 0,
  unlockedVehicles: ['holud-taxi'],
  vehicleUpgrades: {},
  selectedVehicle: 'holud-taxi',
  selectedLivery: 'holud',
  modeMedals: {},
  settings: { quality: 'auto', controls: 'split', driftAssist: true, haptics: true, voice: true, motion: 'system', hudSize: 'standard' },
  daily: { date: today(), progress: {}, claimed: {} },
});

const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const boundedInteger = (value, min, max, fallback = min) =>
  typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(min, Math.floor(value)))
    : fallback;
const validDate = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

function normalizeProfile(saved) {
  const base = defaults();
  if (!isRecord(saved) || ![6, PROFILE_SCHEMA_VERSION].includes(saved.version)) return base;

  // v6 -> v7 is a validation/defaulting migration. Only known IDs and fields survive.
  const source = saved;
  const knownVehicles = new Set(VEHICLES.map(item => item.id));
  const unlocked = Array.isArray(source.unlockedVehicles)
    ? [...new Set(source.unlockedVehicles.filter(id => knownVehicles.has(id)))]
    : [];
  if (!unlocked.includes('holud-taxi')) unlocked.unshift('holud-taxi');

  const vehicleUpgrades = {};
  if (isRecord(source.vehicleUpgrades)) {
    for (const { id, maxLevel } of UPGRADES) {
      const level = boundedInteger(source.vehicleUpgrades[id], 0, maxLevel, 0);
      if (level > 0) vehicleUpgrades[id] = level;
    }
  }

  const settings = isRecord(source.settings) ? source.settings : {};
  const modeMedals = {};
  if (isRecord(source.modeMedals)) {
    for (const mode of Object.keys(MODE_TARGETS)) {
      if (MODE_MEDALS.includes(source.modeMedals[mode])) modeMedals[mode] = source.modeMedals[mode];
    }
  }

  const dailySource = isRecord(source.daily) ? source.daily : {};
  const dailyDate = validDate(dailySource.date) ? dailySource.date : '';
  const daily = { date: dailyDate, progress: {}, claimed: {} };
  if (dailyDate === today()) {
    for (const { id, target } of CONTRACTS) {
      const rawProgress = isRecord(dailySource.progress) ? dailySource.progress[id] : 0;
      const progress = boundedInteger(rawProgress, 0, target, 0);
      daily.progress[id] = progress;
      const rawClaimed = isRecord(dailySource.claimed) ? dailySource.claimed[id] : false;
      daily.claimed[id] = rawClaimed === true && progress >= target;
    }
  } else {
    Object.assign(daily, { date: today() });
  }

  const selected = knownVehicles.has(source.selectedVehicle) && unlocked.includes(source.selectedVehicle)
    ? source.selectedVehicle
    : 'holud-taxi';
  const validLiveries = new Set(LIVERIES.map(item => item.id));

  return {
    version: PROFILE_SCHEMA_VERSION,
    taka: boundedInteger(source.taka, 0, MAX_TAKA, 0),
    respectXP: boundedInteger(source.respectXP, 0, MAX_RESPECT_XP, 0),
    unlockedVehicles: unlocked,
    vehicleUpgrades,
    selectedVehicle: selected,
    selectedLivery: validLiveries.has(source.selectedLivery) ? source.selectedLivery : 'holud',
    modeMedals,
    settings: {
      quality: QUALITY_MODES.includes(settings.quality) ? settings.quality : base.settings.quality,
      controls: CONTROL_MODES.includes(settings.controls) ? settings.controls : base.settings.controls,
      driftAssist: typeof settings.driftAssist === 'boolean' ? settings.driftAssist : base.settings.driftAssist,
      haptics: typeof settings.haptics === 'boolean' ? settings.haptics : base.settings.haptics,
      voice: typeof settings.voice === 'boolean' ? settings.voice : base.settings.voice,
      motion: MOTION_MODES.includes(settings.motion) ? settings.motion : base.settings.motion,
      hudSize: HUD_SIZES.includes(settings.hudSize) ? settings.hudSize : base.settings.hudSize,
    },
    daily,
  };
}

export class ProfileManager {
  constructor(storage) {
    if (storage === undefined) {
      try { storage = globalThis.localStorage; } catch { storage = undefined; }
    }
    this.storage = storage;
    this.saveState = 'ok';
    this.lastRaw = null;
    let saved = null;
    try {
      if (!storage || typeof storage.getItem !== 'function') throw new Error('Storage unavailable');
      this.lastRaw = storage.getItem(KEY);
      if (this.lastRaw !== null) {
        try { saved = JSON.parse(this.lastRaw); } catch { this.saveState = 'protected'; }
        if (!isRecord(saved) || ![6, PROFILE_SCHEMA_VERSION].includes(saved.version)) this.saveState = 'protected';
      }
    } catch { this.saveState = 'unavailable'; }
    this.protectedSave = this.saveState === 'protected';
    this.data = normalizeProfile(saved);
    if (saved?.version === 6 && this.saveState === 'ok') this.save();
  }

  refresh() { this.data = normalizeProfile(this.data); return this.data; }

  setSaveState(state) {
    if (this.saveState !== state) { this.saveState = state; EventBus.emit('profileSaveStateChanged', state); }
  }

  save() {
    this.refresh();
    if (this.protectedSave || this.saveState === 'changed') return false;
    const value = JSON.stringify(this.data);
    try {
      if (!this.storage || typeof this.storage.getItem !== 'function' || typeof this.storage.setItem !== 'function') throw new Error('Storage unavailable');
      if (this.storage.getItem(KEY) !== this.lastRaw) { this.setSaveState('changed'); return false; }
      this.storage.setItem(KEY, value);
      this.lastRaw = value;
      this.setSaveState('ok');
    } catch { this.setSaveState('unavailable'); return false; }
    try { globalThis.__nativeBridge?.persistProfile?.(value); } catch { /* native mirroring is best-effort */ }
    return true;
  }

  // Explicit user action only: replace the protected entry with this session's profile.
  // Refuse if another tab changed the underlying entry since it was read.
  replaceProtectedSave() {
    if (!this.protectedSave || this.saveState === 'changed') return false;
    try {
      if (!this.storage || this.storage.getItem(KEY) !== this.lastRaw) { this.setSaveState('changed'); return false; }
      const value = JSON.stringify(normalizeProfile(this.data));
      this.storage.setItem(KEY, value);
      this.lastRaw = value;
      this.protectedSave = false;
      this.setSaveState('ok');
      try { globalThis.__nativeBridge?.persistProfile?.(value); } catch { /* best effort */ }
      return true;
    } catch { this.setSaveState('unavailable'); return false; }
  }

  addTaka(amount) {
    if (!Number.isFinite(amount) || amount <= 0) return false;
    this.refresh();
    const increment = Math.round(amount);
    if (increment < 1) return false;
    this.data.taka = Math.min(MAX_TAKA, this.data.taka + increment);
    this.save();
    EventBus.emit('profileChanged', { taka: this.data.taka });
    return true;
  }

  purchase(upgrade) {
    this.refresh();
    const item = UPGRADES.find(entry => entry.id === upgrade);
    if (!item) return false;
    const level = this.data.vehicleUpgrades[upgrade] || 0;
    if (level >= item.maxLevel) return false;
    const cost = item.baseCost * (level + 1);
    if (this.data.taka < cost) return false;
    this.data.taka -= cost;
    this.data.vehicleUpgrades[upgrade] = level + 1;
    this.save();
    return true;
  }

  unlockVehicle(id) {
    this.refresh();
    const item = VEHICLES.find(entry => entry.id === id);
    if (!item || this.data.unlockedVehicles.includes(id) || this.data.taka < item.cost) return false;
    this.data.taka -= item.cost;
    this.data.unlockedVehicles.push(id);
    this.data.selectedVehicle = id;
    this.save();
    return true;
  }

  selectVehicle(id) {
    this.refresh();
    if (!VEHICLES.some(item => item.id === id) || !this.data.unlockedVehicles.includes(id)) return false;
    this.data.selectedVehicle = id;
    this.save();
    return true;
  }

  setLivery(id) {
    this.refresh();
    if (!LIVERIES.some(item => item.id === id)) return false;
    this.data.selectedLivery = id;
    this.save();
    return true;
  }

  progressContract(id, amount = 1) {
    this.refresh();
    const contract = CONTRACTS.find(item => item.id === id);
    if (!contract || !Number.isFinite(amount) || !Number.isInteger(amount) || amount <= 0) return false;
    const previous = this.data.daily.progress[id] || 0;
    this.data.daily.progress[id] = Math.min(contract.target, previous + amount);
    this.save();
    return true;
  }

  claimContract(id) {
    this.refresh();
    const contract = CONTRACTS.find(item => item.id === id);
    if (!contract || this.data.daily.claimed[id] || (this.data.daily.progress[id] || 0) < contract.target) return false;
    this.data.daily.claimed[id] = true;
    this.data.taka = Math.min(MAX_TAKA, this.data.taka + contract.reward);
    this.save();
    return true;
  }

  setSetting(key, value) {
    const valid = key === 'quality' ? QUALITY_MODES.includes(value)
      : key === 'controls' ? CONTROL_MODES.includes(value)
        : key === 'motion' ? MOTION_MODES.includes(value)
        : key === 'hudSize' ? HUD_SIZES.includes(value)
        : (key === 'driftAssist' || key === 'haptics' || key === 'voice') && typeof value === 'boolean';
    if (!valid) return false;
    this.refresh();
    this.data.settings[key] = value;
    this.save();
    return true;
  }

  static get storageKey() { return KEY; }
}
