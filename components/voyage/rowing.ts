/**
 * Rowing, as a force balance on the boat rather than an easing curve.
 *
 *   m dv/dt = T(t) - c1 v - c2 v²
 *
 * T is the blade force during the drive, a half-sine over the drive with only
 * its fore-and-aft component (cos of the oar angle) moving the boat. The hull
 * resists with skin friction (linear) and form and wave drag (quadratic). Speed
 * therefore surges on every drive and sags on every recovery, which is how a
 * real boat moves. The rower never stops: the boat rows on out of the top
 * right corner, and `exit` says when it has gone.
 *
 * Units are boat lengths and seconds, per unit mass. The ratio of stroke
 * period to the hull's glide time constant (about 0.35) matches a real boat, so
 * the surge looks right even though the whole thing runs at a brisk,
 * cinematic pace. The trajectory is integrated once up front at 240 Hz and
 * sampled every frame, so it is identical on every device.
 */

import type { Layout } from "./geometry";
import { smooth } from "./geometry";

/** stroke period, s */
export const STROKE = 0.72;
/** fraction of the stroke spent driving */
const DRIVE = 0.42;
/** cruising speed, boat lengths per second */
const V_CRUISE = 2.0;

// hull drag: skin friction and form drag
const C1 = 0.25;
const C2 = 0.29;

// oar angle in degrees, blades toward the bow at the catch
export const CATCH = 48;
export const FINISH = -28;

const DT = 1 / 240;
const MAX_T = 9;

const easeSine = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Oar angle through a stroke: drive for the first DRIVE of it, then recovery. */
function strokeAngle(x: number) {
  if (x < DRIVE) return lerp(CATCH, FINISH, easeSine(x / DRIVE));
  return lerp(FINISH, CATCH, easeSine((x - DRIVE) / (1 - DRIVE)));
}
/** Blade in the water: dips just before the catch, lifts just after the finish. */
function strokeBlade(x: number) {
  const y = x > 0.9 ? x - 1 : x;
  return smooth(-0.04, 0.02, y) * (1 - smooth(DRIVE - 0.02, DRIVE + 0.04, y));
}
/** Blade force over the drive, as a fraction of its peak. */
const bladeForce = (x: number) =>
  x < DRIVE ? Math.pow(Math.sin((Math.PI * x) / DRIVE), 1.2) : 0;

export type BoatState = {
  /** progress along the voyage line, as geometry.ts uses it */
  u: number;
  /** speed, px/s */
  v: number;
  /** oar angle, degrees */
  alpha: number;
  /** 1 when the blades are buried */
  inWater: number;
  /** blade force as a fraction of its peak */
  thrust: number;
};

export type Voyage = {
  sample: (t: number) => BoatState;
  /** when the boat has rowed out of sight */
  exit: number;
};

/** Plans the crossing; the boat is out of sight once its progress passes uExit. */
export function planVoyage(l: Layout, uExit: number): Voyage {
  // peak blade force that balances hull drag at cruising speed over a stroke
  let mean = 0;
  const n = 400;
  for (let i = 0; i < n; i++) {
    const x = ((i + 0.5) / n) * DRIVE;
    mean += bladeForce(x) * Math.cos((strokeAngle(x) * Math.PI) / 180);
  }
  mean = (mean / n) * DRIVE;
  const tPeak = (C1 * V_CRUISE + C2 * V_CRUISE * V_CRUISE) / mean;

  const steps = Math.ceil(MAX_T / DT) + 1;
  const S = new Float32Array(steps);
  const V = new Float32Array(steps);
  const A = new Float32Array(steps);
  const W = new Float32Array(steps);
  const F = new Float32Array(steps);

  const distance = ((uExit - l.bStart) * l.L) / l.boatLen;
  let s = 0;
  // the boat comes in already under way, early in a recovery
  let v = V_CRUISE * 0.96;
  let clock = DRIVE + 0.12;
  let exit = MAX_T;

  for (let i = 0; i < steps; i++) {
    const x = ((clock % 1) + 1) % 1;
    const alpha = strokeAngle(x);
    const force = bladeForce(x);
    const thrust = tPeak * force * Math.cos((alpha * Math.PI) / 180);
    v = Math.max(0, v + (thrust - C1 * v - C2 * v * v) * DT);
    s += v * DT;
    S[i] = s;
    V[i] = v;
    A[i] = alpha;
    W[i] = strokeBlade(x);
    F[i] = force;
    if (exit === MAX_T && s >= distance) exit = i * DT;
    clock += DT / STROKE;
  }

  const last = steps - 1;
  return {
    exit,
    sample(t: number): BoatState {
      const f = Math.min(Math.max(t, 0) / DT, last);
      const i = Math.floor(f);
      const j = Math.min(i + 1, last);
      const k = f - i;
      const mix = (a: Float32Array) => a[i] + (a[j] - a[i]) * k;
      return {
        u: l.bStart + (mix(S) * l.boatLen) / l.L,
        v: mix(V) * l.boatLen,
        alpha: mix(A),
        inWater: mix(W),
        thrust: mix(F),
      };
    },
  };
}
