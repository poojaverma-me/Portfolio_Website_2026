/**
 * Orcas, sharks and fish that swim the way their bodies actually work.
 *
 * Fish (carangiform swimmers) push water sideways with a wave that runs down
 * the body and grows toward the tail. The midline follows Lighthill's
 * elongated-body form,
 *
 *   h(x, t) = A(x) sin(k x - ω t),   A(x)/L = 0.02 - 0.0825 x + 0.1625 x²
 *
 * (Barrett's envelope, measured on tuna; x runs 0 at the snout to 1 at the
 * tail). The wavelength is about one body length, and the tail-beat frequency
 * follows from the Strouhal number, St = f A / U ≈ 0.3, which nearly every
 * efficient swimmer sits close to. The body is bent by integrating curvature
 * along the spine, so it never stretches.
 *
 * Fish school. Each one steers by three local rules (Reynolds' boids): keep
 * close to the school, match its neighbours' heading, and don't crowd them.
 * A fish that finds the hull or a blade too close does a C-start, the escape
 * reflex: the body snaps into a C away from the threat in about 70 ms, a
 * return stroke throws it out at several body lengths a second, and the
 * school closes up again behind it.
 *
 * Orcas beat their flukes up and down, not side to side. From above that
 * shows as the flukes foreshortening as they pitch, and almost no sideways
 * wriggle. They travel as a pod, and come up to breathe together on a slow
 * cycle: at the top of each rise the blow throws spray, the dorsal fin cuts a
 * line of foam, and each upstroke near the surface leaves a "fluke print", a
 * patch of smooth water the engine turns into a glassy slick.
 *
 * Sharks swim like fish, with a slower, wider body wave, and never bolt.
 *
 * Every animal is a painted sprite bent along its spine (see CreatureLayer in
 * sprites.ts, and scripts/bake-cartoon.py for the paintings).
 */

import { type Layout, type Vec, seeded, toWorld, widthAt } from "./geometry";
import { ATLAS } from "./creature-atlas";
import type { StripWriter } from "./sprites";

/** one body length in body units */
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

export type SwimmerKind = "orca" | "shark" | "fish";

type Spec = {
  kind: SwimmerKind;
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
  /** fish: which school, and which painting */
  school?: number;
  part?: "a" | "b";
};

export type Swimmer = {
  kind: SwimmerKind;
  part: string;
  L: number;
  x: number;
  y: number;
  heading: number;
  /** current and cruising speed, px/s */
  U: number;
  cruise: number;
  /** current turn rate (rad/s), which also bends the body */
  turn: number;
  /** the turn it settles back to */
  turn0: number;
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
  school: number;
  /** orcas: 0 deep .. 1 at the surface, and whether it has blown this rise */
  rise: number;
  blown: boolean;
};

// A pod of three orcas across the upper middle (a big bull, a cow and her
// calf), two sharks further back, and two schools of fish.
const SPECS: Spec[] = [
  { kind: "orca", u: 0.48, vf: -0.36, heading: 24, size: 1.4, depth: 0.9, speed: 0.2, turn: -2, phase: 0 },
  { kind: "orca", u: 0.36, vf: -0.02, heading: 24, size: 1.05, depth: 0.86, speed: 0.26, turn: -2, phase: 0.9 },
  { kind: "orca", u: 0.43, vf: 0.22, heading: 26, size: 0.56, depth: 0.88, speed: 0.48, turn: -2, phase: 1.6 },
  { kind: "shark", u: 0.14, vf: -0.3, heading: 14, size: 0.5, depth: 0.76, speed: 0.5, turn: 2, phase: 2.4 },
  { kind: "shark", u: 0.66, vf: -0.74, heading: 8, size: 0.4, depth: 0.74, speed: 0.55, turn: -7, phase: 0.3 },
];

/** where each school starts, and its heading relative to the voyage, degrees */
const SCHOOLS = [
  { u: 0.2, vf: 0.45, heading: -30, n: 13, part: "a" as const },
  { u: 0.7, vf: 0.2, heading: 160, n: 12, part: "b" as const },
];

export function makeSwimmers(l: Layout): Swimmer[] {
  const specs = [...SPECS];
  const rand = seeded(29);
  SCHOOLS.forEach((sc, k) => {
    for (let i = 0; i < sc.n; i++) {
      specs.push({
        kind: "fish",
        u: sc.u + (rand() - 0.5) * 0.1,
        vf: sc.vf + (rand() - 0.5) * 0.25,
        heading: sc.heading + (rand() - 0.5) * 30,
        size: 0.11 + rand() * 0.04,
        depth: 0.68 + rand() * 0.24,
        speed: 1.7 + rand() * 0.6,
        turn: 0,
        phase: rand() * 6.28,
        school: k,
        part: sc.part,
      });
    }
  });
  const pathAngle = Math.atan2(l.dir.y, l.dir.x);
  return specs.map((s) => {
    const p = toWorld(l, s.u, s.vf * widthAt(l, s.u, 1));
    const L = s.size * l.boatLen;
    return {
      kind: s.kind,
      part: s.part ?? "body",
      L,
      x: p.x,
      y: p.y,
      heading: pathAngle + (s.heading * Math.PI) / 180,
      U: s.speed * L,
      cruise: s.speed * L,
      turn: (s.turn * Math.PI) / 180,
      turn0: (s.turn * Math.PI) / 180,
      beat: s.phase,
      depth0: s.depth,
      depth: s.depth,
      breathe: s.phase * 1.3,
      escape: -1,
      escapeSide: 1,
      escapeCooldown: 0,
      pitch: 0,
      heave: 0,
      school: s.school ?? -1,
      rise: 0,
      blown: false,
    };
  });
}

export type Print = { x: number; y: number; r: number; strength: number };
/** an orca's blow at the surface, and its dorsal fin cutting the water */
export type Blow = { x: number; y: number; r: number; heading: number; U: number };
export type FinCut = { x: number; y: number; r: number; strength: number };

/** the pod's breathing cycle, s, and how much of it is spent up at the surface */
const BREATH_CYCLE = 6.5;

const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/** Steering for a schooling fish: cohesion, alignment, separation, and the edges of the view. */
function school(s: Swimmer, all: Swimmer[], l: Layout, dt: number) {
  let cx = 0;
  let cy = 0;
  let ax = 0;
  let ay = 0;
  let sx = 0;
  let sy = 0;
  let n = 0;
  const reach = s.L * 3.5;
  for (const o of all) {
    if (o === s || o.school !== s.school) continue;
    const dx = o.x - s.x;
    const dy = o.y - s.y;
    const d2 = dx * dx + dy * dy;
    if (d2 > reach * reach) continue;
    n++;
    cx += dx;
    cy += dy;
    ax += Math.cos(o.heading);
    ay += Math.sin(o.heading);
    const d = Math.sqrt(d2) || 1;
    if (d < s.L * 1.1) {
      sx -= (dx / d) * (s.L * 1.1 - d);
      sy -= (dy / d) * (s.L * 1.1 - d);
    }
  }
  let wx = Math.cos(s.heading);
  let wy = Math.sin(s.heading);
  if (n > 0) {
    wx += (cx / n / s.L) * 0.35 + (ax / n) * 0.8 + (sx / s.L) * 1.6;
    wy += (cy / n / s.L) * 0.35 + (ay / n) * 0.8 + (sy / s.L) * 1.6;
  }
  // keep inside the view, turning in well before the edge
  const m = l.boatLen * 0.4;
  if (s.x < m) wx += (m - s.x) / m;
  if (s.x > l.W - m) wx -= (s.x - (l.W - m)) / m;
  if (s.y < m) wy += (m - s.y) / m;
  if (s.y > l.H - m) wy -= (s.y - (l.H - m)) / m;
  const want = Math.atan2(wy, wx);
  const err = wrapAngle(want - s.heading);
  // a fish turns hard but not instantly; the turn rate also bends its body
  const target = Math.max(-3, Math.min(3, err * 2.2));
  s.turn += (target - s.turn) * Math.min(1, dt * 6);
}

/**
 * Advances every swimmer by dt. `threats` are the hull and blades; fish that
 * find one within reach bolt. Returns the fluke prints, blows and fin cuts
 * made this step.
 */
export function stepSwimmers(
  swimmers: Swimmer[],
  dt: number,
  t: number,
  l: Layout,
  threats: { x: number; y: number; r: number }[],
) {
  const prints: Print[] = [];
  const blows: Blow[] = [];
  const cuts: FinCut[] = [];
  for (const s of swimmers) {
    const Lps = s.U / s.L;
    if (s.kind !== "orca") {
      s.escapeCooldown -= dt;
      if (s.kind === "fish" && s.escape < 0 && s.escapeCooldown <= 0) {
        for (const th of threats) {
          const dx = th.x - s.x;
          const dy = th.y - s.y;
          if (dx * dx + dy * dy < (th.r + s.L * 1.5) ** 2) {
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
      } else if (s.kind === "fish") {
        school(s, swimmers, l, dt);
      } else {
        s.turn += (s.turn0 - s.turn) * Math.min(1, dt);
      }
      // drag brings it back to a cruise
      s.U += ((s.cruise - s.U) * dt) / C_DECAY;
      // gliding after the bolt, a fish holds still rather than beating
      const beating = s.escape < 0 || s.escape > 0.5 ? 1 : 0.25;
      s.beat += 2 * Math.PI * Math.min((ST * Lps) / (2 * TAIL_AMP), 14) * dt * beating;
    } else {
      // the pod comes up mid-voyage, the bull first, the cow and calf just after
      const cyc = (t / BREATH_CYCLE + 0.5 - s.breathe * 0.035 + 1) % 1;
      // rise: up over a third of the cycle, a moment at the top, then down
      const up = Math.min(1, Math.max(0, (cyc - 0.45) / 0.25));
      const down = Math.min(1, Math.max(0, (cyc - 0.82) / 0.18));
      const rise = up * up * (3 - 2 * up) * (1 - down * down * (3 - 2 * down));
      s.rise = rise;
      s.depth = Math.min(1, s.depth0 + (1 - s.depth0) * rise - 0.06 * (1 - rise));
      s.beat += 2 * Math.PI * ((ST * Lps) / (2 * TAIL_AMP)) * dt * (rise > 0.9 ? 0.4 : 1);
      const prevHeave = s.heave;
      s.heave = Math.sin(s.beat);
      s.pitch = 0.5 * Math.cos(s.beat); // about 30°, leading the heave
      const c = Math.cos(s.heading);
      const n = Math.sin(s.heading);
      // the blow: once per rise, as the blowhole breaks the surface
      if (rise > 0.92 && !s.blown) {
        s.blown = true;
        const d = (60 - 30) * (s.L / UNITS);
        blows.push({ x: s.x + c * d, y: s.y + n * d, r: s.L * 0.07, heading: s.heading, U: s.U });
      }
      if (rise < 0.3) s.blown = false;
      // the dorsal fin slicing the surface while it's up
      if (rise > 0.88) {
        const d = (8 - 30) * (s.L / UNITS);
        cuts.push({ x: s.x + c * d, y: s.y + n * d, r: s.L * 0.03, strength: (rise - 0.88) * 8 });
      }
      // the top of each upstroke sheds a ring that reaches the surface
      if (prevHeave < 0.98 && s.heave >= 0.98 && s.depth > 0.8) {
        const back = -0.5 * s.L;
        prints.push({
          x: s.x + c * back,
          y: s.y + n * back,
          r: s.L * 0.22,
          strength: (s.depth - 0.75) * 3,
        });
      }
    }
    s.heading += s.turn * dt;
    s.x += Math.cos(s.heading) * s.U * dt;
    s.y += Math.sin(s.heading) * s.U * dt;
  }
  return { prints, blows, cuts };
}

// scratch buffers reused every frame
const th = new Float32Array(N);
const sx = new Float32Array(N);
const sy = new Float32Array(N);

/** Curvature along the body, per body unit, from the swimming kinematics. */
function curvature(s: Swimmer, xu: number) {
  const x = (100 - xu) / UNITS; // 0 at the snout, 1 at the tail
  let kappa = s.turn / Math.max(s.U / s.L, 0.05); // per body length
  if (s.kind !== "orca") {
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
    // orcas barely wriggle sideways; the stroke is vertical
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

/** Where the blowhole is, for the bubbles an orca breathes out under water. */
export function blowhole(s: Swimmer): Vec {
  const d = (60 - 30) * (s.L / UNITS);
  return { x: s.x + Math.cos(s.heading) * d, y: s.y + Math.sin(s.heading) * d };
}

/** Cross-sections per animal: enough for a smooth bend at its size. */
const SECTIONS: Record<SwimmerKind, number> = { orca: 64, shark: 40, fish: 14 };
/**
 * Columns across each animal, in body units: the outer strips carry the
 * flippers, so they can scull without stretching the body between them.
 */
const COLUMNS: Record<SwimmerKind, number[]> = {
  orca: [-1, -30, 0, 30, 1],
  shark: [-1, -16, 0, 16, 1],
  fish: [-1, 0, 1],
};
/** Where each kind's flippers sit along the body (x from, x to), and how far they scull. */
const FLIPPERS: Record<SwimmerKind, [number, number, number]> = {
  orca: [20, 56, 0.09],
  shark: [10, 52, 0.04],
  fish: [20, 60, 0],
};
/** Where an orca's flukes begin, in body units (the narrowest point of the tail stock). */
const FLUKE_BASE = -64;

type Part = { u0: number; v0: number; u1: number; v1: number; x0: number; x1: number; y0: number; y1: number };

const ramp = (a: number, b: number, x: number) => Math.min(1, Math.max(0, (x - a) / (b - a)));
const row = new Float32Array(16 * 2);

/** Lays one swimmer out as strips bent along its spine, one strip per pair of columns. */
export function writeSwimmer(s: Swimmer, w: StripWriter) {
  const a = (ATLAS[s.kind].parts as Record<string, Part>)[s.part];
  const K = SECTIONS[s.kind];
  const cols = COLUMNS[s.kind].map((c) => (c === -1 ? a.y0 : c === 1 ? a.y1 : c));
  const C = cols.length;
  if (!w.fits(2 * K * (C - 1) + 2 * C)) return;
  bend(s);
  const scale = s.L / UNITS;
  const cos = Math.cos(s.heading);
  const sin = Math.sin(s.heading);
  const orca = s.kind === "orca";
  // the flukes beat up and down: they foreshorten as they pitch, and look
  // a little bigger near the top of the stroke, nearer the eye
  const foreshorten = Math.cos(s.pitch);
  const near = orca ? 1 + 0.09 * s.heave : 1;
  const lift = orca ? 0.12 * Math.max(0, s.heave) : 0;
  const [f0, f1, scull] = FLIPPERS[s.kind];
  const stroke = scull * Math.sin(s.beat * 0.5 + 0.8);
  // every strip runs nose to tail; work out each section once per strip
  for (let c = 0; c < C - 1; c++) {
    w.begin(s.kind);
    for (let i = 0; i < K; i++) {
      const f = i / (K - 1);
      const x = a.x0 + (a.x1 - a.x0) * f;
      let xs = x;
      let tailLift = 0;
      let spread = 1;
      if (orca && x < FLUKE_BASE + 4) {
        const wgt = ramp(FLUKE_BASE + 4, FLUKE_BASE - 6, x);
        xs = x < FLUKE_BASE ? FLUKE_BASE + (x - FLUKE_BASE) * foreshorten : x;
        spread = 1 + (near - 1) * wgt;
        tailLift = lift * wgt;
      }
      // flippers scull: the outer strips widen and narrow a little
      const fin = scull ? ramp(f0 - 6, f0 + 6, x) * ramp(f1 + 6, f1 - 6, x) : 0;
      const finSpread = 1 + stroke * fin;
      // the spine's angle here, for turning the painted normals
      let k = (xs - X0) / DX;
      k = k < 0 ? 0 : k > N - 1.001 ? N - 1.001 : k;
      const j = Math.floor(k);
      const angle = s.heading + th[j] + (th[j + 1] - th[j]) * (k - j);
      for (const cc of [c, c + 1]) {
        const y0 = cols[cc];
        const inner = cc === 0 || cc === C - 1 ? cols[cc === 0 ? 1 : C - 2] : y0;
        // only the outermost vertices move with the flippers
        const y = (inner + (y0 - inner) * finSpread) * spread;
        const [bx, by] = onSpine(xs, y);
        const lx = (bx - 30) * scale;
        const ly = by * scale;
        row[0] = s.x + lx * cos - ly * sin;
        row[1] = s.y + lx * sin + ly * cos;
        const u = a.u0 + (a.u1 - a.u0) * f;
        const v = a.v0 + ((cols[cc] - a.y0) / (a.y1 - a.y0)) * (a.v1 - a.v0);
        w.vertex(row[0], row[1], u, v, angle, tailLift, 1, s.depth);
      }
    }
    w.end();
  }
}
