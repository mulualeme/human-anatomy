export class ParticleSystem {
  constructor({ color = [1, 0.2, 0.2], size = 0.009, speed = 0.2, count = 120, jitter = 0.01 }) {
    this.color = color;
    this.size = size;
    this.speed = speed;
    this.count = count;
    this.jitter = jitter;
    this.path = [];
    this.particles = [];
  }

  setPath(path) {
    this.path = path;
    this.particles = Array.from({ length: this.count }, (_, i) => ({
      t: i / this.count,
      phase: Math.random(),
    }));
  }

  samplePath(t) {
    if (this.path.length < 2) return [0, 0];
    const loopT = ((t % 1) + 1) % 1;
    const f = loopT * (this.path.length - 1);
    const idx = Math.floor(f);
    const next = (idx + 1) % this.path.length;
    const local = f - idx;
    const a = this.path[idx];
    const b = this.path[next];
    return [a[0] + (b[0] - a[0]) * local, a[1] + (b[1] - a[1]) * local];
  }

  update(dt) {
    for (const p of this.particles) p.t = (p.t + dt * this.speed) % 1;
  }

  buildVertexData(timeSec) {
    const verts = [];
    for (const p of this.particles) {
      const [x, y] = this.samplePath(p.t);
      const wobble = Math.sin((p.phase + timeSec) * 4.2) * this.jitter;
      verts.push(x + wobble * 0.35, y + wobble, this.size);
    }
    return new Float32Array(verts);
  }
}
