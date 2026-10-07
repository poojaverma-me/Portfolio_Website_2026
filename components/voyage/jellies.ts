/**
 * Moon jellyfish: the slowest swimmers here, and the ones the water moves most.
 *
 * The bell is a pump. It contracts quickly, which throws a ring of water out
 * behind it and pushes the jelly forward, then relaxes slowly back open.
 * Each jelly drifts with the simulated current as well, so the boat's wake
 * sweeps the nearer ones aside.
 *
 * The tentacles and the frilly oral arms are Verlet chains: points carried by
 * their own momentum, damped by the water's drag, nudged by the current where
 * each point actually is, and held at a fixed spacing by distance constraints
 * relaxed a few times a step. The first point of each is pinned to the
 * pulsing bell, so the chains trail behind as it swims and ripple with every
 * stroke without any of that being scripted.
 */

import { type Layout, seeded, toWorld, widthAt } from "./geometry";
import { ATLAS } from "./creature-atlas";
import type { StripWriter } from "./sprites";

/** bell diameter in atlas units */
const BELL = 200;
const TENTACLES = 10;
const T_NODES = 11;
const ARMS = 4;
const A_NODES = 7;
/** pulse period, s, and how far the bell closes */
const PULSE = 2.3;
const SQUEEZE = 0.17;

type Chain = { x: Float32Array; y: Float32Array; px: Float32Array; py: Float32Array; seg: number };

export type Jelly = {
  R: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  heading: number;
  wander: number;
  phase: number;
  /** the bell's current scale, 1 open */
  open: number;
  depth: number;
  tentacles: Chain[];
  arms: Chain[];
  ready: boolean;
};

const SPOTS = [
  { u: 0.22, vf: -0.5, r: 0.15, depth: 0.82, heading: -150 },
  { u: 0.33, vf: -0.3, r: 0.11, depth: 0.74, heading: 170 },
  { u: 0.5, vf: 0.55, r: 0.17, depth: 0.86, heading: 120 },
  { u: 0.66, vf: 0.42, r: 0.1, depth: 0.7, heading: 90 },
  { u: 0.88, vf: -0.4, r: 0.13, depth: 0.8, heading: -100 },
];

function chain(n: number, seg: number): Chain {
  return { x: new Float32Array(n), y: new Float32Array(n), px: new Float32Array(n), py: new Float32Array(n), seg };
}

export function makeJellies(l: Layout): Jelly[] {
  const rand = seeded(71);
  const path = Math.atan2(l.dir.y, l.dir.x);
  return SPOTS.map((s) => {
    const p = toWorld(l, s.u, s.vf * widthAt(l, s.u, 1));
    const R = s.r * l.boatLen;
    return {
      R,
      x: p.x,
      y: p.y,
      vx: 0,
      vy: 0,
      heading: path + (s.heading * Math.PI) / 180,
      wander: rand() * 10,
      phase: rand(),
      open: 1,
      depth: s.depth,
      tentacles: Array.from({ length: TENTACLES }, () => chain(T_NODES, R * 0.3)),
      arms: Array.from({ length: ARMS }, () => chain(A_NODES, R * 0.26)),
      ready: false,
    };
  });
}

/** the bell's opening at pulse phase p (0..1): a quick close, a slow reopening */
function opening(p: number) {
  const close = 0.22;
  if (p < close) {
    const k = p / close;
    return 1 - SQUEEZE * k * k * (3 - 2 * k);
  }
  const k = (p - close) / (1 - close);
  return 1 - SQUEEZE * (1 - k) * (1 - k);
}

function anchors(j: Jelly, i: number, n: number, ring: number, spin = 0) {
  const a = j.heading + Math.PI + ((i + 0.5) / n - 0.5) * 2 * ring + spin;
  const r = j.R * j.open * 0.82;
  return { x: j.x + Math.cos(a) * r * 0.9, y: j.y + Math.sin(a) * r * 0.9 };
}

function pinFor(j: Jelly, kind: "t" | "a", i: number) {
  // tentacles hang from the rim, mostly round the back half; arms from the middle
  return kind === "t"
    ? anchors(j, i, TENTACLES, Math.PI * 0.85)
    : (() => {
        const a = j.heading + Math.PI + ((i + 0.5) / ARMS - 0.5) * 1.6;
        const r = j.R * 0.18;
        return { x: j.x + Math.cos(a) * r, y: j.y + Math.sin(a) * r };
      })();
}

function lay(j: Jelly, c: Chain, from: { x: number; y: number }) {
  const bx = -Math.cos(j.heading);
  const by = -Math.sin(j.heading);
  for (let k = 0; k < c.x.length; k++) {
    c.x[k] = c.px[k] = from.x + bx * c.seg * k;
    c.y[k] = c.py[k] = from.y + by * c.seg * k;
  }
}

function stepChain(c: Chain, pin: { x: number; y: number }, dt: number, t: number, sway: number, current: (x: number, y: number) => [number, number]) {
  const n = c.x.length;
  // water drag: most of a point's velocity is lost each step
  const keep = Math.exp(-dt * 3.2);
  for (let k = 1; k < n; k++) {
    const vx = (c.x[k] - c.px[k]) * keep;
    const vy = (c.y[k] - c.py[k]) * keep;
    c.px[k] = c.x[k];
    c.py[k] = c.y[k];
    const [ux, uy] = current(c.x[k], c.y[k]);
    // the current carries the point; a slow sideways sway keeps it alive
    const s = Math.sin(t * 1.7 + k * 0.7 + sway) * c.seg * 0.6;
    c.x[k] += vx + ux * dt * 0.8 + s * dt;
    c.y[k] += vy + uy * dt * 0.8 + s * dt * 0.5;
  }
  c.x[0] = c.px[0] = pin.x;
  c.y[0] = c.py[0] = pin.y;
  // hold the spacing: a few rounds of relaxing each link toward its length
  for (let it = 0; it < 3; it++) {
    for (let k = 0; k < n - 1; k++) {
      const dx = c.x[k + 1] - c.x[k];
      const dy = c.y[k + 1] - c.y[k];
      const d = Math.hypot(dx, dy) || 1e-6;
      const diff = (d - c.seg) / d;
      if (k === 0) {
        c.x[k + 1] -= dx * diff;
        c.y[k + 1] -= dy * diff;
      } else {
        c.x[k] += dx * diff * 0.5;
        c.y[k] += dy * diff * 0.5;
        c.x[k + 1] -= dx * diff * 0.5;
        c.y[k + 1] -= dy * diff * 0.5;
      }
    }
  }
}

export function stepJellies(jellies: Jelly[], dt: number, t: number, current: (x: number, y: number) => [number, number]) {
  for (const j of jellies) {
    if (!j.ready) {
      j.tentacles.forEach((c, i) => lay(j, c, pinFor(j, "t", i)));
      j.arms.forEach((c, i) => lay(j, c, pinFor(j, "a", i)));
      j.ready = true;
    }
    if (dt <= 0) continue;
    const before = j.phase;
    j.phase = (j.phase + dt / PULSE) % 1;
    j.open = opening(j.phase);
    // the power stroke: a push forward while the bell closes
    if (j.phase < 0.22 || before > j.phase) {
      const thrust = j.R * 2.6;
      j.vx += Math.cos(j.heading) * thrust * dt;
      j.vy += Math.sin(j.heading) * thrust * dt;
    }
    const drag = Math.exp(-dt * 1.6);
    j.vx *= drag;
    j.vy *= drag;
    // a slow, wandering course
    j.wander += dt * 0.25;
    j.heading += (0.18 * Math.sin(j.wander) + 0.08 * Math.sin(j.wander * 2.7)) * dt;
    const [ux, uy] = current(j.x, j.y);
    j.x += (j.vx + ux * 0.7) * dt;
    j.y += (j.vy + uy * 0.7) * dt;
    j.depth += (0.012 * Math.sin(t * 0.5 + j.wander)) * dt;
    j.tentacles.forEach((c, i) => stepChain(c, pinFor(j, "t", i), dt, t, i * 1.3, current));
    j.arms.forEach((c, i) => stepChain(c, pinFor(j, "a", i), dt, t, i * 2.1 + 5, current));
  }
}

type Part = { u0: number; v0: number; u1: number; v1: number; x0: number; x1: number; y0: number; y1: number };

/** a chain drawn as a ribbon of `part`, its width tapering from `w0` to `w1` px */
function ribbon(w: StripWriter, c: Chain, p: Part, w0: number, w1: number, alpha: number, depth: number) {
  const n = c.x.length;
  w.begin("jelly");
  for (let k = 0; k < n; k++) {
    const a = k < n - 1 ? Math.atan2(c.y[k + 1] - c.y[k], c.x[k + 1] - c.x[k]) : Math.atan2(c.y[k] - c.y[k - 1], c.x[k] - c.x[k - 1]);
    const f = k / (n - 1);
    const half = (w0 + (w1 - w0) * f) * 0.5;
    const nx = -Math.sin(a);
    const ny = Math.cos(a);
    const u = p.u0 + (p.u1 - p.u0) * f;
    w.vertex(c.x[k] - nx * half, c.y[k] - ny * half, u, p.v0, a, 0, alpha, depth);
    w.vertex(c.x[k] + nx * half, c.y[k] + ny * half, u, p.v1, a, 0, alpha, depth);
  }
  w.end();
}

export function writeJelly(j: Jelly, w: StripWriter) {
  if (!w.fits(400)) return;
  const parts = ATLAS.jelly.parts;
  const d = j.depth;
  for (const c of j.tentacles) ribbon(w, c, parts.tentacle, j.R * 0.16, j.R * 0.1, 1, d + 0.04);
  j.arms.forEach((c, i) => {
    const p = [parts.arm0, parts.arm1, parts.arm2, parts.arm3][i];
    ribbon(w, c, p, j.R * 0.6, j.R * 0.34, 0.92, d - 0.01);
  });
  // the bell, translucent, squashing a touch along the stroke as it closes
  const b = parts.bell;
  const s = (j.R * 2) / BELL;
  const along = j.open * (1 + (1 - j.open) * 0.6);
  const across = j.open;
  const ch = Math.cos(j.heading);
  const sh = Math.sin(j.heading);
  w.begin("jelly");
  for (const [x, u] of [
    [b.x0, b.u0],
    [b.x1, b.u1],
  ]) {
    for (const [y, v] of [
      [b.y0, b.v0],
      [b.y1, b.v1],
    ]) {
      const lx = x * s * along;
      const ly = y * s * across;
      // the bell glows a little: drawn a touch nearer and more solid than its depth
      w.vertex(j.x + lx * ch - ly * sh, j.y + lx * sh + ly * ch, u, v, j.heading, 0.08, 0.9, d);
    }
  }
  w.end();
}
