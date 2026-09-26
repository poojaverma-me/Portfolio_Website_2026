/**
 * Whales and fish under the water. Each one is an outline in its own units
 * (snout at +100, flukes near -110) laid along a spine that bends as it swims:
 * a travelling wave that grows toward the tail, plus a steady curl for the
 * whale that turns. Seen from above, a fluke beating up and down looks like
 * it widens and narrows, so the flukes pulse too.
 *
 * They are drawn into a small offscreen canvas, red for the body and green for
 * the light catching the back, and the water shader reads it as a texture.
 * That way the caustics fall across their backs and they only ever show where
 * there is water.
 */

import {
  type Layout,
  seeded,
  toWorld,
  widthAt,
} from "./geometry";

type Pt = [number, number];
type Seg = { c1: Pt; c2: Pt; to: Pt; tag: 0 | 1 | 2 }; // body, fin, fluke

// upper half, snout to the notch in the flukes; the lower half is its mirror
const WHALE_HALF: Seg[] = [
  // broad, rounded head
  { c1: [100, -10], c2: [95, -17], to: [86, -20], tag: 0 },
  { c1: [76, -24], c2: [60, -26], to: [46, -26], tag: 0 },
  // the long, swept-back pectoral fin of a humpback
  { c1: [38, -30], c2: [22, -44], to: [0, -62], tag: 1 },
  { c1: [-4, -66], c2: [-8, -64], to: [-6, -60], tag: 1 },
  { c1: [4, -48], c2: [16, -34], to: [24, -25], tag: 1 },
  // body tapering to the tail stock
  { c1: [0, -22], c2: [-30, -16], to: [-58, -8], tag: 0 },
  { c1: [-68, -5.5], c2: [-76, -4.5], to: [-82, -4.5], tag: 0 },
  // wide flukes with swept tips
  { c1: [-86, -10], c2: [-92, -28], to: [-104, -40], tag: 2 },
  { c1: [-108, -44], c2: [-112, -42], to: [-110, -37], tag: 2 },
  { c1: [-106, -26], c2: [-104, -10], to: [-97, 0], tag: 2 },
];

const FISH_HALF: Seg[] = [
  { c1: [100, -14], c2: [70, -30], to: [20, -30], tag: 0 },
  { c1: [-20, -30], c2: [-50, -16], to: [-66, -8], tag: 0 },
  { c1: [-76, -14], c2: [-88, -28], to: [-102, -36], tag: 2 },
  { c1: [-96, -20], c2: [-94, -8], to: [-90, 0], tag: 2 },
];

type Shape = { xs: Float32Array; ys: Float32Array; tags: Uint8Array };

function buildShape(half: Seg[], steps: number): Shape {
  const up: { x: number; y: number; tag: number }[] = [];
  let from: Pt = [100, 0];
  up.push({ x: from[0], y: from[1], tag: 0 });
  for (const s of half) {
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const m = 1 - t;
      const a = m * m * m;
      const b = 3 * m * m * t;
      const c = 3 * m * t * t;
      const d = t * t * t;
      up.push({
        x: a * from[0] + b * s.c1[0] + c * s.c2[0] + d * s.to[0],
        y: a * from[1] + b * s.c1[1] + c * s.c2[1] + d * s.to[1],
        tag: s.tag,
      });
    }
    from = s.to;
  }
  // mirror, skipping the two points that sit on the axis
  const low = up
    .slice(1, -1)
    .reverse()
    .map((p) => ({ x: p.x, y: -p.y, tag: p.tag }));
  const all = [...up, ...low];
  return {
    xs: Float32Array.from(all, (p) => p.x),
    ys: Float32Array.from(all, (p) => p.y),
    tags: Uint8Array.from(all, (p) => p.tag),
  };
}

const WHALE = buildShape(WHALE_HALF, 8);
const FISH = buildShape(FISH_HALF, 5);

// the spine, sampled every 2 units from behind the flukes to the snout
const X0 = -118;
const DX = 2;
const N = 113; // X0 + DX * (N - 1) = 106
const ANCHOR = (30 - X0) / DX;

type Kind = "whale" | "fish";

type Creature = {
  kind: Kind;
  /** progress along the voyage line and signed fraction of its half-width */
  u: number;
  vf: number;
  /** heading relative to the direction of travel, radians */
  heading: number;
  /** length as a multiple of the boat */
  size: number;
  /** 0 = barely visible in the deep, 1 = just under the surface */
  depth: number;
  /** steady bend, radians per unit */
  curl: number;
  /** cruising speed in boat lengths per second */
  speed: number;
  /** tail beat, radians per second */
  beat: number;
  /** tail beat strength, radians per unit */
  amp: number;
  phase: number;
  /** slow change of heading, radians per second */
  turn: number;
};

const deg = Math.PI / 180;

// Placed after the inspiration: a large whale across the upper middle, one
// curling below it, a smaller one beside the boat, calves and a scatter of fish.
function makeCreatures(): Creature[] {
  const whales: Creature[] = [
    { kind: "whale", u: 0.5, vf: -0.34, heading: 26 * deg, size: 1.35, depth: 0.96, curl: 0, speed: 0.07, beat: 1.6, amp: 0.0032, phase: 0, turn: -0.012 },
    { kind: "whale", u: 0.44, vf: 0.56, heading: 48 * deg, size: 1.1, depth: 0.9, curl: 0.0042, speed: 0.06, beat: 1.8, amp: 0.003, phase: 1.7, turn: 0.05 },
    { kind: "whale", u: 0.75, vf: 0.42, heading: -4 * deg, size: 0.66, depth: 0.82, curl: -0.0012, speed: 0.1, beat: 2.3, amp: 0.004, phase: 0.6, turn: 0.02 },
    { kind: "whale", u: 0.15, vf: -0.22, heading: 14 * deg, size: 0.5, depth: 0.7, curl: 0.001, speed: 0.1, beat: 2.6, amp: 0.004, phase: 2.4, turn: 0 },
    { kind: "whale", u: 0.08, vf: 0.6, heading: -12 * deg, size: 0.55, depth: 0.62, curl: -0.002, speed: 0.08, beat: 2.2, amp: 0.004, phase: 3.1, turn: 0.03 },
    { kind: "whale", u: 0.62, vf: -0.7, heading: 8 * deg, size: 0.34, depth: 0.58, curl: 0.002, speed: 0.14, beat: 3.2, amp: 0.005, phase: 0.3, turn: -0.04 },
  ];
  const rand = seeded(29);
  const fish: Creature[] = [];
  for (let i = 0; i < 16; i++) {
    fish.push({
      kind: "fish",
      u: 0.04 + rand() * 0.84,
      vf: (rand() * 2 - 1) * 0.82,
      heading: (rand() * 2 - 1) * 40 * deg,
      size: 0.065 + rand() * 0.05,
      depth: 0.55 + rand() * 0.4,
      curl: (rand() * 2 - 1) * 0.004,
      speed: 0.25 + rand() * 0.25,
      beat: 9 + rand() * 5,
      amp: 0.011,
      phase: rand() * 6.28,
      turn: (rand() * 2 - 1) * 0.12,
    });
  }
  return [...whales, ...fish];
}

export const CREATURES = makeCreatures();

// scratch buffers reused every frame
const th = new Float32Array(N);
const sx = new Float32Array(N);
const sy = new Float32Array(N);
const out = new Float32Array(Math.max(WHALE.xs.length, FISH.xs.length) * 2);

function bend(c: Creature, t: number) {
  const beat = c.beat * t + c.phase;
  const kappa = (i: number) => {
    const x = X0 + i * DX;
    const tail = ((106 - x) / 224) ** 2;
    return c.curl + c.amp * Math.sin((x / 170) * 6.2832 + beat) * tail;
  };
  th[ANCHOR] = 0;
  sx[ANCHOR] = 30;
  sy[ANCHOR] = 0;
  for (let i = ANCHOR; i < N - 1; i++) {
    th[i + 1] = th[i] + kappa(i + 0.5) * DX;
    const a = (th[i] + th[i + 1]) * 0.5;
    sx[i + 1] = sx[i] + Math.cos(a) * DX;
    sy[i + 1] = sy[i] + Math.sin(a) * DX;
  }
  for (let i = ANCHOR; i > 0; i--) {
    th[i - 1] = th[i] - kappa(i - 0.5) * DX;
    const a = (th[i] + th[i - 1]) * 0.5;
    sx[i - 1] = sx[i] - Math.cos(a) * DX;
    sy[i - 1] = sy[i] - Math.sin(a) * DX;
  }
}

/** Where a point on the straight body lands on the bent spine, in body units. */
function onSpine(x: number, y: number): [number, number] {
  let f = (x - X0) / DX;
  f = f < 0 ? 0 : f > N - 1.001 ? N - 1.001 : f;
  const i = Math.floor(f);
  const k = f - i;
  const a = th[i] + (th[i + 1] - th[i]) * k;
  const cx = sx[i] + (sx[i + 1] - sx[i]) * k;
  const cy = sy[i] + (sy[i + 1] - sy[i]) * k;
  return [cx - Math.sin(a) * y, cy + Math.cos(a) * y];
}

export type Pose = {
  x: number;
  y: number;
  angle: number;
  scale: number;
};

/** Where a creature is and which way it faces at time t. */
export function poseOf(c: Creature, l: Layout, pathAngle: number, t: number): Pose {
  const base = toWorld(l, c.u, c.vf * widthAt(l, c.u, 1));
  const angle = pathAngle + c.heading + c.turn * t;
  const travel = c.speed * l.boatLen * t;
  return {
    x: base.x + Math.cos(angle) * travel,
    y: base.y + Math.sin(angle) * travel,
    angle,
    scale: (c.size * l.boatLen) / 210,
  };
}

/** The blowhole, for the bubbles a whale breathes out. */
export function blowhole(p: Pose) {
  const c = Math.cos(p.angle);
  const s = Math.sin(p.angle);
  const x = 62 * p.scale;
  return { x: p.x + c * x, y: p.y + s * x };
}

/**
 * Draws every creature into the life canvas. `k` is the canvas scale relative
 * to CSS pixels. No canvas blur filter: it halved the frame rate, and the
 * shader softens the edges for next to nothing instead.
 */
export function drawCreatures(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  pathAngle: number,
  t: number,
  k: number,
) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const c of CREATURES) {
    const shape = c.kind === "whale" ? WHALE : FISH;
    const p = poseOf(c, l, pathAngle, t);
    const cos = Math.cos(p.angle);
    const sin = Math.sin(p.angle);
    const s = p.scale;
    const tx = (x: number, y: number, i: number) => {
      out[i] = (p.x + s * (x * cos - y * sin)) * k;
      out[i + 1] = (p.y + s * (x * sin + y * cos)) * k;
    };

    bend(c, t);
    const beat = c.beat * t + c.phase;
    const fluke = 1 + 0.16 * Math.sin(beat - 1.2);
    const fin = 1 + 0.07 * Math.sin(beat * 0.5);
    const n = shape.xs.length;
    for (let i = 0; i < n; i++) {
      const tag = shape.tags[i];
      const y = shape.ys[i] * (tag === 2 ? fluke : tag === 1 ? fin : 1);
      const [bx, by] = onSpine(shape.xs[i], y);
      tx(bx, by, i * 2);
    }

    ctx.beginPath();
    ctx.moveTo(out[0], out[1]);
    for (let i = 1; i < n; i++) ctx.lineTo(out[i * 2], out[i * 2 + 1]);
    ctx.closePath();
    ctx.fillStyle = `rgb(${Math.round(255 * c.depth)},0,0)`;
    ctx.fill();

    // light along the back
    if (c.kind === "whale") {
      ctx.beginPath();
      for (let x = -56, first = true; x <= 74; x += 6, first = false) {
        const [bx, by] = onSpine(x, 0);
        const px = (p.x + s * (bx * cos - by * sin)) * k;
        const py = (p.y + s * (bx * sin + by * cos)) * k;
        if (first) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.lineWidth = 17 * s * k;
      ctx.strokeStyle = `rgb(0,${Math.round(200 * c.depth)},0)`;
      ctx.stroke();

      // the knobbly head of a humpback
      ctx.fillStyle = `rgb(0,${Math.round(150 * c.depth)},0)`;
      for (const [hx, hy] of KNOBS) {
        const [bx, by] = onSpine(hx, hy);
        ctx.beginPath();
        ctx.arc(
          (p.x + s * (bx * cos - by * sin)) * k,
          (p.y + s * (bx * sin + by * cos)) * k,
          2.1 * s * k,
          0,
          6.2832,
        );
        ctx.fill();
      }
    }
  }
  ctx.globalCompositeOperation = "source-over";
}

const KNOBS: Pt[] = [
  [90, -4], [86, 5], [80, -9], [76, 2], [72, 10], [70, -3], [64, -11], [62, 7],
];
