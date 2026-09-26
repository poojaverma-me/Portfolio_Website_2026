/**
 * The shape of the voyage. The boat rows along a gently bowed line from off
 * screen at the bottom left to its mooring at the top right, and the water is
 * a brush stroke laid along that line: narrow at the boat, widening behind it.
 *
 * Everything is in CSS pixels with y pointing down. The shader mirrors
 * bodySd() exactly, minus the edge noise, so the bubbles can be kept inside
 * the water from JavaScript.
 */

export type Vec = { x: number; y: number };

export type Layout = {
  W: number;
  H: number;
  portrait: boolean;
  /** hull length in px; every other size is a multiple of it */
  boatLen: number;
  /** where the line starts, off screen */
  p0: Vec;
  dir: Vec;
  perp: Vec;
  /** straight-line length of the voyage */
  L: number;
  /** sideways bow of the line at its midpoint, px (negative bows up and left) */
  bend: number;
  /** half-width of the water at the boat and far behind it */
  wHead: number;
  wTail: number;
  /** how quickly the wake widens behind the boat */
  spread: number;
  /** how far the rounded bow wave runs ahead of the boat's centre */
  lead: number;
  /** boat progress at t = 0, below zero so it starts off screen */
  bStart: number;
};

export const clamp = (x: number, a: number, b: number) =>
  x < a ? a : x > b ? b : x;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

export function makeLayout(W: number, H: number): Layout {
  const portrait = H > W * 1.05;
  const boatLen = clamp(
    portrait ? W * 0.38 : Math.min(W, H) * 0.34,
    100,
    330,
  );
  const p0 = portrait
    ? { x: -W * 0.22, y: H * 1.08 }
    : { x: -W * 0.12, y: H * 1.12 };
  const p1 = portrait
    ? { x: W * 0.66, y: H * 0.25 }
    : { x: W * 0.75, y: H * 0.25 };
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const L = Math.hypot(dx, dy);
  const dir = { x: dx / L, y: dy / L };
  return {
    W,
    H,
    portrait,
    boatLen,
    p0,
    dir,
    perp: { x: -dir.y, y: dir.x },
    L,
    bend: -L * 0.035,
    wHead: boatLen * 0.36,
    wTail: boatLen * (portrait ? 1.22 : 1.4),
    spread: boatLen * 1.1,
    lead: boatLen * 0.62,
    bStart: -0.07,
  };
}

/** Point on the voyage line at progress u (0 = start, 1 = mooring). */
export function center(l: Layout, u: number): Vec {
  const off = l.bend * 4 * u * (1 - u);
  return {
    x: l.p0.x + l.dir.x * u * l.L + l.perp.x * off,
    y: l.p0.y + l.dir.y * u * l.L + l.perp.y * off,
  };
}

/** Unit direction of travel at progress u. */
export function tangent(l: Layout, u: number): Vec {
  const k = l.bend * 4 * (1 - 2 * u);
  const x = l.dir.x * l.L + l.perp.x * k;
  const y = l.dir.y * l.L + l.perp.y * k;
  const n = Math.hypot(x, y);
  return { x: x / n, y: y / n };
}

/** A point v px to the side of the line at progress u. */
export function toWorld(l: Layout, u: number, v: number): Vec {
  const c = center(l, u);
  return { x: c.x + l.perp.x * v, y: c.y + l.perp.y * v };
}

/** Half-width of the water at u once the boat has reached `head`. */
export function widthAt(l: Layout, u: number, head: number) {
  const behind = (head - u) * l.L;
  if (behind < 0) return 0;
  return l.wHead + (l.wTail - l.wHead) * (1 - Math.exp(-behind / l.spread));
}

/** Signed distance to the edge of the main body of water (negative inside). */
export function bodySd(l: Layout, head: number, x: number, y: number) {
  const qx = x - l.p0.x;
  const qy = y - l.p0.y;
  const u = (qx * l.dir.x + qy * l.dir.y) / l.L;
  const v = qx * l.perp.x + qy * l.perp.y - l.bend * 4 * u * (1 - u);
  const behind = (head - u) * l.L;
  if (behind >= 0) {
    const w =
      l.wHead + (l.wTail - l.wHead) * (1 - Math.exp(-behind / l.spread));
    return Math.abs(v) - w;
  }
  const cap = Math.hypot(-behind / l.lead, v / l.wHead);
  return (cap - 1) * l.wHead;
}

/** Small, fast, seeded random so every visit plays the same voyage. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Progress at which a boat on the line is fully out of sight, oars and all. */
export function exitProgress(l: Layout) {
  const m = l.boatLen * 0.95;
  for (let u = 1; u < 3; u += 0.005) {
    const c = center(l, u);
    if (c.x > l.W + m || c.y < -m) return u;
  }
  return 3;
}
