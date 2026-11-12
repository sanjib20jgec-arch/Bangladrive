import { formatFrameReport } from '../render/FrameDiagnostics.js';

export class FrameDiagnosticsUI {
  constructor(root, diagnostics, renderer, quality) {
    this.root = root; this.diagnostics = diagnostics; this.renderer = renderer; this.quality = quality;
    root.innerHTML = `<details class="frame-diagnostics"><summary>পারফরম্যান্স পরীক্ষা / Performance check</summary>
      <p>শুরু করুন, Settings বন্ধ করে প্রায় ৩০ সেকেন্ড চালান; তারপর ফিরে এসে থামান। বিরতির সময় বাদ যায়।</p>
      <p lang="en">Start, close Settings, drive for about 30 seconds, then return and stop. Paused time is excluded.</p>
      <p>তথ্য শুধু এই সেশনে থাকে; নিজে শেয়ার না করলে পাঠানো হয় না। / In-memory only; nothing is uploaded automatically.</p>
      <label for="diagnostics-device">ফোনের মডেল / Device model (optional)</label>
      <input id="diagnostics-device" type="text" maxlength="64" autocomplete="off" placeholder="Model only; no personal details">
      <div class="diagnostics-actions"><button id="diagnostics-start" type="button">শুরু / Start</button><button id="diagnostics-stop" type="button" disabled>থামান / Stop</button><button id="diagnostics-discard" type="button">মুছুন / Discard</button></div>
      <p id="diagnostics-status" role="status" aria-live="polite"></p>
      <label for="diagnostics-report">রিপোর্ট নিজে কপি করুন / Copy report manually</label>
      <textarea id="diagnostics-report" rows="7" readonly spellcheck="false"></textarea>
    </details>`;
    this.device = root.querySelector('#diagnostics-device'); this.status = root.querySelector('#diagnostics-status');
    this.report = root.querySelector('#diagnostics-report'); this.startButton = root.querySelector('#diagnostics-start');
    this.stopButton = root.querySelector('#diagnostics-stop');
    this.startButton.addEventListener('click', () => this.start());
    this.stopButton.addEventListener('click', () => this.stop());
    root.querySelector('#diagnostics-discard').addEventListener('click', () => this.discard());
  }
  start() {
    this.diagnostics.start(); this.report.value = ''; this.startButton.disabled = true; this.stopButton.disabled = false;
    this.status.textContent = 'চলছে—Settings বন্ধ করে চালান। / Recording—close Settings and drive.';
  }
  stop() {
    const stats = this.diagnostics.stop(); this.startButton.disabled = false; this.stopButton.disabled = true;
    if (!stats) { this.status.textContent = 'কোনো frame পাওয়া যায়নি। / No frames sampled; try again.'; return; }
    const canvas = this.renderer.domElement;
    this.report.value = formatFrameReport(stats, { device: this.device.value,
      viewport: `${globalThis.innerWidth}×${globalThis.innerHeight}`,
      renderSize: `${canvas.width}×${canvas.height}`, quality: `${this.quality.mode} / ${this.quality.tier}` });
    this.status.textContent = 'শেষ—রিপোর্ট নিচে। / Stopped—report below.';
  }
  discard() {
    this.diagnostics.running = false; this.diagnostics.reset(); this.report.value = ''; this.device.value = '';
    this.startButton.disabled = false; this.stopButton.disabled = true;
    this.status.textContent = 'তথ্য মুছে ফেলা হয়েছে। / Data discarded.';
  }
}
