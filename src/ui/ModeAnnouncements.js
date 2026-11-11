import { EventBus } from '../core/EventBus.js';
import { modeResultText } from './ModeResultText.js';

// Event-based announcements avoid repeatedly reading the rapidly changing HUD.
export class ModeAnnouncements {
  constructor(root) {
    this.root = root;
    root.setAttribute('role', 'status'); root.setAttribute('aria-live', 'polite'); root.setAttribute('aria-atomic', 'true');
    this.unsubs = [
      EventBus.on('modeStarted', ({mode}) => this.show(`${mode} বেছে নেওয়া হয়েছে। মেনু বন্ধ করলে চলবে। / ${mode} selected. Close menus to resume.`)),
      EventBus.on('modeCancelled', ({mode}) => this.show(`${mode} বাতিল; মিশনের পুরস্কার নেই। / ${mode} cancelled; no mission reward.`)),
      EventBus.on('modeResult', result => this.show(modeResultText(result))),
      EventBus.on('deliveryCheckpoint', ({checkpoint,total}) => this.show(`ডেলিভারি চেকপয়েন্ট ${checkpoint}/${total} / Delivery checkpoint ${checkpoint} of ${total}.`)),
      EventBus.on('rescueParcel', ({index,total,saved}) => this.show(saved ? `পার্সেল ${index}/${total} সংগ্রহ। / Parcel ${index} of ${total} collected.` : `পার্সেল ${index}/${total} মিস। / Parcel ${index} of ${total} missed.`)),
      EventBus.on('droneRelay', ({index,total,activated}) => this.show(activated ? `রিলে ${index}/${total} চালু। / Relay ${index} of ${total} activated.` : `রিলে ${index}/${total} মিস। / Relay ${index} of ${total} missed.`)),
    ];
  }
  show(text) { this.root.textContent = text; }
  dispose() { this.unsubs.forEach(off => off()); }
}
