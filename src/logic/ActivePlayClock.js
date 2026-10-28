export class ActivePlayClock {
  constructor(now = () => performance.now()) {
    this.now = now;
    this.accumulatedMs = 0;
    this.segmentStartedAt = this.now();
    this.pauseReasons = new Set();
  }

  restore(elapsedMs = 0) {
    this.accumulatedMs = Math.max(0, Number(elapsedMs) || 0);
    this.segmentStartedAt = this.now();
    this.pauseReasons.clear();
    return this;
  }

  pause(reason = 'manual') {
    if (!this.pauseReasons.size) this.accumulatedMs += Math.max(0, this.now() - this.segmentStartedAt);
    this.pauseReasons.add(reason);
    return this.elapsedMs;
  }

  resume(reason = 'manual') {
    const wasPaused = this.pauseReasons.size > 0;
    const removed = this.pauseReasons.delete(reason);
    if (wasPaused && removed && !this.pauseReasons.size) this.segmentStartedAt = this.now();
    return this.elapsedMs;
  }

  get elapsedMs() {
    return Math.max(0, this.accumulatedMs + (this.pauseReasons.size ? 0 : this.now() - this.segmentStartedAt));
  }

  get paused() { return this.pauseReasons.size > 0; }
}
