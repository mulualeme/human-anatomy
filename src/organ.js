export class Organ {
  constructor({ id, name, system, functionText, description, center, vertices, fillA, fillB, alpha = 1 }) {
    this.id = id;
    this.name = name;
    this.system = system;
    this.functionText = functionText;
    this.description = description;
    this.center = center;
    this.vertices = vertices;
    this.fillA = fillA;
    this.fillB = fillB;
    this.alpha = alpha;

    this.baseScale = [1, 1];
    this.dynamicScale = [1, 1];
    this.rotation = 0;
    this.highlight = 0;
    this.visible = true;
  }

  setPulse(scaleX, scaleY) {
    this.dynamicScale[0] = scaleX;
    this.dynamicScale[1] = scaleY;
  }

  setHighlight(value) {
    this.highlight = Math.max(0, Math.min(1, value));
  }

  containsPoint(point) {
    const [px, py] = point;
    let inside = false;
    const verts = this.vertices;
    for (let i = 0, j = verts.length - 2; i < verts.length; i += 2) {
      const xi = verts[i] * this.baseScale[0] * this.dynamicScale[0] + this.center[0];
      const yi = verts[i + 1] * this.baseScale[1] * this.dynamicScale[1] + this.center[1];
      const xj = verts[j] * this.baseScale[0] * this.dynamicScale[0] + this.center[0];
      const yj = verts[j + 1] * this.baseScale[1] * this.dynamicScale[1] + this.center[1];

      const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-6) + xi;
      if (intersect) inside = !inside;
      j = i;
    }
    return inside;
  }
}

export const anatomyShapes = {
  bodyOutline: [
    -0.08, 0.82, -0.14, 0.72, -0.17, 0.62, -0.19, 0.46, -0.2, 0.34, -0.19, 0.15, -0.18, -0.02,
    -0.17, -0.18, -0.19, -0.38, -0.22, -0.6, -0.2, -0.84, -0.14, -0.9, -0.08, -0.88, -0.05, -0.65,
    -0.02, -0.38, 0.02, -0.38, 0.05, -0.65, 0.08, -0.88, 0.14, -0.9, 0.2, -0.84, 0.22, -0.6,
    0.19, -0.38, 0.17, -0.18, 0.18, -0.02, 0.19, 0.15, 0.2, 0.34, 0.19, 0.46, 0.17, 0.62,
    0.14, 0.72, 0.08, 0.82, 0, 0.88,
  ],
  heart: [
    0, 0.11, -0.03, 0.15, -0.09, 0.17, -0.14, 0.14, -0.17, 0.09, -0.17, 0.02, -0.13, -0.04,
    -0.08, -0.09, -0.02, -0.15, 0, -0.19, 0.02, -0.15, 0.08, -0.09, 0.13, -0.04, 0.17, 0.02,
    0.17, 0.09, 0.14, 0.14, 0.09, 0.17, 0.03, 0.15,
  ],
  lungLeft: [
    -0.02, 0.24, -0.14, 0.2, -0.18, 0.09, -0.17, -0.04, -0.14, -0.15, -0.07, -0.2, -0.01, -0.18,
    0.01, -0.06, 0.01, 0.05,
  ],
  lungRight: [
    0.02, 0.24, 0.14, 0.2, 0.18, 0.09, 0.17, -0.04, 0.14, -0.15, 0.07, -0.2, 0.01, -0.18,
    -0.01, -0.06, -0.01, 0.05,
  ],
};
