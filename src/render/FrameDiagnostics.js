// Opt-in, bounded, in-memory frame-interval sampling. Nothing is stored or sent.
export class FrameDiagnostics {
  constructor(capacity = 1800) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new RangeError('Invalid sample capacity');
    this.samples = new Float64Array(capacity);
    this.running = false;
    this.reset();
  }
  reset() {
    this.index = 0; this.count = 0; this.totalFrames = 0; this.totalMs = 0;
    this.maxCalls = 0; this.maxTriangles = 0; this.wasPaused = true;
  }
  start() { this.reset(); this.running = true; }
  observeFrame(intervalMs, paused, drawCalls, triangles) {
    if (!this.running) return;
    if (paused) { this.wasPaused = true; return; }
    if (this.wasPaused) { this.wasPaused = false; return; } // Skip the interval spanning a pause.
    if (!Number.isFinite(intervalMs) || intervalMs <= 0) return;
    this.samples[this.index] = intervalMs;
    this.index = (this.index + 1) % this.samples.length;
    this.count = Math.min(this.count + 1, this.samples.length);
    this.totalFrames++; this.totalMs += intervalMs;
    if (Number.isFinite(drawCalls) && drawCalls >= 0) this.maxCalls = Math.max(this.maxCalls, drawCalls);
    if (Number.isFinite(triangles) && triangles >= 0) this.maxTriangles = Math.max(this.maxTriangles, triangles);
  }
  stop() {
    this.running = false;
    if (!this.count) return null;
    const values = this.samples.slice(0, this.count).sort();
    let sum = 0; for (const value of values) sum += value;
    const percentile = p => values[Math.ceil(p * values.length) - 1];
    return { count: this.count, capacity: this.samples.length, totalFrames: this.totalFrames,
      totalSeconds: this.totalMs / 1000, p50: percentile(.5), p95: percentile(.95),
      meanFps: 1000 * values.length / sum, maxCalls: this.maxCalls, maxTriangles: this.maxTriangles };
  }
}

export function formatFrameReport(stats, { device = '', viewport = '', renderSize = '', quality = '' } = {}) {
  if (!stats) return '';
  const label = String(device).replace(/[\r\n]+/g, ' ').trim().slice(0, 64) || 'Not supplied';
  return `Bangladrive — local performance check\nDevice (entered by tester): ${label}\nViewport / render pixels: ${viewport} / ${renderSize}\nQuality at end (auto may change): ${quality}\nForeground sampling: ${stats.totalSeconds.toFixed(1)} s, ${stats.totalFrames} frames total\nRecent frame interval window: ${stats.count} of up to ${stats.capacity} frames\nFrame interval P50: ${stats.p50.toFixed(2)} ms; P95: ${stats.p95.toFixed(2)} ms\nMean frame rate in window: ${stats.meanFps.toFixed(1)} fps\nPeak draw calls / rendered triangles per frame (whole capture): ${stats.maxCalls} / ${stats.maxTriangles}\nIntervals are browser requestAnimationFrame timings, not GPU timings. Paused frames and first frame after pause are excluded.\nTotal asset polygon count, JS/GPU/native memory, thermal, battery and device compatibility were not measured.\nThis report stays on this device unless you choose to share it.`;
}
