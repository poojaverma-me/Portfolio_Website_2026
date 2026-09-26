/**
 * The water's physics, on the GPU. Two coupled models:
 *
 * 1. Currents: the incompressible Navier–Stokes equations for the surface
 *    flow, solved with Stam's stable-fluids method (semi-Lagrangian advection,
 *    vorticity confinement, a Jacobi pressure solve, then projection onto a
 *    divergence-free field). The hull and the buried oar blades are moving
 *    solid bodies, imposed by Brinkman penalisation: inside them the water is
 *    driven to the body's own velocity, and the pressure solve pushes the rest
 *    of the flow around them. Wakes and the swirling "puddles" each stroke
 *    leaves are not drawn; they come out of the flow. The flow also carries
 *    two dyes: white water (foam) and calm slicks.
 *
 * 2. Waves: the damped wave equation for surface height,
 *      h_tt = c² ∇²h - γ h_t,
 *    stepped explicitly within its stability limit. The hull presses a
 *    depression into the surface, blades and drips knock rings into it, and
 *    whale flukes lift it. A disturbance moving at speed U through waves of
 *    speed c trails a V of half-angle asin(c / U); the engine sets c = U / 3,
 *    which gives Kelvin's 19.5°, the angle every real boat wake has.
 *
 * All positions and velocities are in CSS pixels; inside the shaders y points
 * up, as GL's texture coordinates do.
 */

import {
  type Pair,
  type Program,
  type Target,
  bind,
  blit,
  dispose,
  pair,
  program,
  target,
} from "./gl";

const SIM_LONG_SIDE = 384;
const JACOBI = 18;
const MAX_JETS = 8;
const MAX_SPOTS = 16;
const MAX_RIPPLES = 16;

const VS = `#version 300 es
in vec2 aPos;
uniform vec2 uTexel;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;
void main() {
  vUv = aPos * 0.5 + 0.5;
  vL = vUv - vec2(uTexel.x, 0.0);
  vR = vUv + vec2(uTexel.x, 0.0);
  vT = vUv + vec2(0.0, uTexel.y);
  vB = vUv - vec2(0.0, uTexel.y);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 o;
`;

// the hull as an ellipse, a buried blade as a thin plate along the oar
const BODIES = `
uniform vec2 uView;
uniform vec2 uHullPos;
uniform vec2 uHullDir;
uniform vec2 uHullSize;
uniform float uHullOn;
uniform vec4 uBlade[2];
uniform float uBladeOn[2];
uniform vec2 uBladeHalf;

float hullE(vec2 p) {
  vec2 d = p - uHullPos;
  vec2 n = vec2(-uHullDir.y, uHullDir.x);
  return length(vec2(dot(d, uHullDir) / uHullSize.x, dot(d, n) / uHullSize.y));
}
float hullChi(vec2 p) {
  return (1.0 - smoothstep(0.82, 1.04, hullE(p))) * uHullOn;
}
float bladeChi(vec2 p, int i) {
  vec4 b = uBlade[i];
  vec2 d = p - b.xy;
  vec2 n = vec2(-b.w, b.z);
  float a = abs(dot(d, b.zw)) / uBladeHalf.x;
  float c = abs(dot(d, n)) / uBladeHalf.y;
  return (1.0 - smoothstep(0.75, 1.1, a)) * (1.0 - smoothstep(0.5, 1.3, c)) * uBladeOn[i];
}
`;

const ADVECT = `${HEAD}
uniform sampler2D uVel;
uniform sampler2D uSrc;
uniform vec2 uView;
uniform float uDt;
uniform vec4 uDissipation;
void main() {
  vec2 back = vUv - uDt * texture(uVel, vUv).xy / uView;
  o = texture(uSrc, back) / (1.0 + uDissipation * uDt);
}`;

const CURL = `${HEAD}
uniform sampler2D uVel;
uniform float uCell;
void main() {
  float L = texture(uVel, vL).y;
  float R = texture(uVel, vR).y;
  float T = texture(uVel, vT).x;
  float B = texture(uVel, vB).x;
  o = vec4(0.5 * (R - L - T + B) / uCell, 0.0, 0.0, 1.0);
}`;

// vorticity confinement returns the small swirls numerical diffusion eats
const VORTICITY = `${HEAD}
uniform sampler2D uVel;
uniform sampler2D uCurl;
uniform float uConfine;
uniform float uDt;
void main() {
  float L = texture(uCurl, vL).x;
  float R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x;
  float B = texture(uCurl, vB).x;
  float C = texture(uCurl, vUv).x;
  vec2 f = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  f /= length(f) + 0.0001;
  f *= uConfine * C;
  f.y *= -1.0;
  vec2 v = texture(uVel, vUv).xy + f * uDt;
  o = vec4(v, 0.0, 1.0);
}`;

const DIVERGENCE = `${HEAD}
uniform sampler2D uVel;
uniform float uCell;
void main() {
  float L = texture(uVel, vL).x;
  float R = texture(uVel, vR).x;
  float T = texture(uVel, vT).y;
  float B = texture(uVel, vB).y;
  vec2 C = texture(uVel, vUv).xy;
  if (vL.x < 0.0) L = -C.x;
  if (vR.x > 1.0) R = -C.x;
  if (vT.y > 1.0) T = -C.y;
  if (vB.y < 0.0) B = -C.y;
  o = vec4(0.5 * (R - L + T - B) / uCell, 0.0, 0.0, 1.0);
}`;

const PRESSURE = `${HEAD}
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform float uCell;
void main() {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  float d = texture(uDivergence, vUv).x;
  o = vec4((L + R + B + T - d * uCell * uCell) * 0.25, 0.0, 0.0, 1.0);
}`;

const GRADIENT = `${HEAD}
uniform sampler2D uPressure;
uniform sampler2D uVel;
uniform float uCell;
void main() {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  vec2 v = texture(uVel, vUv).xy - 0.5 * vec2(R - L, T - B) / uCell;
  o = vec4(v, 0.0, 1.0);
}`;

const SCALE = `${HEAD}
uniform sampler2D uSrc;
uniform float uK;
void main() { o = texture(uSrc, vUv) * uK; }`;

// accelerations from swimmers, then the solid bodies imposed on the flow
const FORCES = `${HEAD}
${BODIES}
uniform sampler2D uVel;
uniform float uDt;
uniform vec2 uHullVel;
uniform vec2 uBladeVel[2];
uniform vec4 uJet[${MAX_JETS}];
uniform vec2 uJetAcc[${MAX_JETS}];
uniform int uJets;
void main() {
  vec2 p = vUv * uView;
  vec2 v = texture(uVel, vUv).xy;
  for (int i = 0; i < ${MAX_JETS}; i++) {
    if (i >= uJets) break;
    vec2 d = p - uJet[i].xy;
    v += uJetAcc[i] * exp(-dot(d, d) / (uJet[i].z * uJet[i].z)) * uDt;
  }
  v = mix(v, uHullVel, hullChi(p));
  for (int i = 0; i < 2; i++) v = mix(v, uBladeVel[i], bladeChi(p, i));
  o = vec4(v, 0.0, 1.0);
}`;

// white water where the hull and blades churn, and whatever the engine adds
const DYE = `${HEAD}
${BODIES}
uniform sampler2D uDye;
uniform float uDt;
uniform float uHullFoam;
uniform float uBladeFoam[2];
uniform vec4 uSpot[${MAX_SPOTS}];
uniform vec2 uSpotVal[${MAX_SPOTS}];
uniform int uSpots;
void main() {
  vec2 p = vUv * uView;
  vec4 d = texture(uDye, vUv);
  float e = hullE(p);
  float lx = dot(p - uHullPos, uHullDir) / uHullSize.x;
  // the bow and shoulders throw the most spray; a little churns off the stern
  float band = smoothstep(0.9, 1.02, e) * (1.0 - smoothstep(1.02, 1.32, e));
  d.r += band * (0.25 + 0.75 * smoothstep(-0.4, 0.85, lx)) * uHullFoam * uDt * uHullOn;
  float stern = (1.0 - smoothstep(0.7, 1.25, e)) * smoothstep(-0.55, -0.95, lx);
  d.r += stern * uHullFoam * 0.5 * uDt * uHullOn;
  for (int i = 0; i < 2; i++) d.r += bladeChi(p, i) * uBladeFoam[i] * uDt;
  for (int i = 0; i < ${MAX_SPOTS}; i++) {
    if (i >= uSpots) break;
    vec2 q = p - uSpot[i].xy;
    float g = exp(-dot(q, q) / (uSpot[i].z * uSpot[i].z));
    d.rg += uSpotVal[i] * g;
  }
  o = min(d, vec4(1.6));
}`;

const WAVE = `${HEAD}
${BODIES}
uniform sampler2D uWave;
uniform float uC2;
uniform float uDamp;
uniform float uVisc;
uniform float uHullDepth;
uniform float uBladeDepth;
uniform vec4 uRipple[${MAX_RIPPLES}];
uniform int uRipples;
void main() {
  vec2 p = vUv * uView;
  vec4 w = texture(uWave, vUv);
  float h = w.r;
  float hp = w.g;
  float lap = texture(uWave, vL).r + texture(uWave, vR).r + texture(uWave, vT).r + texture(uWave, vB).r - 4.0 * h;
  float hn = h + (h - hp) * (1.0 - uDamp) + uC2 * lap;
  // viscosity: the shortest ripples die fastest, as they do in real water
  hn += uVisc * lap;
  // soak up waves at the screen edge instead of bouncing them back
  float edge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
  hn *= mix(0.9, 1.0, smoothstep(0.0, 0.05, edge));
  // the hull and buried blades press the surface down as they move through it
  hn = mix(hn, -uHullDepth, hullChi(p) * 0.15);
  for (int i = 0; i < 2; i++) hn = mix(hn, -uBladeDepth, bladeChi(p, i) * 0.15);
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    if (i >= uRipples) break;
    vec2 q = p - uRipple[i].xy;
    hn += uRipple[i].w * exp(-dot(q, q) / (uRipple[i].z * uRipple[i].z));
  }
  o = vec4(hn, h, 0.0, 1.0);
}`;

// velocity packed into bytes, for the CPU to read back asynchronously
const ENCODE = `${HEAD}
uniform sampler2D uVel;
uniform float uVMax;
void main() {
  o = vec4(clamp(texture(uVel, vUv).xy / uVMax * 0.5 + 0.5, 0.0, 1.0), 0.0, 1.0);
}`;

export type Body = {
  x: number;
  y: number;
  /** unit heading */
  dx: number;
  dy: number;
  vx: number;
  vy: number;
};
export type Blade = Body & { on: number };
export type Jet = { x: number; y: number; r: number; ax: number; ay: number };
export type Spot = { x: number; y: number; r: number; foam: number; slick: number };
export type Ripple = { x: number; y: number; r: number; amp: number };

export type FluidInput = {
  hull: Body & { halfLen: number; halfBeam: number; on: number; foam: number; depth: number };
  blades: Blade[];
  bladeHalf: [number, number];
  bladeDepth: number;
  bladeFoam: [number, number];
  jets: Jet[];
  spots: Spot[];
  ripples: Ripple[];
  /** wave speed, px/s */
  waveSpeed: number;
};

export class Fluid {
  private gl: WebGL2RenderingContext;
  readonly programs: Program[];
  private p: Record<string, Program>;
  W = 1;
  H = 1;
  cell = 1;
  private simW = 1;
  private simH = 1;
  vel!: Pair;
  dye!: Pair;
  wave!: Pair;
  private pressure!: Pair;
  private div!: Target;
  private curl!: Target;
  // asynchronous readback of a coarse velocity grid
  private rb!: Target;
  private rbW = 48;
  private rbH = 32;
  private pbo: WebGLBuffer;
  private bytes = new Uint8Array(0);
  private fence: WebGLSync | null = null;
  private field = new Float32Array(0);
  private vMax = 1;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    const make = (fs: string) => program(gl, VS, fs);
    this.p = {
      advect: make(ADVECT),
      curl: make(CURL),
      vorticity: make(VORTICITY),
      divergence: make(DIVERGENCE),
      pressure: make(PRESSURE),
      gradient: make(GRADIENT),
      scale: make(SCALE),
      forces: make(FORCES),
      dye: make(DYE),
      wave: make(WAVE),
      encode: make(ENCODE),
    };
    this.programs = Object.values(this.p);
    this.pbo = gl.createBuffer()!;
  }

  /** (Re)allocates the grids for a W × H viewport. The water starts still. */
  size(W: number, H: number, vMax: number) {
    const gl = this.gl;
    if (this.vel) {
      for (const t of [this.vel.read, this.vel.write, this.dye.read, this.dye.write, this.wave.read,
        this.wave.write, this.pressure.read, this.pressure.write, this.div, this.curl, this.rb]) {
        dispose(gl, t);
      }
    }
    this.W = W;
    this.H = H;
    this.vMax = vMax;
    this.cell = Math.max(W, H) / SIM_LONG_SIDE;
    this.simW = Math.max(8, Math.round(W / this.cell));
    this.simH = Math.max(8, Math.round(H / this.cell));
    const { simW: w, simH: h } = this;
    this.vel = pair(gl, w, h);
    this.dye = pair(gl, w, h);
    this.wave = pair(gl, w, h);
    this.pressure = pair(gl, w, h);
    this.div = target(gl, w, h);
    this.curl = target(gl, w, h);
    this.rbH = Math.max(8, Math.round((this.rbW * H) / W));
    this.rb = target(gl, this.rbW, this.rbH, gl.RGBA8, gl.UNSIGNED_BYTE, gl.LINEAR);
    this.bytes = new Uint8Array(this.rbW * this.rbH * 4);
    this.field = new Float32Array(this.rbW * this.rbH * 2);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this.pbo);
    gl.bufferData(gl.PIXEL_PACK_BUFFER, this.bytes.byteLength, gl.STREAM_READ);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
    if (this.fence) gl.deleteSync(this.fence);
    this.fence = null;
  }

  private use(name: string) {
    const p = this.p[name];
    this.gl.useProgram(p.prog);
    this.gl.uniform2f(p.u("uTexel"), 1 / this.simW, 1 / this.simH);
    return p;
  }

  /** world (y down) to simulation (y up) */
  private y(y: number) {
    return this.H - y;
  }

  private bodies(p: Program, input: FluidInput) {
    const gl = this.gl;
    const { hull } = input;
    gl.uniform2f(p.u("uView"), this.W, this.H);
    gl.uniform2f(p.u("uHullPos"), hull.x, this.y(hull.y));
    gl.uniform2f(p.u("uHullDir"), hull.dx, -hull.dy);
    gl.uniform2f(p.u("uHullSize"), hull.halfLen, hull.halfBeam);
    gl.uniform1f(p.u("uHullOn"), hull.on);
    const b = input.blades;
    gl.uniform4fv(p.u("uBlade"), [
      b[0].x, this.y(b[0].y), b[0].dx, -b[0].dy,
      b[1].x, this.y(b[1].y), b[1].dx, -b[1].dy,
    ]);
    gl.uniform1fv(p.u("uBladeOn"), [b[0].on, b[1].on]);
    gl.uniform2f(p.u("uBladeHalf"), input.bladeHalf[0], input.bladeHalf[1]);
  }

  step(dt: number, input: FluidInput) {
    const gl = this.gl;
    const { vel, dye, wave, pressure } = this;
    gl.disable(gl.BLEND);

    // 1. forces and moving bodies
    let p = this.use("forces");
    this.bodies(p, input);
    gl.uniform1f(p.u("uDt"), dt);
    gl.uniform2f(p.u("uHullVel"), input.hull.vx, -input.hull.vy);
    gl.uniform2fv(p.u("uBladeVel"), [
      input.blades[0].vx, -input.blades[0].vy, input.blades[1].vx, -input.blades[1].vy,
    ]);
    const jets = input.jets.slice(0, MAX_JETS);
    gl.uniform1i(p.u("uJets"), jets.length);
    if (jets.length) {
      gl.uniform4fv(p.u("uJet"), jets.flatMap((j) => [j.x, this.y(j.y), j.r, 0]));
      gl.uniform2fv(p.u("uJetAcc"), jets.flatMap((j) => [j.ax, -j.ay]));
    }
    bind(gl, p, "uVel", 0, vel.read.tex);
    blit(gl, vel.write);
    vel.swap();

    // 2. keep the swirls
    p = this.use("curl");
    gl.uniform1f(p.u("uCell"), this.cell);
    bind(gl, p, "uVel", 0, vel.read.tex);
    blit(gl, this.curl);
    p = this.use("vorticity");
    gl.uniform1f(p.u("uConfine"), this.cell * 0.35);
    gl.uniform1f(p.u("uDt"), dt);
    bind(gl, p, "uVel", 0, vel.read.tex);
    bind(gl, p, "uCurl", 1, this.curl.tex);
    blit(gl, vel.write);
    vel.swap();

    // 3. make it incompressible
    p = this.use("divergence");
    gl.uniform1f(p.u("uCell"), this.cell);
    bind(gl, p, "uVel", 0, vel.read.tex);
    blit(gl, this.div);
    p = this.use("scale");
    gl.uniform1f(p.u("uK"), 0.8);
    bind(gl, p, "uSrc", 0, pressure.read.tex);
    blit(gl, pressure.write);
    pressure.swap();
    p = this.use("pressure");
    gl.uniform1f(p.u("uCell"), this.cell);
    bind(gl, p, "uDivergence", 1, this.div.tex);
    for (let i = 0; i < JACOBI; i++) {
      bind(gl, p, "uPressure", 0, pressure.read.tex);
      blit(gl, pressure.write);
      pressure.swap();
    }
    p = this.use("gradient");
    gl.uniform1f(p.u("uCell"), this.cell);
    bind(gl, p, "uPressure", 0, pressure.read.tex);
    bind(gl, p, "uVel", 1, vel.read.tex);
    blit(gl, vel.write);
    vel.swap();

    // 4. carry the flow along itself
    p = this.use("advect");
    gl.uniform2f(p.u("uView"), this.W, this.H);
    gl.uniform1f(p.u("uDt"), dt);
    gl.uniform4f(p.u("uDissipation"), 0.3, 0.3, 0, 0);
    bind(gl, p, "uVel", 0, vel.read.tex);
    bind(gl, p, "uSrc", 1, vel.read.tex);
    blit(gl, vel.write);
    vel.swap();

    // 5. foam and slicks, added and then carried by the flow
    p = this.use("dye");
    this.bodies(p, input);
    gl.uniform1f(p.u("uDt"), dt);
    gl.uniform1f(p.u("uHullFoam"), input.hull.foam);
    gl.uniform1fv(p.u("uBladeFoam"), input.bladeFoam);
    const spots = input.spots.slice(0, MAX_SPOTS);
    gl.uniform1i(p.u("uSpots"), spots.length);
    if (spots.length) {
      gl.uniform4fv(p.u("uSpot"), spots.flatMap((s) => [s.x, this.y(s.y), s.r, 0]));
      gl.uniform2fv(p.u("uSpotVal"), spots.flatMap((s) => [s.foam, s.slick]));
    }
    bind(gl, p, "uDye", 0, dye.read.tex);
    blit(gl, dye.write);
    dye.swap();
    p = this.use("advect");
    gl.uniform2f(p.u("uView"), this.W, this.H);
    gl.uniform1f(p.u("uDt"), dt);
    gl.uniform4f(p.u("uDissipation"), 0.5, 0.3, 0, 0);
    bind(gl, p, "uVel", 0, vel.read.tex);
    bind(gl, p, "uSrc", 1, dye.read.tex);
    blit(gl, dye.write);
    dye.swap();

    // 6. waves, in as many substeps as stability needs
    const courant = (input.waveSpeed * dt) / this.cell;
    const n = Math.min(6, Math.max(1, Math.ceil(courant / 0.6)));
    const sub = dt / n;
    p = this.use("wave");
    this.bodies(p, input);
    gl.uniform1f(p.u("uC2"), ((input.waveSpeed * sub) / this.cell) ** 2);
    gl.uniform1f(p.u("uDamp"), 1 - Math.exp(-2.2 * sub));
    gl.uniform1f(p.u("uVisc"), 0.1);
    gl.uniform1f(p.u("uHullDepth"), input.hull.depth * input.hull.on);
    gl.uniform1f(p.u("uBladeDepth"), input.bladeDepth);
    const ripples = input.ripples.slice(0, MAX_RIPPLES);
    if (ripples.length) {
      gl.uniform4fv(p.u("uRipple"), ripples.flatMap((r) => [r.x, this.y(r.y), r.r, r.amp]));
    }
    for (let i = 0; i < n; i++) {
      // knocks land once, not once per substep
      gl.uniform1i(p.u("uRipples"), i === 0 ? ripples.length : 0);
      bind(gl, p, "uWave", 0, wave.read.tex);
      blit(gl, wave.write);
      wave.swap();
    }

    this.readback();
  }

  /** Collects last frame's velocity if the GPU has it ready, then asks for this one. */
  private readback() {
    const gl = this.gl;
    if (this.fence) {
      // ask, never wait: the copy is only collected once the GPU says it's done
      if (gl.getSyncParameter(this.fence, gl.SYNC_STATUS) !== gl.SIGNALED) return;
      gl.deleteSync(this.fence);
      this.fence = null;
      {
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this.pbo);
        gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, this.bytes);
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
        const f = this.field;
        const b = this.bytes;
        for (let i = 0, j = 0; i < b.length; i += 4, j += 2) {
          f[j] = (b[i] / 255 * 2 - 1) * this.vMax;
          f[j + 1] = -(b[i + 1] / 255 * 2 - 1) * this.vMax;
        }
      }
    }
    const p = this.use("encode");
    gl.uniform1f(p.u("uVMax"), this.vMax);
    bind(gl, p, "uVel", 0, this.vel.read.tex);
    blit(gl, this.rb);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this.pbo);
    gl.readPixels(0, 0, this.rbW, this.rbH, gl.RGBA, gl.UNSIGNED_BYTE, 0);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
    this.fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
  }

  /** The current, in px/s with y down, at a world point (a frame or two old). */
  velocityAt(x: number, y: number): [number, number] {
    const w = this.rbW;
    const h = this.rbH;
    const gx = Math.min(Math.max((x / this.W) * w - 0.5, 0), w - 1.001);
    const gy = Math.min(Math.max((1 - y / this.H) * h - 0.5, 0), h - 1.001);
    const i = Math.floor(gx);
    const j = Math.floor(gy);
    const fx = gx - i;
    const fy = gy - j;
    const f = this.field;
    const at = (a: number, b: number, c: number) => f[(b * w + a) * 2 + c];
    const lerp2 = (c: number) =>
      (at(i, j, c) * (1 - fx) + at(i + 1, j, c) * fx) * (1 - fy) +
      (at(i, j + 1, c) * (1 - fx) + at(i + 1, j + 1, c) * fx) * fy;
    return [lerp2(0), lerp2(1)];
  }

  dispose() {
    const gl = this.gl;
    if (this.fence) gl.deleteSync(this.fence);
    gl.deleteBuffer(this.pbo);
  }
}
