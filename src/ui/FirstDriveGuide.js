const GUIDE_KEY = 'bangladrive_first_drive_guide_v1';

// A separate, optional UI preference: failure to access storage never blocks play.
export class GuidePreference {
  constructor(storage) { this.storage = storage; }
  dismissed() {
    try { return this.storage?.getItem(GUIDE_KEY) === '1'; } catch { return false; }
  }
  dismiss() {
    try { this.storage?.setItem(GUIDE_KEY, '1'); return !!this.storage; } catch { return false; }
  }
}

export class FirstDriveGuide {
  constructor(root, storage, onDismiss = () => {}) {
    this.root = root;
    this.preference = new GuidePreference(storage);
    this.onDismiss = onDismiss;
    this.root.innerHTML = `<section id="first-drive-guide" class="first-drive-guide hidden" aria-label="প্রথম চালনার নির্দেশনা / First drive guide">
      <div><strong>প্রথম চালনা / First drive</strong>
      <p>GO চালান, ◀ ▶ দিয়ে ঘোরান, BRAKE দিয়ে থামুন বা পেছান। কীবোর্ড: W/↑, A D/← →, S/↓।</p>
      <p lang="en">Drive with GO or W/↑; steer with ◀ ▶ or A/D; brake or reverse with BRAKE or S/↓.</p>
      <p>GARAGE → মোড ও মেডেল → Delivery বেছে Garage বন্ধ করুন। Garage বন্ধ করে খেলা চালু হলে সময় শুরু: 45 সেকেন্ডে অন্তত 250m; লক্ষ্য 600m।</p>
      <p lang="en">Choose GARAGE → Modes → Delivery, then close Garage. The timer starts when play resumes: reach at least 250m in 45 seconds; aim for 600m.</p></div>
      <div class="guide-actions"><button id="guide-practice" type="button">অনুশীলন / Practice</button><button id="guide-dismiss" type="button">এখন নয় / Skip</button></div>
      <p id="guide-status" role="status" aria-live="polite"></p>
    </section>`;
    this.panel = this.root.querySelector('#first-drive-guide');
    this.root.querySelector('#guide-dismiss').addEventListener('click', () => this.dismiss());
    if (!this.preference.dismissed()) this.show();
  }
  get open() { return !this.panel.classList.contains('hidden'); }
  show() { this.panel.classList.remove('hidden'); }
  dismiss() { this.panel.classList.add('hidden'); this.preference.dismiss(); this.onDismiss(); }
}
