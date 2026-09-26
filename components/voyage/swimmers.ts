/**
 * Whales and fish that swim the way their bodies actually work.
 *
 * Fish (carangiform swimmers) push water sideways with a wave that runs down
 * the body and grows toward the tail. The midline follows Lighthill's
 * elongated-body form,
 *
 *   h(x, t) = A(x) sin(k x - ω t),   A(x)/L = 0.02 - 0.0825 x + 0.1625 x²
 *
 * (Barrett's envelope, measured on tuna; x runs 0 at the snout to 1 at the
 * tail). The small head term is the recoil a real fish shows. The wavelength
 * is about one body length, and the tail-beat frequency follows from the
 * Strouhal number, St = f A / U ≈ 0.3, which nearly every efficient swimmer
 * sits close to. A faster fish therefore beats faster, automatically. The body
 * is bent by integrating curvature along the spine, so it never stretches.
 *
 * Whales beat their flukes up and down, not side to side. From above that
 * shows as the flukes foreshortening as they pitch (pitch leads heave by a
 * quarter cycle), the tail dipping out of and back into view, and almost no
 * sideways wriggle. A turning whale bends to the radius it is turning on:
 * curvature = turn rate / speed. A whale near the surface leaves a "fluke
 * print" on each upstroke: the vortex ring it sheds rises and smooths a patch
 * of the surface. The engine turns these into calm, glassy slicks.
 *
 * Fish near the boat do a C-start, the escape reflex: the body snaps into a C
 * away from the threat in about 70 ms, a return stroke throws the fish out at
 * several body lengths a second, and drag bleeds the speed off again.
 *
 * Everything is drawn on the GPU into a half-resolution texture that the water
 * shader reads (see sprites.ts): red for the body, green for light along the
 * back, blue for how sharp it should look (shallow things are crisp, deep ones
 * soft).
 */

import { type Layout, type Vec, seeded, toWorld, widthAt } from "./geometry";
import type { LifeLayer } from "./sprites";

type Pt = [number, number];
type Seg = { c1: Pt; c2: Pt; to: Pt; tag: 0 | 1 | 2 }; // body, fin, fluke

// upper half, snout (+100) to the notch in the tail; the lower half mirrors it
const WHALE_HALF: Seg[] = [
  { c1: [100, -10], c2: [95, -17], to: [86, -20], tag: 0 },
  { c1: [76, -24], c2: [60, -26], to: [46, -26], tag: 0 },
  { c1: [38, -30], c2: [22, -44], to: [0, -62], tag: 1 },
  { c1: [-4, -66], c2: [-8, -64], to: [-6, -60], tag: 1 },
  { c1: [4, -48], c2: [16, -34], to: [24, -25], tag: 1 },
  { c1: [0, -22], c2: [-30, -16], to: [-58, -8], tag: 0 },
  { c1: [-68, -5.5], c2: [-76, -4.5], to: [-82, -4.5], tag: 0 },
  { c1: [-86, -10], c2: [-92, -28], to: [-104, -40], tag: 2 },
  { c1: [-108, -44], c2: [-112, -42], to: [-110, -37], tag: 2 },
  { c1: [-106, -26], c2: [-104, -10], to: [-97, 0], tag: 2 },
];

const FISH_HALF: Seg[] = [
  { c1: [100, -12], c2: [74, -26], to: [30, -27], tag: 0 },
  { c1: [-10, -27], c2: [-46, -15], to: [-66, -6], tag: 0 },
  { c1: [-76, -12], c2: [-90, -28], to: [-104, -36], tag: 2 },
  { c1: [-98, -20], c2: [-95, -8], to: [-90, 0], tag: 2 },
];

type Shape = { xs: Float32Array; ys: Float32Array; tags: Uint8Array };

function buildShape(half: Seg[], steps: number): Shape {
  const up: { x: number; y: number; tag: number }[] = [];
  let from: Pt = [100, 0];
  up.push({ x: 100, y: 0, tag: 0 });
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

/** one body length in outline units */
const UNITS = 210;
// the spine, every 2 units from behind the tail to the snout
const X0 = -118;
const DX = 2;
const N = 113;
/** the centre of mass, about a third of the way back; the spine pivots here */
const ANCHOR = (30 - X0) / DX;

/** Strouhal number of an efficient swimmer */
const ST = 0.3;
/** tail amplitude (half of peak to peak), in body lengths */
const TAIL_AMP = 0.1;
/** body wavelength of a carangiform fish, in body lengths */
const WAVELENGTH = 0.95;

// C-start timings (s) and strengths
const C_BEND = 0.07;
const C_RETURN = 0.16;
const C_CURVE = 3.4; // peak curvature of the C, per body length
const C_TURN = 1.5; // radians turned away from the threat
const C_SPEED = 10; // body lengths per second at the end of the power stroke
const C_DECAY = 0.4; // s, drag time constant back to cruising

type Kind = "whale" | "fish";

type Spec = {
  kind: Kind;
  u: number;
  vf: number;
  /** heading relative to the direction of travel, degrees */
  heading: number;
  /** length in boat lengths */
  size: number;
  /** 0 deep and faint .. 1 just under the surface */
  depth: number;
  /** cruising speed, body lengths per second */
  speed: number;
  /** steady turn rate, degrees per second */
  turn: number;
  phase: number;
};

export type Swimmer = {
  kind: Kind;
  shape: Shape;
  L: number;
  x: number;
  y: number;
  heading: number;
  /** current and cruising speed, px/s */
  U: number;
  cruise: number;
  turn: number;
  beat: number;
  depth0: number;
  depth: number;
  breathe: number;
  /** time since a C-start began, or -1 */
  escape: number;
  escapeSide: number;
  escapeCooldown: number;
  /** fluke pitch and heave, for drawing and prints */
  pitch: number;
  heave: number;
};

// A large whale across the upper middle, one turning below it, one beside the
// boat, calves further back, and a scatter of fish, after the inspiration.
const SPECS: Spec[] = [
  { kind: "whale", u: 0.5, vf: -0.34, heading: 26, size: 1.35, depth: 0.95, speed: 0.16, turn: -1.5, phase: 0 },
  { kind: "whale", u: 0.44, vf: 0.52, heading: 40, size: 1.1, depth: 0.88, speed: 0.15, turn: 11, phase: 1.7 },
  { kind: "whale", u: 0.76, vf: 0.42, heading: -4, size: 0.66, depth: 0.8, speed: 0.22, turn: 3, phase: 0.6 },
  { kind: "whale", u: 0.16, vf: -0.26, heading: 14, size: 0.5, depth: 0.7, speed: 0.24, turn: 0, phase: 2.4 },
  { kind: "whale", u: 0.1, vf: 0.6, heading: -12, size: 0.55, depth: 0.62, speed: 0.2, turn: 4, phase: 3.1 },
  { kind: "whale", u: 0.63, vf: -0.72, heading: 8, size: 0.34, depth: 0.58, speed: 0.3, turn: -5, phase: 0.3 },
];

export function makeSwimmers(l: Layout): Swimmer[] {
  const specs = [...SPECS];
  const rand = seeded(29);
  for (let i = 0; i < 18; i++) {
    specs.push({
      kind: "fish",
      u: 0.04 + rand() * 0.9,
      vf: (rand() * 2 - 1) * 0.85,
      heading: (rand() * 2 - 1) * 45,
      size: 0.06 + rand() * 0.05,
      depth: 0.6 + rand() * 0.35,
      speed: 1.6 + rand() * 0.8,
      turn: (rand() * 2 - 1) * 12,
      phase: rand() * 6.28,
    });
  }
  const pathAngle = Math.atan2(l.dir.y, l.dir.x);
  return specs.map((s) => {
    const p = toWorld(l, s.u, s.vf * widthAt(l, s.u, 1));
    const L = s.size * l.boatLen;
    return {
      kind: s.kind,
      shape: s.kind === "whale" ? WHALE : FISH,
      L,
      x: p.x,
      y: p.y,
      heading: pathAngle + (s.heading * Math.PI) / 180,
      U: s.speed * L,
      cruise: s.speed * L,
      turn: (s.turn * Math.PI) / 180,
      beat: s.phase,
      depth0: s.depth,
      depth: s.depth,
      breathe: s.phase * 1.3,
      escape: -1,
      escapeSide: 1,
      escapeCooldown: 0,
      pitch: 0,
      heave: 0,
    };
  });
}

export type Print = { x: number; y: number; r: number; strength: number };

/**
 * Advances every swimmer by dt. `threats` are the hull and blades; fish that
 * find one within reach bolt. Returns the fluke prints left this step.
 */
export function stepSwimmers(
  swimmers: Swimmer[],
  dt: number,
  t: number,
  threats: { x: number; y: number; r: number }[],
): Print[] {
  const prints: Print[] = [];
  for (const s of swimmers) {
    const Lps = s.U / s.L;
    if (s.kind === "fish") {
      s.escapeCooldown -= dt;
      if (s.escape < 0 && s.escapeCooldown <= 0) {
        for (const th of threats) {
          const dx = th.x - s.x;
          const dy = th.y - s.y;
          if (dx * dx + dy * dy < (th.r + s.L) ** 2) {
            // bolt away from the side the threat is on
            const side = Math.cos(s.heading) * dy - Math.sin(s.heading) * dx;
            s.escapeSide = side > 0 ? -1 : 1;
            s.escape = 0;
            s.escapeCooldown = 1.2;
            break;
          }
        }
      }
      if (s.escape >= 0) {
        const e = s.escape;
        // stage 1 turns the body; stage 2 is the power stroke
        if (e < C_RETURN) s.heading += (s.escapeSide * C_TURN * dt) / C_RETURN;
        if (e >= C_BEND && e < C_RETURN) {
          s.U += ((C_SPEED * s.L - s.U) * dt) / (C_RETURN - C_BEND) * 1.6;
        }
        s.escape += dt;
        if (e > 1.2) s.escape = -1;
      }
      // drag brings it back to a cruise
      s.U += ((s.cruise - s.U) * dt) / C_DECAY;
      // gliding after the bolt, a fish holds still rather than beating
      const beating = s.escape < 0 || s.escape > 0.5 ? 1 : 0.25;
      s.beat += 2 * Math.PI * Math.min((ST * Lps) / (2 * TAIL_AMP), 14) * dt * beating;
    } else {
      s.beat += 2 * Math.PI * ((ST * Lps) / (2 * TAIL_AMP)) * dt;
      // a slow rise and fall through the water column
      s.depth = Math.min(1, s.depth0 + 0.07 * Math.sin(t * 0.9 + s.breathe));
      const prevHeave = s.heave;
      s.heave = Math.sin(s.beat);
      s.pitch = 0.5 * Math.cos(s.beat); // about 30°, leading the heave
      // the top of each upstroke sheds a ring that reaches the surface
      if (prevHeave < 0.98 && s.heave >= 0.98 && s.depth > 0.75) {
        const back = -0.5 * s.L;
        prints.push({
          x: s.x + Math.cos(s.heading) * back,
          y: s.y + Math.sin(s.heading) * back,
          r: s.L * 0.22,
          strength: (s.depth - 0.7) * 3,
        });
      }
    }
    s.heading += s.turn * dt;
    s.x += Math.cos(s.heading) * s.U * dt;
    s.y += Math.sin(s.heading) * s.U * dt;
  }
  return prints;
}

// scratch buffers reused every frame
const th = new Float32Array(N);
const sx = new Float32Array(N);
const sy = new Float32Array(N);
const out = new Float32Array(Math.max(WHALE.xs.length, FISH.xs.length) * 2);
const tail = new Float32Array(WHALE.xs.length * 2);
const back = new Float32Array(64);

/** Curvature along the body, per outline unit, from the swimming kinematics. */
function curvature(s: Swimmer, xu: number) {
  const x = (100 - xu) / UNITS; // 0 at the snout, 1 at the tail
  let kappa = s.turn / Math.max(s.U / s.L, 0.05); // per body length
  if (s.kind === "fish") {
    const k = (2 * Math.PI) / WAVELENGTH;
    const psi = k * x - s.beat;
    const A = 0.02 - 0.0825 * x + 0.1625 * x * x;
    const A1 = -0.0825 + 0.325 * x;
    const A2 = 0.325;
    const glide = s.escape >= 0 && s.escape < 0.5 ? 0.3 : 1;
    kappa += glide * (A2 * Math.sin(psi) + 2 * A1 * k * Math.cos(psi) - A * k * k * Math.sin(psi));
    if (s.escape >= 0) {
      // the C, then the return stroke that throws the fish forward
      const e = s.escape;
      const c =
        e < C_BEND
          ? e / C_BEND
          : e < C_RETURN
            ? 1 - 1.5 * ((e - C_BEND) / (C_RETURN - C_BEND))
            : -0.5 * Math.exp(-(e - C_RETURN) / 0.08);
      kappa += s.escapeSide * C_CURVE * c * Math.min(1, x * 1.6);
    }
  } else {
    // whales barely wriggle sideways; the stroke is vertical
    const tail = Math.max(0, x - 0.55) / 0.45;
    kappa += 0.35 * tail * tail * Math.sin(2 * Math.PI * x - s.beat);
  }
  return kappa / UNITS;
}

function bend(s: Swimmer) {
  th[ANCHOR] = 0;
  sx[ANCHOR] = 30;
  sy[ANCHOR] = 0;
  for (let i = ANCHOR; i < N - 1; i++) {
    th[i + 1] = th[i] + curvature(s, X0 + (i + 0.5) * DX) * DX;
    const a = (th[i] + th[i + 1]) * 0.5;
    sx[i + 1] = sx[i] + Math.cos(a) * DX;
    sy[i + 1] = sy[i] + Math.sin(a) * DX;
  }
  for (let i = ANCHOR; i > 0; i--) {
    th[i - 1] = th[i] - curvature(s, X0 + (i - 0.5) * DX) * DX;
    const a = (th[i] + th[i - 1]) * 0.5;
    sx[i - 1] = sx[i] - Math.cos(a) * DX;
    sy[i - 1] = sy[i] - Math.sin(a) * DX;
  }
}

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

/** Where the blowhole is, for the bubbles a whale breathes out. */
export function blowhole(s: Swimmer): Vec {
  const d = (62 - 30) * (s.L / UNITS);
  return { x: s.x + Math.cos(s.heading) * d, y: s.y + Math.sin(s.heading) * d };
}

/**
 * Draws every swimmer into the life layer: red for the body, green for light
 * along the back, blue for how sharp it should look. MAX blending keeps the
 * brightest value per channel, so the body, the flukes and the back never add
 * up into seams.
 */
export function drawSwimmers(layer: LifeLayer, swimmers: Swimmer[]) {
  for (const s of swimmers) {
    const shape = s.shape;
    const scale = s.L / UNITS;
    const cos = Math.cos(s.heading);
    const sin = Math.sin(s.heading);
    // the spine anchor (x = 30) sits on the swimmer's position
    const place = (bx: number, by: number, into: Float32Array, i: number) => {
      const lx = (bx - 30) * scale;
      const ly = by * scale;
      into[i] = s.x + lx * cos - ly * sin;
      into[i + 1] = s.y + lx * sin + ly * cos;
    };

    bend(s);
    // flukes foreshorten with pitch; fins scull a little
    const foreshorten = Math.cos(s.pitch);
    const fin = 1 + 0.06 * Math.sin(s.beat * 0.5);
    const n = shape.xs.length;
    for (let i = 0; i < n; i++) {
      const tag = shape.tags[i];
      let x = shape.xs[i];
      let y = shape.ys[i];
      if (s.kind === "whale" && tag === 2) x = -82 + (x + 82) * foreshorten;
      if (tag === 1) y *= fin;
      const [bx, by] = onSpine(x, y);
      place(bx, by, out, i * 2);
    }

    const sharp = Math.min(1, Math.max(0, (s.depth - 0.5) * 2));
    layer.fill(out, n, s.depth, 0, sharp);
    if (s.kind !== "whale") continue;

    // on the upstroke the flukes come up toward the light and darken
    if (s.heave > 0) {
      let m = 0;
      for (let i = 0; i < n; i++) {
        if (shape.tags[i] !== 2 && shape.xs[i] > -78) continue;
        tail[m * 2] = out[i * 2];
        tail[m * 2 + 1] = out[i * 2 + 1];
        m++;
      }
      layer.fill(tail, m, Math.min(1, s.depth + 0.12 * s.heave), 0, sharp);
    }

    // light along the back
    let m = 0;
    for (let x = -56; x <= 74; x += 6) {
      const [bx, by] = onSpine(x, 0);
      place(bx, by, back, m * 2);
      m++;
    }
    layer.strip(back, m, 8.5 * scale, 0, 0.78 * s.depth, 0);
  }
}
