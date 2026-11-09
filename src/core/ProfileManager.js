import { EventBus } from './EventBus.js';
const KEY = 'bangladrive_save_v6';
const today = () => new Date().toISOString().slice(0, 10);
const defaults = () => ({ version: 6, taka: 0, respectXP: 0, unlockedVehicles: ['holud-taxi'], vehicleUpgrades: {}, selectedVehicle: 'holud-taxi', selectedLivery: 'holud', modeMedals: {}, settings: { quality: 'auto', controls: 'split', driftAssist: true, haptics: true }, daily: { date: today(), progress: {}, claimed: {} } });
export class ProfileManager {
  constructor(storage = globalThis.localStorage) {
    this.storage = storage; this.data = defaults();
    try {
      const saved = JSON.parse(storage?.getItem(KEY) || 'null');
      if (saved?.version === 6) { const base=defaults(); this.data = { ...base, ...saved, settings: { ...base.settings, ...saved.settings }, daily: { ...base.daily, ...saved.daily, progress: { ...base.daily.progress, ...saved.daily?.progress }, claimed: { ...base.daily.claimed, ...saved.daily?.claimed } } }; }
    } catch { /* recover from malformed local save */ }
    if (this.data.daily.date !== today()) this.data.daily = { date: today(), progress: {}, claimed: {} };
  }
  save() { const value=JSON.stringify(this.data);let ok=false;try{this.storage?.setItem(KEY,value);ok=true;}catch{/* local cache may be unavailable */}globalThis.__nativeBridge?.persistProfile?.(value);return ok; }
  addTaka(amount) { this.data.taka = Math.max(0, this.data.taka + Math.round(amount)); this.save(); EventBus.emit('profileChanged',{taka:this.data.taka}); }
  purchase(upgrade, cost) {
    if (this.data.taka < cost) return false;
    const level = this.data.vehicleUpgrades[upgrade] || 0;
    if (level >= 5) return false;
    this.data.taka -= cost; this.data.vehicleUpgrades[upgrade] = level + 1; this.save(); return true;
  }
  unlockVehicle(id,cost){if(this.data.unlockedVehicles.includes(id))return false;if(this.data.taka<cost)return false;this.data.taka-=cost;this.data.unlockedVehicles.push(id);this.data.selectedVehicle=id;this.save();return true;}
  selectVehicle(id){if(!this.data.unlockedVehicles.includes(id))return false;this.data.selectedVehicle=id;this.save();return true;}
  setLivery(id){this.data.selectedLivery=id;this.save();}
  progressContract(id,amount=1){this.data.daily.progress[id]=(this.data.daily.progress[id]||0)+amount;this.save();}
  claimContract(id,target,reward){if(this.data.daily.claimed[id]||(this.data.daily.progress[id]||0)<target)return false;this.data.daily.claimed[id]=true;this.data.taka+=reward;this.save();return true;}
  setSetting(key, value) { this.data.settings[key] = value; this.save(); }
  static get storageKey() { return KEY; }
}
