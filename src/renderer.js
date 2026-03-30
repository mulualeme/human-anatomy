const VS = `
attribute vec2 a_position;
attribute vec4 a_color;
uniform mat3 u_matrix;
uniform float u_pointSize;
varying vec4 v_color;
void main() {
  vec3 world = u_matrix * vec3(a_position, 1.0);
  gl_Position = vec4(world.xy, 0.0, 1.0);
  gl_PointSize = u_pointSize;
  v_color = a_color;
}
`;

const FS = `
precision mediump float;
varying vec4 v_color;
uniform float u_glow;
void main() {
  vec2 p = gl_PointCoord - vec2(0.5);
  float dist = length(p);
  float pointAlpha = smoothstep(0.5, 0.0, dist);
  float glowBoost = 1.0 + u_glow * 0.65;
  vec4 c = v_color * glowBoost;
  if (gl_PointSize > 1.5) {
    gl_FragColor = vec4(c.rgb, c.a * pointAlpha);
  } else {
    gl_FragColor = c;
  }
}
`;

function compile(gl, source, type) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, source);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) || 'shader compile failed');
  }
  return sh;
}

function mat3Multiply(a, b) {
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
    a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
    a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
    a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
    a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
    a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
    a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
    a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
    a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
  ];
}

export function createTransform({ translate = [0, 0], rotate = 0, scale = [1, 1] }) {
  const [tx, ty] = translate;
  const [sx, sy] = scale;
  const c = Math.cos(rotate);
  const s = Math.sin(rotate);
  const translation = [1, 0, tx, 0, 1, ty, 0, 0, 1];
  const rotation = [c, -s, 0, s, c, 0, 0, 0, 1];
  const scaling = [sx, 0, 0, 0, sy, 0, 0, 0, 1];
  return mat3Multiply(translation, mat3Multiply(rotation, scaling));
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl', { antialias: true, alpha: true });
    if (!this.gl) throw new Error('WebGL unavailable');
    const gl = this.gl;

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, VS, gl.VERTEX_SHADER));
    gl.attachShader(prog, compile(gl, FS, gl.FRAGMENT_SHADER));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(prog) || 'program link failed');
    }
    gl.useProgram(prog);

    this.program = prog;
    this.attrPos = gl.getAttribLocation(prog, 'a_position');
    this.attrColor = gl.getAttribLocation(prog, 'a_color');
    this.uMatrix = gl.getUniformLocation(prog, 'u_matrix');
    this.uPointSize = gl.getUniformLocation(prog, 'u_pointSize');
    this.uGlow = gl.getUniformLocation(prog, 'u_glow');

    this.buffer = gl.createBuffer();
    this.camera = { zoom: 1, pan: [0, 0] };

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(this.canvas.clientWidth * dpr);
    const h = Math.floor(this.canvas.clientHeight * dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.gl.viewport(0, 0, w, h);
  }

  clear() {
    const gl = this.gl;
    gl.clearColor(0.04, 0.07, 0.14, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  cameraMatrix() {
    return createTransform({
      translate: this.camera.pan,
      scale: [this.camera.zoom, this.camera.zoom],
      rotate: 0,
    });
  }

  drawPolygon(vertices, colors, model, glow = 0) {
    const gl = this.gl;
    const cam = this.cameraMatrix();
    const matrix = mat3Multiply(cam, model);
    const data = new Float32Array(vertices.length / 2 * 6);
    for (let i = 0, j = 0; i < vertices.length; i += 2, j += 6) {
      const yNorm = (vertices[i + 1] + 1) * 0.5;
      data[j] = vertices[i];
      data[j + 1] = vertices[i + 1];
      data[j + 2] = colors[0] * (1 - yNorm) + colors[4] * yNorm;
      data[j + 3] = colors[1] * (1 - yNorm) + colors[5] * yNorm;
      data[j + 4] = colors[2] * (1 - yNorm) + colors[6] * yNorm;
      data[j + 5] = colors[3] * (1 - yNorm) + colors[7] * yNorm;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(this.attrPos, 2, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(this.attrPos);
    gl.vertexAttribPointer(this.attrColor, 4, gl.FLOAT, false, 24, 8);
    gl.enableVertexAttribArray(this.attrColor);
    gl.uniformMatrix3fv(this.uMatrix, false, matrix);
    gl.uniform1f(this.uPointSize, 1);
    gl.uniform1f(this.uGlow, glow);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2);
  }

  drawLines(pathPoints, rgba, model, glow = 0) {
    const gl = this.gl;
    const cam = this.cameraMatrix();
    const matrix = mat3Multiply(cam, model);
    const data = new Float32Array(pathPoints.length * 6);
    for (let i = 0, j = 0; i < pathPoints.length; i += 1, j += 6) {
      data[j] = pathPoints[i][0];
      data[j + 1] = pathPoints[i][1];
      data[j + 2] = rgba[0];
      data[j + 3] = rgba[1];
      data[j + 4] = rgba[2];
      data[j + 5] = rgba[3];
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(this.attrPos, 2, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(this.attrPos);
    gl.vertexAttribPointer(this.attrColor, 4, gl.FLOAT, false, 24, 8);
    gl.enableVertexAttribArray(this.attrColor);
    gl.uniformMatrix3fv(this.uMatrix, false, matrix);
    gl.uniform1f(this.uPointSize, 1);
    gl.uniform1f(this.uGlow, glow);
    gl.drawArrays(gl.LINE_STRIP, 0, pathPoints.length);
  }

  drawParticles(vertexData, color, model, glow = 0) {
    const gl = this.gl;
    const cam = this.cameraMatrix();
    const matrix = mat3Multiply(cam, model);
    const particleCount = vertexData.length / 3;
    const data = new Float32Array(particleCount * 6);
    let averageSize = 0;
    for (let i = 0, j = 0; i < vertexData.length; i += 3, j += 6) {
      data[j] = vertexData[i];
      data[j + 1] = vertexData[i + 1];
      data[j + 2] = color[0];
      data[j + 3] = color[1];
      data[j + 4] = color[2];
      data[j + 5] = 0.9;
      averageSize += vertexData[i + 2];
    }
    averageSize = (averageSize / particleCount) * this.canvas.height;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(this.attrPos, 2, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(this.attrPos);
    gl.vertexAttribPointer(this.attrColor, 4, gl.FLOAT, false, 24, 8);
    gl.enableVertexAttribArray(this.attrColor);
    gl.uniformMatrix3fv(this.uMatrix, false, matrix);
    gl.uniform1f(this.uPointSize, averageSize);
    gl.uniform1f(this.uGlow, glow);
    gl.drawArrays(gl.POINTS, 0, particleCount);
  }
}
