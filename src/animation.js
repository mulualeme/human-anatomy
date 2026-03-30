export class Animator {
  constructor() {
    this.last = performance.now();
    this.time = 0;
  }

  tick() {
    const now = performance.now();
    const dt = (now - this.last) / 1000;
    this.last = now;
    this.time += dt;
    return { dt, time: this.time };
  }

  pulse(ratePerMin, time, amplitude = 0.08) {
    const hz = ratePerMin / 60;
    return 1 + Math.sin(time * Math.PI * 2 * hz) * amplitude;
  }
}
