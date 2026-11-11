// Transient notices share the combo display, then restore the latest combo snapshot.
// Time advances only on simulation ticks, so pausing cannot dismiss a notice.
export class ComboHud {
  constructor(element, initialSnapshot, duration = 2.2) {
    this.element = element; this.snapshot = initialSnapshot; this.duration = duration; this.remaining = 0;
  }
  show(text) {
    this.remaining = this.duration;
    this.element.textContent = text;
    this.element.classList.add('active');
  }
  setCombo(snapshot) {
    this.snapshot = snapshot;
    if (this.remaining <= 0) this.renderCombo();
  }
  renderCombo() {
    const { multiplier, label, points } = this.snapshot;
    this.element.textContent = `${multiplier}× ${label || 'STYLE'} · ${points}`;
  }
  update(dt) {
    if (this.remaining <= 0) return;
    this.remaining = Math.max(0, this.remaining - dt);
    if (this.remaining === 0) { this.element.classList.remove('active'); this.renderCombo(); }
  }
}
