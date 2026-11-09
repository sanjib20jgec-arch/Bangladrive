import { EventBus } from '../core/EventBus.js';
const LINE = { nearMiss: 'আরে বাপরে! চুল-চেরা পাস!', driftTier: 'বাংলা ওভারড্রাইভ! রাস্তা কাঁপছে!', cowHit: 'গরুকে ধাক্কা?! ইউনিয়ন কিন্তু কড়া!', nitro: 'নাইট্রো দাও, ভাই!', bossPhase: 'বাপি নতুন চাল দিচ্ছে! সাবধান!', bossTelegraph: 'শকওয়েভ আসছে—সাইড দিন!', bossDefeated: 'বাপির বুলডোজার থামল! বাহ!', missionWin: 'কাজ ফতে! চা-টা এবার তোমার!', missionFail: 'আরে, এই খেপটা গেল! আবার চেষ্টা করো!', chaosGain: 'বাজারে ধুমধাড়াক্কা! সামলে ভাই!' };
export class CommentaryDirector {
  constructor(root,nativeBridge=null) {
    this.root = root; this.nativeBridge=nativeBridge; this.cooldown = 0; this.queue = [];
    this.unsubs = Object.entries(LINE).map(([event, text]) => EventBus.on(event, payload => this.enqueue({ text, priority: ['bossPhase','bossTelegraph','bossDefeated','missionWin','missionFail'].includes(event) ? 3 : event === 'nearMiss' || event === 'driftTier' ? 2 : 1, event, payload })));
  }
  enqueue(item) { this.queue.push(item); this.queue.sort((a, b) => b.priority - a.priority); }
  update(dt) {
    this.cooldown = Math.max(0, this.cooldown - dt);
    if (!this.cooldown && this.queue.length) {
      const item = this.queue.shift(); this.root.textContent = item.text; this.root.classList.add('show'); this.cooldown = 4.5; this.nativeBridge?.speak(item.text);
      clearTimeout(this.hideTimer); this.hideTimer = setTimeout(() => this.root.classList.remove('show'), 2200);
    }
  }
  dispose() { this.unsubs.forEach(off => off()); clearTimeout(this.hideTimer); }
}
