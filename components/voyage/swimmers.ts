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
 * Sharks swim like fish, with a slower, wider body wave, and never bolt.
 *
 * Every animal is drawn as a textured ribbon bent along its spine (see
 * CreatureLayer in sprites.ts and scripts/bake-creatures.py for the models).
 */

import { type Layout, type Vec, seeded, toWorld, widthAt } from "./geometry";
import { ATLAS } from "./creature-atlas";
import { CREATURE_STRIDE, type CreatureKind } from "./sprites";

/** one body length in outline units */
const UNITS = 210;
// the spine, every 2 units from behind the tail to the snout
const X0 = -126;
const DX = 2;
const N = 118;
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

type Kind = CreatureKind;

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

// A large whale across the upper middle, one turning below it, a calf beside
// the boat, three sharks further back, and a scatter of fish, after the
// inspiration.
const SPECS: Spec[] = [
  { kind: "whale", u: 0.5, vf: -0.34, heading: 26, size: 1.35, depth: 0.95, speed: 0.16, turn: -1.5, phase: 0 },
  { kind: "whale", u: 0.44, vf: 0.52, heading: 40, size: 1.1, depth: 0.88, speed: 0.15, turn: 11, phase: 1.7 },
  { kind: "whale", u: 0.76, vf: 0.42, heading: -4, size: 0.66, depth: 0.8, speed: 0.22, turn: 3, phase: 0.6 },
  { kind: "shark", u: 0.16, vf: -0.26, heading: 14, size: 0.52, depth: 0.8, speed: 0.5, turn: 0, phase: 2.4 },
  { kind: "shark", u: 0.1, vf: 0.6, heading: -12, size: 0.46, depth: 0.74, speed: 0.45, turn: 6, phase: 3.1 },
  { kind: "shark", u: 0.63, vf: -0.72, heading: 8, size: 0.4, depth: 0.76, speed: 0.55, turn: -7, phase: 0.3 },
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
    if (s.kind !== "whale") {
      s.escapeCooldown -= dt;
      if (s.kind === "fish" && s.escape < 0 && s.escapeCooldown <= 0) {
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

/** Curvature along the body, per outline unit, from the swimming kinematics. */
function curvature(s: Swimmer, xu: number) {
  const x = (100 - xu) / UNITS; // 0 at the snout, 1 at the tail
  let kappa = s.turn / Math.max(s.U / s.L, 0.05); // per body length
  if (s.kind !== "whale") {
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
  const d = (71 - 30) * (s.L / UNITS);
  return { x: s.x + Math.cos(s.heading) * d, y: s.y + Math.sin(s.heading) * d };
}

/** Cross-sections per animal: enough for a smooth bend at its size. */
const SECTIONS: Record<Kind, number> = { whale: 64, shark: 40, fish: 14 };
/** Where each kind's flukes begin, in body units; they foreshorten as they pitch. */
const FLUKE_BASE = 100 - 182;

export type CreatureDraw = { kind: Kind; depth: number; first: number; count: number };

/**
 * Lays every swimmer out as a triangle strip bent along its spine, deepest
 * first so nearer animals cover farther ones. Writes into `verts` (see
 * CREATURE_STRIDE) and returns one draw per animal plus the vertex count.
 */
export function layoutSwimmers(swimmers: Swimmer[], verts: Float32Array) {
  const order = [...swimmers].sort((a, b) => a.depth - b.depth);
  const draws: CreatureDraw[] = [];
  let v = 0;
  for (const s of order) {
    const a = ATLAS[s.kind];
    const K = SECTIONS[s.kind];
    if ((v + 2 * K) * CREATURE_STRIDE > verts.length) break;
    bend(s);
    const scale = s.L / UNITS;
    const cos = Math.cos(s.heading);
    const sin = Math.sin(s.heading);
    const foreshorten = Math.cos(s.pitch);
    // on the upstroke a whale's flukes rise toward the light
    const lift = s.kind === "whale" ? 0.12 * Math.max(0, s.heave) : 0;
    const first = v;
    for (let i = 0; i < K; i++) {
      const f = i / (K - 1);
      const x = a.x0 + (a.x1 - a.x0) * f;
      let xs = x;
      let tailLift = 0;
      if (s.kind === "whale" && x < FLUKE_BASE) {
        xs = FLUKE_BASE + (x - FLUKE_BASE) * foreshorten;
        tailLift = lift;
      }
      // the spine's angle here, for turning the baked normals
      let k = (xs - X0) / DX;
      k = k < 0 ? 0 : k > N - 1.001 ? N - 1.001 : k;
      const j = Math.floor(k);
      const angle = s.heading + th[j] + (th[j + 1] - th[j]) * (k - j);
      for (const side of [0, 1]) {
        const y = side === 0 ? a.y0 : a.y1;
        const [bx, by] = onSpine(xs, y);
        const lx = (bx - 30) * scale;
        const ly = by * scale;
        const o = v * CREATURE_STRIDE;
        verts[o] = s.x + lx * cos - ly * sin;
        verts[o + 1] = s.y + lx * sin + ly * cos;
        verts[o + 2] = f;
        verts[o + 3] = side;
        verts[o + 4] = angle;
        verts[o + 5] = tailLift;
        v++;
      }
    }
    draws.push({ kind: s.kind, depth: s.depth, first, count: v - first });
  }
  return { draws, used: v };
}
