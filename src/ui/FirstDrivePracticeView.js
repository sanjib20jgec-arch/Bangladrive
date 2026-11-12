const LABELS = Object.freeze({
  steer: 'ঘোরান / Steer', brake: 'ব্রেক / Brake', drift: 'ড্রিফট / Drift', nitro: 'নাইট্রো / Nitro', checkpoint: 'গেট / Gate',
});

export class FirstDrivePracticeView {
  constructor(root, skip, onClose = () => {}) {
    this.root = root;
    this.onClose = onClose;
    root.innerHTML = `<section id="practice-panel" class="practice-panel hidden" aria-label="চালনা অনুশীলন / Driving practice">
      <div class="practice-body"><strong>অনুশীলন / Practice</strong>
      <p id="practice-message" role="status" aria-live="polite"></p>
      <ul id="practice-steps"></ul></div>
      <button id="practice-skip" type="button">ছাড়ুন / Skip</button>
    </section>`;
    this.panel = root.querySelector('#practice-panel');
    this.message = root.querySelector('#practice-message');
    this.steps = root.querySelector('#practice-steps');
    this.button = root.querySelector('#practice-skip');
    this.button.addEventListener('click', () => { if (this.active) skip(); else this.close(); });
  }
  render(progress, status) {
    this.active = status === 'active';
    this.panel.classList.remove('hidden');
    this.message.textContent = this.active ? 'পুরস্কার নেই / No rewards'
      : status === 'completed' ? 'অনুশীলন সম্পন্ন; আগের জায়গায় ফিরেছেন। / Practice complete; returned to your previous location.'
        : 'অনুশীলন বন্ধ; আগের জায়গায় ফিরেছেন। / Practice skipped; returned to your previous location.';
    this.steps.innerHTML = Object.entries(LABELS).map(([key, label]) => `<li>${progress[key] ? '✓' : '○'} ${label}</li>`).join('');
    this.button.textContent = this.active ? 'ছাড়ুন / Skip' : 'বন্ধ করুন / Close';
  }
  close() { this.panel.classList.add('hidden'); this.onClose(); }
}
