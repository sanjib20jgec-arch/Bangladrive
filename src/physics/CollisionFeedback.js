// Detect significant lost translation, not a physical impact magnitude.
// A held obstruction produces one cue, then clears after motion is unobstructed.
export class CollisionFeedback {
  constructor() { this.active = false; this.clearTime = 0; }
  update(dt, desiredX, desiredZ, actualX, actualZ) {
    const requested = Math.hypot(desiredX, desiredZ);
    const lost = Math.hypot(desiredX - actualX, desiredZ - actualZ);
    const blocked = requested >= .01 && lost >= .008 && lost >= requested * .35;
    if (blocked) { this.active = true; this.clearTime = 0; }
    else if (this.active) {
      this.clearTime += dt;
      if (this.clearTime >= 1) { this.active = false; this.clearTime = 0; }
    }
    return this.active;
  }
  reset() { this.active = false; this.clearTime = 0; }
}
