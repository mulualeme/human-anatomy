# Realistic 2D Interactive Human Anatomy Visualizer using WebGL

## 1) Introduction
This project presents a real-time educational anatomy visualizer developed with raw WebGL. The application renders a semi-realistic 2D human torso with layered physiological systems and responsive interaction. Instead of static diagrams, the visualizer simulates dynamic biological processes (heart pumping, breathing, blood and oxygen transport, and neural signaling) to improve conceptual understanding for students.

## 2) Objective
The core objective is to demonstrate a technically strong WebGL pipeline for 2D medical visualization, while also meeting interaction and animation expectations of a modern academic project. The system must clearly show:
- transformation mathematics (translation, rotation, scaling),
- GPU-driven rendering with shaders and buffers,
- particle motion along anatomical paths,
- user controls for exploratory learning.

## 3) Implemented Features
### 3.1 Multi-layer anatomy rendering
- Body silhouette layer for context.
- Organ layer with realistic polygonal contours for heart and lungs.
- Effect layer with glow-enhanced particles and system overlays.

### 3.2 Transformation and animation system
- Time-based animation loop using `requestAnimationFrame`.
- Heart pulse through non-uniform scaling to mimic contraction dynamics.
- Bilateral lung expansion and contraction for respiration.
- Camera pan (translation) and zoom (scaling).

### 3.3 Particle simulation engine
- Reusable particle component for multiple subsystems.
- Blood particles loop through vascular paths.
- Oxygen particles travel between lungs and cardiac region.
- Neural pulses move along a simplified spinal pathway.

### 3.4 Interaction and educational UX
- Hover-based glow highlighting.
- Click to select organ and open descriptive information panel.
- Toggle controls to show/hide circulatory, respiratory, and nervous systems.
- Live rate sliders to adjust heart and breathing dynamics.

## 4) Technologies Used
- HTML5 and CSS3 for layout and control panel UI.
- JavaScript ES modules and classes for modular architecture.
- Raw WebGL API for low-level rendering.
- GLSL vertex and fragment shaders for color gradients and highlight effects.

## 5) Challenges and Solutions
1. **Maintaining realism in pure WebGL 2D**
   - Challenge: Avoiding simplistic textbook visuals.
   - Solution: Designed high-vertex anatomical silhouettes and layered color gradients to provide organic appearance.

2. **Stable interaction under camera transforms**
   - Challenge: Hit testing with zoom and pan.
   - Solution: Converted screen coordinates back into world coordinates before point-in-polygon selection checks.

3. **Reusable animation architecture**
   - Challenge: Different dynamic behaviors (pulse vs. flow) within one loop.
   - Solution: Separated concerns into animator, particle system, organ model, and renderer modules.

4. **Performance with continuous updates**
   - Challenge: Sustaining smooth frame rate while updating particles.
   - Solution: Lightweight array-based updates and batched WebGL buffer uploads per draw pass.

## 6) Conclusion
The final result is a polished and interactive WebGL anatomy visualizer suitable for high-grade academic demonstration. It combines graphics fundamentals, transformation mathematics, real-time animation, and user-centered interaction in a clear educational package. The architecture also supports easy extension (digestive/endocrine systems, richer SVG import pipelines, organ labels, and quiz modes) for future development.

## 7) Setup Instructions
1. Open the project folder.
2. Run a static file server (example):
   ```bash
   python3 -m http.server 8000
   ```
3. Visit `http://localhost:8000`.
4. Use the left control panel and interact directly with the anatomy viewport.
