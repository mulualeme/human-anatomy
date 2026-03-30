import { Renderer, createTransform } from './renderer.js';
import { Organ, anatomyShapes } from './organ.js';
import { ParticleSystem } from './particleSystem.js';
import { Animator } from './animation.js';
import { UIController } from './ui.js';

const canvas = document.getElementById('gl-canvas');
const renderer = new Renderer(canvas);
const animator = new Animator();
const ui = new UIController();

const modelIdentity = createTransform({ translate: [0, 0], rotate: 0, scale: [1, 1] });

const organs = [
  new Organ({
    id: 'heart',
    name: 'Heart',
    system: 'circulatory',
    functionText: 'Pumps oxygenated and deoxygenated blood through systemic and pulmonary loops.',
    description: 'A muscular four-chambered pump that contracts rhythmically to maintain blood circulation.',
    center: [0, 0.08],
    vertices: anatomyShapes.heart,
    fillA: [0.8, 0.2, 0.26, 0.9],
    fillB: [0.5, 0.05, 0.09, 0.95],
  }),
  new Organ({
    id: 'left-lung',
    name: 'Left Lung',
    system: 'respiratory',
    functionText: 'Performs gas exchange by delivering oxygen to the blood and expelling carbon dioxide.',
    description: 'Spongy lobed organ that expands and contracts with each breathing cycle.',
    center: [-0.12, 0.18],
    vertices: anatomyShapes.lungLeft,
    fillA: [0.67, 0.33, 0.46, 0.82],
    fillB: [0.4, 0.15, 0.26, 0.92],
  }),
  new Organ({
    id: 'right-lung',
    name: 'Right Lung',
    system: 'respiratory',
    functionText: 'Performs gas exchange through bronchi and alveoli.',
    description: 'A larger multi-lobed lung supporting oxygen diffusion into pulmonary capillaries.',
    center: [0.12, 0.18],
    vertices: anatomyShapes.lungRight,
    fillA: [0.67, 0.33, 0.46, 0.82],
    fillB: [0.4, 0.15, 0.26, 0.92],
  }),
];

const body = {
  vertices: anatomyShapes.bodyOutline,
  fillA: [0.75, 0.62, 0.56, 0.16],
  fillB: [0.93, 0.82, 0.76, 0.26],
};

const vesselPath = [
  [0, 0.1], [0.07, 0.24], [0.16, 0.28], [0.22, 0.2], [0.2, 0.04], [0.14, -0.18], [0.11, -0.42],
  [0.09, -0.68], [0, -0.8], [-0.09, -0.68], [-0.11, -0.42], [-0.14, -0.18], [-0.2, 0.04], [-0.22, 0.2],
  [-0.16, 0.28], [-0.07, 0.24], [0, 0.1],
];

const nervePath = [
  [0, 0.75], [0, 0.62], [0.02, 0.44], [0.06, 0.22], [0.08, 0.02], [0.07, -0.2], [0.04, -0.38],
  [0, -0.56], [-0.04, -0.38], [-0.07, -0.2], [-0.08, 0.02], [-0.06, 0.22], [-0.02, 0.44], [0, 0.62],
];

const bloodFlow = new ParticleSystem({ color: [0.9, 0.12, 0.15], size: 0.008, speed: 0.14, count: 160, jitter: 0.015 });
bloodFlow.setPath(vesselPath);

const deoxygenatedFlow = new ParticleSystem({ color: [0.45, 0.07, 0.12], size: 0.008, speed: 0.12, count: 120, jitter: 0.013 });
deoxygenatedFlow.setPath(vesselPath.slice().reverse());

const oxygenFlow = new ParticleSystem({ color: [0.49, 0.89, 1.0], size: 0.006, speed: 0.09, count: 90, jitter: 0.008 });
oxygenFlow.setPath([
  [-0.16, 0.24], [-0.11, 0.2], [-0.05, 0.16], [0, 0.11], [0.05, 0.16], [0.11, 0.2], [0.16, 0.24], [0, 0.1],
]);

const nervePulse = new ParticleSystem({ color: [1, 0.95, 0.5], size: 0.0055, speed: 0.24, count: 44, jitter: 0.003 });
nervePulse.setPath(nervePath);

let selectedOrgan = null;
let hoveredOrgan = null;
let isPanning = false;
let lastMouse = [0, 0];

function screenToWorld(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * 2 - 1;
  const y = 1 - ((clientY - rect.top) / rect.height) * 2;
  const zoom = renderer.camera.zoom;
  return [(x - renderer.camera.pan[0]) / zoom, (y - renderer.camera.pan[1]) / zoom];
}

canvas.addEventListener('mousemove', (e) => {
  const world = screenToWorld(e.clientX, e.clientY);
  hoveredOrgan = organs.find((o) => o.visible && o.containsPoint(world)) || null;

  if (isPanning) {
    const rect = canvas.getBoundingClientRect();
    const dx = ((e.clientX - lastMouse[0]) / rect.width) * 2;
    const dy = -((e.clientY - lastMouse[1]) / rect.height) * 2;
    renderer.camera.pan[0] += dx;
    renderer.camera.pan[1] += dy;
    lastMouse = [e.clientX, e.clientY];
  }
});

canvas.addEventListener('mousedown', (e) => {
  const world = screenToWorld(e.clientX, e.clientY);
  const hit = organs.find((o) => o.visible && o.containsPoint(world)) || null;
  if (hit) {
    selectedOrgan = hit;
    ui.updateInfo(hit);
  } else {
    isPanning = true;
    lastMouse = [e.clientX, e.clientY];
  }
});

window.addEventListener('mouseup', () => {
  isPanning = false;
});

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  renderer.camera.zoom = Math.min(2.8, Math.max(0.6, renderer.camera.zoom - e.deltaY * 0.001));
}, { passive: false });

function drawOrgan(organ) {
  if (!organ.visible) return;
  const model = createTransform({
    translate: organ.center,
    rotate: organ.rotation,
    scale: [organ.baseScale[0] * organ.dynamicScale[0], organ.baseScale[1] * organ.dynamicScale[1]],
  });

  renderer.drawPolygon(
    organ.vertices,
    [...organ.fillA, ...organ.fillB],
    model,
    organ.highlight,
  );
}

function animate() {
  renderer.resize();
  const { dt, time } = animator.tick();

  const heartRate = ui.state.heartRate;
  const breathRate = ui.state.breathRate;

  const heartScale = animator.pulse(heartRate, time, 0.11);
  const heartSkew = animator.pulse(heartRate, time + 0.11, 0.06);
  const breathScale = animator.pulse(breathRate, time, 0.07);

  const heart = organs[0];
  heart.setPulse(heartScale, heartSkew);
  organs[1].setPulse(breathScale * 0.98, breathScale);
  organs[2].setPulse(breathScale * 1.02, breathScale);

  bloodFlow.speed = 0.09 + heartRate / 1000;
  deoxygenatedFlow.speed = 0.07 + heartRate / 1200;
  oxygenFlow.speed = 0.05 + breathRate / 900;

  bloodFlow.update(dt);
  deoxygenatedFlow.update(dt);
  oxygenFlow.update(dt);
  nervePulse.update(dt);

  for (const organ of organs) {
    organ.visible = ui.state.layers[organ.system];
    const hovered = hoveredOrgan && hoveredOrgan.id === organ.id;
    const selected = selectedOrgan && selectedOrgan.id === organ.id;
    organ.setHighlight(hovered ? 0.8 : selected ? 0.45 : 0);
  }

  renderer.clear();
  renderer.drawPolygon(body.vertices, [...body.fillA, ...body.fillB], modelIdentity, 0);

  if (ui.state.layers.respiratory) {
    drawOrgan(organs[1]);
    drawOrgan(organs[2]);
    renderer.drawParticles(oxygenFlow.buildVertexData(time), oxygenFlow.color, modelIdentity, 0.42);
  }

  if (ui.state.layers.circulatory) {
    renderer.drawLines(vesselPath, [0.68, 0.22, 0.27, 0.8], modelIdentity, 0.28);
    drawOrgan(heart);
    renderer.drawParticles(bloodFlow.buildVertexData(time), bloodFlow.color, modelIdentity, 0.25);
    renderer.drawParticles(deoxygenatedFlow.buildVertexData(time), deoxygenatedFlow.color, modelIdentity, 0.2);
  }

  if (ui.state.layers.nervous) {
    renderer.drawLines(nervePath, [0.96, 0.84, 0.55, 0.75], modelIdentity, 0.34);
    renderer.drawParticles(nervePulse.buildVertexData(time), nervePulse.color, modelIdentity, 0.5);
  }

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
