/**
 * Sea turtles, which fly through the water rather than paddle.
 *
 * The long front flippers beat together, like wings. On the power stroke they
 * sweep down and back, which from above shows as the flipper swinging back
 * while it foreshortens (it is pointing partly down, away from the eye); on
 * the recovery they come up and forward feathered, edge-on, so they look
 * narrow. The flipper is flexible, so its tip trails behind the sweep. Each
 * power stroke surges the body forward, and it glides on between strokes.
 * The small rear flippers are rudders: they trail behind, splay into a turn
 * and flutter a little in the flow.
 *
 * Drawn as cut-out parts (rear flippers, front flippers, then the shell on
 * top), the left side's flippers being the right side's painting mirrored.
 */

import { type Layout, seeded, toWorld, widthAt } from "./geometry";
import { ATLAS } from "./creature-atlas";
import type { StripWriter } from "./sprites";

/** one body length (head tip to tail tip) in body units, as in the atlas */
const UNITS = 210;
/** where the flippers join the shell, in body units (x forward, y to the right) */
const SHOULDER = { x: 26, y: 40 };
const HIP = { x: -70, y: 34 };
/** stroke frequency, Hz, and how hard each power stroke pushes */
const BEAT = 0.5;

export type Turtle = {
  L: number;
  x: number;
  y: number;
  heading: number;
  turn: number;
  turn0: number;
  U: number;
  cruise: number;
  phase: number;
  depth0: number;
  depth: number;
  /** the front flippers' sweep angle last step, for the flex */
  sweep: number;
  sweepRate: number;
  wander: number;
};

const SPECS = [
  { u: 0.3, vf: 0.4, heading: -12, size: 0.42, depth: 0.88, speed: 0.32, turn: 4, phase: 0 },
  { u: 0.62, vf: -0.36, heading: 18, size: 0.34, depth: 0.84, speed: 0.36, turn: -5, phase: 2.1 },
  { u: 0.8, vf: 0.38, heading: -40, size: 0.28, depth: 0.8, speed: 0.4, turn: 6, phase: 4 },
];

export function makeTurtles(l: Layout): Turtle[] {
  const pathAngle = Math.atan2(l.dir.y, l.dir.x);
  const rand = seeded(53);
  return SPECS.map((s) => {
    const p = toWorld(l, s.u, s.vf * widthAt(l, s.u, 1));
    const L = s.size * l.boatLen;
    return {
      L,
      x: p.x,
      y: p.y,
      heading: pathAngle + (s.heading * Math.PI) / 180,
      turn: (s.turn * Math.PI) / 180,
      turn0: (s.turn * Math.PI) / 180,
      U: s.speed * L,
      cruise: s.speed * L,
      phase: s.phase,
      depth0: s.depth,
      depth: s.depth,
      sweep: 0,
      sweepRate: 0,
      wander: rand() * 10,
    };
  });
}

/**
 * The front flipper's pose at stroke phase φ: how far it has swung back from
 * pointing straight out (radians), its foreshortening as it points down or up,
 * and its width as it feathers.
 */
function frontPose(phi: number) {
  const c = Math.cos(phi);
  const s = Math.sin(phi);
  // forward and up at φ = 0, back and down by φ = π
  const swing = -0.6 + 1.35 * (0.5 - 0.5 * c);
  const elevation = 0.75 * s;
  return {
    swing,
    length: Math.cos(elevation) * 0.92 + 0.08,
    // broad on the power stroke, edge-on on the way back
    width: s > 0 ? 1 : 0.55 + 0.45 * (1 + s),
  };
}

export function stepTurtles(turtles: Turtle[], dt: number, t: number) {
  for (const tu of turtles) {
    const prev = frontPose(tu.phase).swing;
    tu.phase += 2 * Math.PI * BEAT * dt;
    const pose = frontPose(tu.phase);
    tu.sweepRate = dt > 0 ? (pose.swing - prev) / dt : 0;
    tu.sweep = pose.swing;
    // thrust on the power stroke, drag the rest of the time
    const power = Math.max(0, Math.sin(tu.phase));
    tu.U += (tu.cruise * 2.4 * power * power - (tu.U - tu.cruise * 0.45) * 1.4) * dt;
    // a lazy, wandering course
    tu.wander += dt * 0.35;
    tu.turn = tu.turn0 + 0.12 * Math.sin(tu.wander) + 0.06 * Math.sin(tu.wander * 2.3);
    tu.heading += tu.turn * dt;
    tu.x += Math.cos(tu.heading) * tu.U * dt;
    tu.y += Math.sin(tu.heading) * tu.U * dt;
    // rising a little on each stroke, and slowly through the water column
    tu.depth = Math.min(1, tu.depth0 + 0.03 * power + 0.05 * Math.sin(t * 0.4 + tu.phase * 0.1));
  }
}

type Part = { u0: number; v0: number; u1: number; v1: number; x0: number; x1: number; y0: number; y1: number };

/**
 * One flipper as a strip from root to tip, bent by `flex` (radians of extra
 * bend at the tip). `side` is +1 for the right, -1 for the left (mirrored).
 */
function flipper(
  w: StripWriter,
  tu: Turtle,
  p: Part,
  root: { x: number; y: number },
  side: number,
  angle: number,
  length: number,
  width: number,
  flex: number,
) {
  const K = 8;
  const scale = tu.L / UNITS;
  const ch = Math.cos(tu.heading);
  const sh = Math.sin(tu.heading);
  // root position in the world
  const rx = root.x * scale;
  const ry = root.y * side * scale;
  let px = tu.x + rx * ch - ry * sh;
  let py = tu.y + rx * sh + ry * ch;
  const span = (p.x1 - p.x0) * scale * length;
  const step = span / (K - 1);
  w.begin("turtle");
  for (let i = 0; i < K; i++) {
    const f = i / (K - 1);
    // the bend grows toward the tip
    const a = tu.heading + side * (angle + flex * f * f);
    const nx = -Math.sin(a);
    const ny = Math.cos(a);
    const u = p.u0 + (p.u1 - p.u0) * f;
    // the left flipper is the right one mirrored: its painted top edge stays
    // the leading edge, so its local y runs the other way
    for (const [yy, v] of [
      [p.y0, p.v0],
      [p.y1, p.v1],
    ]) {
      const o = yy * scale * width * side;
      w.vertex(px + nx * o, py + ny * o, u, v, a, 0, side > 0 ? 1 : -1, tu.depth - 0.01);
    }
    px += Math.cos(a) * step;
    py += Math.sin(a) * step;
  }
  w.end();
}

export function writeTurtle(tu: Turtle, w: StripWriter) {
  if (!w.fits(120)) return;
  const parts = ATLAS.turtle.parts;
  const scale = tu.L / UNITS;
  // the rear flippers trail behind, splay into the turn and flutter
  const steer = Math.max(-0.5, Math.min(0.5, tu.turn * 2));
  const flutter = 0.08 * Math.sin(tu.phase * 2);
  for (const side of [1, -1]) {
    // pointing back and out: about 140° from the heading
    flipper(w, tu, parts.rear, HIP, side, 2.45 - side * steer + flutter, 1, 1, 0);
  }
  // the front flippers: pointing straight out at swing 0, swung back by `sweep`
  const pose = frontPose(tu.phase);
  const flex = Math.max(-0.5, Math.min(0.5, -tu.sweepRate * 0.18));
  for (const side of [1, -1]) {
    flipper(w, tu, parts.front, SHOULDER, side, Math.PI / 2 + pose.swing, pose.length, pose.width, flex);
  }
  // the shell, head and tail, rigid, on top
  const b = parts.body;
  const ch = Math.cos(tu.heading);
  const sh = Math.sin(tu.heading);
  w.begin("turtle");
  for (const [x, u] of [
    [b.x0, b.u0],
    [b.x1, b.u1],
  ]) {
    for (const [y, v] of [
      [b.y0, b.v0],
      [b.y1, b.v1],
    ]) {
      const lx = (x - 0) * scale;
      const ly = y * scale;
      w.vertex(tu.x + lx * ch - ly * sh, tu.y + lx * sh + ly * ch, u, v, tu.heading, 0, 1, tu.depth);
    }
  }
  w.end();
}

/** Where the turtle's head is, for the ring it makes when it comes up for air. */
export function headOf(tu: Turtle) {
  const d = 88 * (tu.L / UNITS);
  return { x: tu.x + Math.cos(tu.heading) * d, y: tu.y + Math.sin(tu.heading) * d };
}
