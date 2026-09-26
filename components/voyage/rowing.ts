/**
 * Rowing, as a force balance on the boat rather than an easing curve.
 *
 *   m dv/dt = T(t) - (c1 + b c1b) v - (c2 + b c2b) v²
 *
 * T is the blade force during the drive, a half-sine over the drive with only
 * its fore-and-aft component (cos of the oar angle) moving the boat. The hull
 * resists with skin friction (linear) and form and wave drag (quadratic). Speed
 * therefore surges on every drive and sags on every recovery, which is how a
 * real boat moves.
 *
 * To stop, the rower does what rowers do: finishes the stroke and holds the
 * blades square in the water (b ramps to 1). That adds a lot of drag, and the
 * boat comes to rest on its mooring. Braking starts once the stopping distance
 * at the current speed covers what is left.
 *
 * Units are boat lengths and seconds, per unit mass. The ratio of stroke
 * period to the hull's glide time constant (about 0.35) matches a real boat, so
 * the surge looks right even though the whole thing runs at a brisk,
 * cinematic pace. The trajectory is integrated once up front at 240 Hz and
 * sampled every frame, so it is identical on every device.
 */

import { type Layout, smooth } from "./geometry";

/** stroke period, s */
export const STROKE = 0.72;
/** fraction of the stroke spent driving */
const DRIVE = 0.42;
/** cruising speed, boat lengths per second */
const V_CRUISE = 2.0;

// hull drag and the extra drag of blades held square
const C1 = 0.25;
const C2 = 0.29;
const C1B = 3.6;
const C2B = 2.2;
/** seconds for the blades to bite when braking */
const BRAKE_RAMP = 0.18;

// oar angle in degrees, blades toward the bow at the catch
export const CATCH = 48;
export const FINISH = -28;
const BRAKE = 3;
const REST = -6;

/** seconds the finished scene is held before the page appears */
export const HOLD = 0.55;

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

export type Mode = "row" | "brake" | "rest";

export type BoatState = {
  /** progress along the voyage line, as geometry.ts uses it */
  u: number;
  /** speed, px/s */
  v: number;
  /** position within the stroke, 0..1 */
  phase: number;
  /** oar angle, degrees */
  alpha: number;
  /** 1 when the blades are buried */
  inWater: number;
  mode: Mode;
  /** blade force as a fraction of its peak */
  thrust: number;
};

export type Voyage = {
  sample: (t: number) => BoatState;
  /** when the boat comes to rest */
  arrive: number;
  /** when the intro ends */
  end: number;
};

export function planVoyage(l: Layout): Voyage {
  const distance = ((1 - l.bStart) * l.L) / l.boatLen;

  // peak blade force that balances hull drag at cruising speed over a stroke
  let mean = 0;
  const n = 400;
  for (let i = 0; i < n; i++) {
    const x = ((i + 0.5) / n) * DRIVE;
    mean += bladeForce(x) * Math.cos((strokeAngle(x) * Math.PI) / 180);
  }
  mean = (mean / n) * DRIVE;
  const tPeak = (C1 * V_CRUISE + C2 * V_CRUISE * V_CRUISE) / mean;

  const stopDistance = (v: number) => {
    const c1 = C1 + C1B;
    const c2 = C2 + C2B;
    return Math.log(1 + (c2 * v) / c1) / c2;
  };

  const steps = Math.ceil(MAX_T / DT) + 1;
  const S = new Float32Array(steps);
  const V = new Float32Array(steps);
  const X = new Float32Array(steps);
  const A = new Float32Array(steps);
  const W = new Float32Array(steps);
  const F = new Float32Array(steps);
  const M = new Uint8Array(steps);

  let s = 0;
  // the boat comes in already under way, early in a recovery
  let v = V_CRUISE * 0.96;
  let clock = DRIVE + 0.12;
  let mode: Mode = "row";
  let brakeAt = 0;
  let restAt = 0;
  let alphaAtBrake = 0;
  let arrive = MAX_T;
  let last = 0;

  for (let i = 0; i < steps; i++) {
    const t = i * DT;
    const x = ((clock % 1) + 1) % 1;
    let alpha: number;
    let blade: number;
    let force = 0;
    let bite = 0;

    if (mode === "row") {
      alpha = strokeAngle(x);
      blade = strokeBlade(x);
      force = bladeForce(x);
      // brake at the end of a drive, once braking would stop us in time
      if (x >= DRIVE && distance - s <= stopDistance(v) + v * BRAKE_RAMP * 0.5) {
        mode = "brake";
        brakeAt = t;
        alphaAtBrake = alpha;
      }
    } else {
      const since = t - brakeAt;
      bite = smooth(0, BRAKE_RAMP, since);
      alpha = lerp(alphaAtBrake, BRAKE, easeSine(Math.min(since / 0.22, 1)));
      blade = smooth(0, 0.1, since);
      if (mode === "brake" && v < 0.05) {
        mode = "rest";
        restAt = t;
        arrive = t;
      }
      if (mode === "rest") {
        // lift the blades and let them rest flat on the water
        const k = easeSine(Math.min(Math.max((t - restAt - 0.1) / 0.5, 0), 1));
        alpha = lerp(BRAKE, REST, k);
        blade = 1 - k;
        bite = 1;
      }
    }

    const thrust = tPeak * force * Math.cos((alpha * Math.PI) / 180);
    const drag = (C1 + bite * C1B) * v + (C2 + bite * C2B) * v * v;
    v = Math.max(0, v + (thrust - drag) * DT);
    if (mode === "rest") v = 0;
    s += v * DT;

    S[i] = s;
    V[i] = v;
    X[i] = x;
    A[i] = alpha;
    W[i] = blade;
    F[i] = force;
    M[i] = mode === "row" ? 0 : mode === "brake" ? 1 : 2;
    last = i;
    clock += DT / STROKE;
    if (mode === "rest" && t > arrive + 1.2) break;
  }

  // integration lands within a hair of the mooring; close the gap exactly
  const scale = distance / S[last];
  const px = l.boatLen * scale;
  const modes: Mode[] = ["row", "brake", "rest"];

  return {
    arrive,
    end: arrive + HOLD,
    sample(t: number): BoatState {
      const f = Math.min(Math.max(t, 0) / DT, last);
      const i = Math.floor(f);
      const j = Math.min(i + 1, last);
      const k = f - i;
      const mix = (a: Float32Array) => a[i] + (a[j] - a[i]) * k;
      const s = mix(S) * scale;
      return {
        u: l.bStart + (1 - l.bStart) * (s / distance),
        v: mix(V) * px,
        phase: X[i],
        alpha: mix(A),
        inWater: mix(W),
        mode: modes[M[i]],
        thrust: mix(F),
      };
    },
  };
}
