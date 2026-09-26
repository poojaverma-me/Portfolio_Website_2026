/**
 * Runs the voyage: one clock drives the boat, the oars, the water, the
 * creatures and the bubbles, so everything stays in step.
 *
 * The boat does not glide at a constant speed. Time is warped by the rowing
 * stroke, so it surges on each drive and eases on each recovery, and it enters
 * already moving and comes to rest at its mooring.
 */

import { CREATURES, blowhole, drawCreatures, poseOf } from "./creatures";
import {
  type Layout,
  bodySd,
  center,
  clamp,
  lerp,
  makeLayout,
  seeded,
  smooth,
  tangent,
  toWorld,
  widthAt,
} from "./geometry";
import { FRAG, MAX_DROPS, MAX_PUDDLES, VERT } from "./water-shader";

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

/** seconds from the corner to the mooring */
export const TRAVEL = 4.2;
/** seconds the finished scene holds before the page is revealed */
export const HOLD = 1.1;
export const END = TRAVEL + HOLD;

/** one oar stroke; TRAVEL is a whole number of them so the surge lands at rest */
const STROKE = 1.05;
const SURGE = 0.3;

// oar sweep in degrees: blades toward the bow at the catch, aft at the finish
const CATCH = 48;
const FINISH = -28;
const REST = -6;

// boat units (1/200 of the hull), matching Boat.tsx
const PIVOT_X = -6;
const PIVOT_Y = 38;
const BLADE = 113;
const GRIP = 30;
const SHOULDER_X = 12;
const UPPER_ARM = 19;
const FOREARM = 21;

const LIFE_SCALE = 0.5;
const MAX_BUBBLES = 320;

const envelope = (t: number) => 1 - smooth(TRAVEL * 0.8, TRAVEL, t);

/** Boat progress along the line at time t. */
function progress(l: Layout, t: number) {
  const tc = clamp(t, 0, TRAVEL);
  const tau =
    tc -
    envelope(tc) * ((SURGE * STROKE) / TAU) * Math.sin((TAU * tc) / STROKE);
  const x = clamp(tau / TRAVEL, 0, 1);
  return lerp(l.bStart, 1, 1 - Math.pow(1 - x, 2.1));
}

const easeSine = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x);

/** Drive from 0.3 to 0.7 of the stroke, recovery the rest of the way round. */
function rowAngle(phase: number) {
  if (phase >= 0.3 && phase < 0.7) {
    return lerp(CATCH, FINISH, easeSine((phase - 0.3) / 0.4));
  }
  return lerp(FINISH, CATCH, easeSine((((phase - 0.7) % 1) + 1) % 1 / 0.6));
}
const bladeInWater = (phase: number) =>
  smooth(0.26, 0.32, phase) * (1 - smooth(0.68, 0.74, phase));

const crossed = (a: number, b: number, x: number) =>
  b >= a ? a < x && b >= x : a < x || b >= x;

type EdgeDrop = {
  u: number;
  v: number;
  r: number;
  k: number;
  drift: number;
  born: number;
};
type Splash = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  k: number;
  born: number;
  life: number;
  flick: boolean;
};
type Puddle = { x: number; y: number; born: number; strength: number };
type Bubble = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  born: number;
  life: number;
  ph: number;
};

/** Splashes thrown clear of the banks as the boat passes, some still joined on. */
function makeEdgeDrops(l: Layout): EdgeDrop[] {
  const rand = seeded(7);
  const drops: EdgeDrop[] = [];
  const count = 13;
  for (let i = 0; i < count; i++) {
    const u = 0.03 + ((i + rand() * 0.8) / count) * 0.93;
    const side = rand() < 0.5 ? -1 : 1;
    const w = widthAt(l, u, 1);
    const nearBoat = u > 0.84;
    const attached = rand() < 0.5;
    const r =
      l.boatLen *
      (nearBoat
        ? 0.03 + rand() * 0.04
        : attached
          ? 0.07 + rand() * 0.09
          : 0.035 + rand() * 0.06);
    const dist = attached ? w * (0.92 + rand() * 0.12) : w * (1.1 + rand() * 0.28) + r;
    const drift = side * l.boatLen * (0.02 + rand() * 0.03);
    drops.push({ u, v: side * dist, r, k: attached ? r * 1.1 : r * 0.7, drift, born: -1 });
    if (!attached && rand() < 0.6) {
      // a second, smaller circle turns a round drop into a teardrop
      const r2 = r * (0.55 + rand() * 0.25);
      drops.push({
        u: u + ((rand() < 0.5 ? -1 : 1) * r * 0.95) / l.L,
        v: side * (dist + (rand() - 0.5) * r * 0.6),
        r: r2,
        k: r * 0.95,
        drift,
        born: -1,
      });
    }
  }
  return drops;
}

export type VoyageOptions = {
  /** the overlay; the two canvases are added to it, beneath the boat */
  host: HTMLElement;
  boat: HTMLElement;
  onDone: () => void;
  /** development only: hold the scene at this many seconds */
  freezeAt?: number | null;
};

export function startVoyage({ host, boat, onDone, freezeAt = null }: VoyageOptions) {
  const glCanvas = document.createElement("canvas");
  const sparkCanvas = document.createElement("canvas");
  for (const c of [glCanvas, sparkCanvas]) {
    c.setAttribute("aria-hidden", "true");
    Object.assign(c.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
    });
  }
  host.insertBefore(sparkCanvas, host.firstChild);
  host.insertBefore(glCanvas, sparkCanvas);

  let raf = 0;
  let safety = 0;
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    onDone();
  };

  const cleanup = () => {
    cancelAnimationFrame(raf);
    clearTimeout(safety);
    window.removeEventListener("resize", resize);
    glCanvas.removeEventListener("webglcontextlost", finish);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    glCanvas.remove();
    sparkCanvas.remove();
  };

  // Without a GPU the browser would draw this in software: a slideshow for the
  // visitor and a frozen main thread. Better to skip straight to the page.
  const gl = glCanvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    powerPreference: "high-performance",
    failIfMajorPerformanceCaveat: true,
  });
  const sctx = sparkCanvas.getContext("2d");
  const lifeCanvas = document.createElement("canvas");
  const lctx = lifeCanvas.getContext("2d", { alpha: false });
  if (!gl || !sctx || !lctx) {
    finish();
    return cleanup;
  }

  // --- WebGL -----------------------------------------------------------------
  // Compiled without asking for the result: asking blocks until the GPU is done,
  // which can freeze the page for a moment on a slow phone. The loop polls
  // instead and starts the voyage once the program is ready.
  const vs = gl.createShader(gl.VERTEX_SHADER)!;
  const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(vs, VERT);
  gl.shaderSource(fs, FRAG);
  gl.compileShader(vs);
  gl.compileShader(fs);
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  const parallel = gl.getExtension("KHR_parallel_shader_compile");

  const locate = (g: WebGLRenderingContext) => {
    const U = (name: string) => g.getUniformLocation(prog, name);
    return {
      res: U("uRes"),
      scale: U("uScale"),
      view: U("uView"),
      time: U("uTime"),
      p0: U("uP0"),
      dir: U("uDir"),
      perp: U("uPerp"),
      L: U("uL"),
      bend: U("uBend"),
      head: U("uHead"),
      wHead: U("uWHead"),
      wTail: U("uWTail"),
      spread: U("uSpread"),
      lead: U("uLead"),
      boatLen: U("uBoatLen"),
      boat: U("uBoat"),
      boatDir: U("uBoatDir"),
      wake: U("uWake"),
      sun: U("uSun"),
      drops: U("uDrops"),
      puddles: U("uPuddles"),
      life: U("uLife"),
    };
  };
  let loc: ReturnType<typeof locate> | null = null;

  /** Finishes setting up once the program has linked; false if it failed. */
  function setup(g: WebGLRenderingContext) {
    if (!g.getProgramParameter(prog, g.LINK_STATUS)) {
      console.warn(g.getShaderInfoLog(vs), g.getShaderInfoLog(fs), g.getProgramInfoLog(prog));
      return false;
    }
    g.useProgram(prog);
    const buf = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, buf);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
    const aPos = g.getAttribLocation(prog, "aPos");
    g.enableVertexAttribArray(aPos);
    g.vertexAttribPointer(aPos, 2, g.FLOAT, false, 0, 0);

    const tex = g.createTexture();
    g.activeTexture(g.TEXTURE0);
    g.bindTexture(g.TEXTURE_2D, tex);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);

    loc = locate(g);
    g.uniform1i(loc.life, 0);
    return true;
  }

  // --- the boat's moving parts -----------------------------------------------
  const part = (name: string) =>
    boat.querySelector<SVGElement>(`[data-part="${name}"]`);
  const oarS = part("oar-s");
  const oarP = part("oar-p");
  const bladeS = part("s-blade");
  const bladeP = part("p-blade");
  const rower = part("rower");
  const hat = part("hat");
  const arms = (["s", "p"] as const).map((s) => ({
    side: s === "s" ? 1 : -1,
    sleeve: part(`sleeve-${s}`),
    fore: part(`fore-${s}`),
    hand: part(`hand-${s}`),
  }));

  // --- state -------------------------------------------------------------------
  let layout = makeLayout(1, 1);
  let edgeDrops: EdgeDrop[] = [];
  let quality = 1;
  let q = 1;
  let sparkScale = 1;
  const splashes: Splash[] = [];
  const puddles: Puddle[] = [];
  const bubbles: Bubble[] = [];
  const dropBuf = new Float32Array(MAX_DROPS * 4);
  const puddleBuf = new Float32Array(MAX_PUDDLES * 4);
  const rand = seeded(11);
  const breath = CREATURES.map(() => 0.4 + rand() * 1.6);
  let prevPhase = 0;
  let wakeMem = 0;

  function resize() {
    const W = host.clientWidth || window.innerWidth;
    const H = host.clientHeight || window.innerHeight;
    const born = edgeDrops.map((d) => d.born);
    layout = makeLayout(W, H);
    edgeDrops = makeEdgeDrops(layout);
    edgeDrops.forEach((d, i) => (d.born = born[i] ?? -1));

    const dpr = window.devicePixelRatio || 1;
    q = Math.min(dpr, 1.25) * quality;
    glCanvas.width = Math.round(W * q);
    glCanvas.height = Math.round(H * q);
    sparkScale = Math.min(dpr, 2);
    sparkCanvas.width = Math.round(W * sparkScale);
    sparkCanvas.height = Math.round(H * sparkScale);
    lifeCanvas.width = Math.ceil(W * LIFE_SCALE);
    lifeCanvas.height = Math.ceil(H * LIFE_SCALE);
    const size = `${layout.boatLen * 2}px`;
    boat.style.width = size;
    boat.style.height = size;
  }
  resize();
  window.addEventListener("resize", resize);
  glCanvas.addEventListener("webglcontextlost", finish);

  // --- helpers -------------------------------------------------------------------
  let bx = 0;
  let by = 0;
  let heading = 0;
  const toWorldFromBoat = (lx: number, ly: number) => {
    const s = layout.boatLen / 200;
    const c = Math.cos(heading);
    const n = Math.sin(heading);
    return { x: bx + (lx * c - ly * n) * s, y: by + (lx * n + ly * c) * s };
  };
  const bladeAt = (alpha: number, side: number) =>
    toWorldFromBoat(
      PIVOT_X + BLADE * Math.sin(alpha * DEG),
      side * (PIVOT_Y + BLADE * Math.cos(alpha * DEG)),
    );

  const cluster = (x: number, y: number, n: number, spread: number, t: number, big = 1) => {
    const B = layout.boatLen;
    for (let i = 0; i < n; i++) {
      if (bubbles.length >= MAX_BUBBLES) bubbles.shift();
      bubbles.push({
        x: x + (rand() - 0.5) * spread * 2,
        y: y + (rand() - 0.5) * spread * 2,
        r: B * (0.006 + rand() * rand() * 0.03) * big,
        vx: (rand() - 0.5) * B * 0.05,
        vy: (rand() - 0.5) * B * 0.05,
        born: t + rand() * 0.25,
        life: 1.1 + rand() * 1.8,
        ph: rand() * TAU,
      });
    }
  };

  function onCatch(t: number, alpha: number) {
    const B = layout.boatLen;
    for (const side of [1, -1]) {
      const p = bladeAt(alpha, side);
      splashes.push({ x: p.x, y: p.y, vx: 0, vy: 0, r: B * 0.048, k: B * 0.045, born: t, life: 1.1, flick: false });
      cluster(p.x, p.y, 7, B * 0.04, t);
    }
  }

  function onRelease(t: number, alpha: number, strength: number) {
    const B = layout.boatLen;
    for (const side of [1, -1]) {
      const p = bladeAt(alpha, side);
      puddles.push({ x: p.x, y: p.y, born: t, strength });
      if (puddles.length > MAX_PUDDLES) puddles.shift();
      // drips flicked off the blade as it leaves the water
      const pivot = toWorldFromBoat(PIVOT_X, side * PIVOT_Y);
      const ox = p.x - pivot.x;
      const oy = p.y - pivot.y;
      const on = Math.hypot(ox, oy) || 1;
      for (let i = 0; i < 2; i++) {
        const sp = B * (0.35 + rand() * 0.3);
        splashes.push({
          x: p.x,
          y: p.y,
          vx: (ox / on) * sp - Math.cos(heading) * B * 0.2 + (rand() - 0.5) * B * 0.15,
          vy: (oy / on) * sp - Math.sin(heading) * B * 0.2 + (rand() - 0.5) * B * 0.15,
          r: B * (0.014 + rand() * 0.014),
          k: B * 0.02,
          born: t,
          life: 0.55 + rand() * 0.2,
          flick: true,
        });
      }
    }
    while (splashes.length > 14) splashes.shift();
  }

  function elbow(sx: number, sy: number, hx: number, hy: number, side: number) {
    const dx = hx - sx;
    const dy = hy - sy;
    const d = clamp(Math.hypot(dx, dy), Math.abs(UPPER_ARM - FOREARM) + 0.1, UPPER_ARM + FOREARM - 0.1);
    const a = Math.acos(clamp((UPPER_ARM ** 2 + d * d - FOREARM ** 2) / (2 * UPPER_ARM * d), -1, 1));
    const base = Math.atan2(dy, dx);
    const e1 = { x: sx + UPPER_ARM * Math.cos(base + a), y: sy + UPPER_ARM * Math.sin(base + a) };
    const e2 = { x: sx + UPPER_ARM * Math.cos(base - a), y: sy + UPPER_ARM * Math.sin(base - a) };
    // elbows go out, away from the centreline
    return side * e1.y > side * e2.y ? e1 : e2;
  }

  // --- one frame -----------------------------------------------------------------
  function step(t: number, dt: number, draw: boolean) {
    const l = layout;
    const B = l.boatLen;
    const head = progress(l, t);
    const env = envelope(t);
    const phase = (((t / STROKE) % 1) + 1) % 1;

    // where the boat is and how hard it is moving
    const c = center(l, head);
    const tg = tangent(l, head);
    bx = c.x;
    by = c.y;
    heading = Math.atan2(tg.y, tg.x) + 0.9 * DEG * Math.sin((TAU * t) / STROKE + 0.8) * env;
    const h = 0.01;
    const speed = ((progress(l, t + h) - progress(l, t - h)) * l.L) / (2 * h);
    const avg = ((1 - l.bStart) * l.L) / TRAVEL;
    const wake = clamp((speed / avg) * 0.8, 0, 1.2);
    wakeMem = dt > 0 ? Math.max(wake, wakeMem - dt * 0.25) : wake;

    const alpha = lerp(REST, rowAngle(phase), env);
    const inWater = lerp(1, bladeInWater(phase), env);

    if (dt > 0 && env > 0.3) {
      if (crossed(prevPhase, phase, 0.3)) onCatch(t, alpha);
      if (crossed(prevPhase, phase, 0.7)) onRelease(t, alpha, env);
    }
    prevPhase = phase;

    // splashes along the banks appear just behind the boat
    for (const d of edgeDrops) if (d.born < 0 && head >= d.u + 0.012) d.born = t;

    // --- drops for the shader
    dropBuf.fill(0);
    let di = 0;
    for (const d of edgeDrops) {
      if (d.born < 0 || di >= MAX_DROPS) continue;
      const age = t - d.born;
      const pop = 1 - Math.exp(-age * 7) * Math.cos(age * 11);
      const p = toWorld(l, d.u, d.v + d.drift * Math.min(age, 2.5));
      dropBuf.set([p.x, p.y, d.r * pop * (1 + 0.04 * Math.sin(t * 2 + d.u * 40)), d.k], di * 4);
      di++;
    }
    for (let i = splashes.length - 1; i >= 0; i--) {
      const s = splashes[i];
      const age = t - s.born;
      if (age > s.life) {
        splashes.splice(i, 1);
        continue;
      }
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vx *= Math.exp(-dt * 3.5);
      s.vy *= Math.exp(-dt * 3.5);
      if (di >= MAX_DROPS) continue;
      const r = s.flick
        ? s.r * (1 - age / s.life)
        : s.r * (1 - Math.exp(-age * 14)) * (1 - smooth(s.life * 0.4, s.life, age));
      if (r > 0.3) dropBuf.set([s.x, s.y, r, s.k], (di++) * 4);
    }

    puddleBuf.fill(0);
    puddles.forEach((p, i) => {
      const age = t - p.born;
      puddleBuf.set([p.x, p.y, age, age > 5 ? 0 : p.strength], i * 4);
    });

    // --- bubbles
    if (dt > 0) {
      if (rand() < dt * 7) {
        const u = lerp(0, head - 0.03, rand());
        const w = widthAt(l, u, head);
        if (w > 0) {
          const p = toWorld(l, u, (rand() * 2 - 1) * w * 0.8);
          cluster(p.x, p.y, 2 + Math.floor(rand() * 6), B * 0.07, t);
        }
      }
      if (rand() < dt * 22 * wakeMem) {
        const p = toWorldFromBoat(-104 - rand() * 30, (rand() - 0.5) * 40);
        cluster(p.x, p.y, 1, B * 0.02, t, 0.7);
      }
      CREATURES.forEach((cr, i) => {
        if (cr.kind !== "whale") return;
        breath[i] -= dt;
        if (breath[i] > 0) return;
        breath[i] = 1.2 + rand() * 2.4;
        const pose = poseOf(cr, l, Math.atan2(l.dir.y, l.dir.x), t);
        const bh = blowhole(pose);
        cluster(bh.x, bh.y, 5 + Math.floor(rand() * 6), B * 0.035 * cr.size, t, 0.9);
      });
      for (const b of bubbles) {
        const wob = Math.sin(t * 5 + b.ph) * B * 0.012;
        b.x += (b.vx + wob) * dt;
        b.y += b.vy * dt;
      }
    }
    for (let i = bubbles.length - 1; i >= 0; i--) {
      if (t - bubbles[i].born > bubbles[i].life) bubbles.splice(i, 1);
    }

    // --- the boat
    const deg = heading / DEG;
    const bob = 1 + 0.006 * Math.sin((TAU * t) / STROKE) * env;
    boat.style.transform = `translate3d(${bx - B}px, ${by - B}px, 0) rotate(${deg.toFixed(3)}deg) scale(${bob.toFixed(4)})`;
    const oar = `translate(${PIVOT_X} ${PIVOT_Y}) rotate(${(-alpha).toFixed(2)})`;
    oarS?.setAttribute("transform", oar);
    oarP?.setAttribute("transform", oar);
    // a squared blade in the water is edge-on from above; feathered, it shows its face
    const bw = (1 - 0.55 * inWater).toFixed(3);
    bladeS?.setAttribute("transform", `scale(${bw} 1)`);
    bladeP?.setAttribute("transform", `scale(${bw} 1)`);
    bladeS?.setAttribute("opacity", (1 - 0.3 * inWater).toFixed(3));
    bladeP?.setAttribute("opacity", (1 - 0.3 * inWater).toFixed(3));
    const lean = lerp(-7, 5, clamp((CATCH - alpha) / (CATCH - FINISH), 0, 1));
    rower?.setAttribute("transform", `translate(${lean.toFixed(2)} 0)`);
    hat?.setAttribute("transform", `translate(${lean.toFixed(2)} 0)`);
    for (const arm of arms) {
      const hx = PIVOT_X - GRIP * Math.sin(alpha * DEG);
      const hy = arm.side * (PIVOT_Y - GRIP * Math.cos(alpha * DEG));
      const sx = SHOULDER_X + lean;
      const sy = arm.side * 15;
      const e = elbow(sx, sy, hx, hy, arm.side);
      arm.sleeve?.setAttribute("d", `M${sx.toFixed(2)} ${sy}L${e.x.toFixed(2)} ${e.y.toFixed(2)}`);
      arm.fore?.setAttribute("d", `M${e.x.toFixed(2)} ${e.y.toFixed(2)}L${hx.toFixed(2)} ${hy.toFixed(2)}`);
      arm.hand?.setAttribute("cx", hx.toFixed(2));
      arm.hand?.setAttribute("cy", hy.toFixed(2));
    }

    if (!draw || !loc) return;

    // --- creatures, into the texture the water reads
    const pathAngle = Math.atan2(l.dir.y, l.dir.x);
    drawCreatures(lctx!, l, pathAngle, t, LIFE_SCALE);

    // --- the water
    const g = gl!;
    g.viewport(0, 0, glCanvas.width, glCanvas.height);
    g.uniform2f(loc.res, glCanvas.width, glCanvas.height);
    g.uniform1f(loc.scale, q);
    g.uniform2f(loc.view, l.W, l.H);
    g.uniform1f(loc.time, t);
    g.uniform2f(loc.p0, l.p0.x, l.p0.y);
    g.uniform2f(loc.dir, l.dir.x, l.dir.y);
    g.uniform2f(loc.perp, l.perp.x, l.perp.y);
    g.uniform1f(loc.L, l.L);
    g.uniform1f(loc.bend, l.bend);
    g.uniform1f(loc.head, head);
    g.uniform1f(loc.wHead, l.wHead);
    g.uniform1f(loc.wTail, l.wTail);
    g.uniform1f(loc.spread, l.spread);
    g.uniform1f(loc.lead, l.lead);
    g.uniform1f(loc.boatLen, B);
    g.uniform2f(loc.boat, bx, by);
    g.uniform2f(loc.boatDir, Math.cos(heading), Math.sin(heading));
    g.uniform1f(loc.wake, wakeMem);
    const sun = toWorld(l, 0.42, -l.wTail * 0.55);
    g.uniform2f(loc.sun, sun.x, sun.y);
    g.uniform4fv(loc.drops, dropBuf);
    g.uniform4fv(loc.puddles, puddleBuf);
    g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, lifeCanvas);
    g.drawArrays(g.TRIANGLES, 0, 3);

    // --- bubbles, kept inside the water
    const ctx = sctx!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, sparkCanvas.width, sparkCanvas.height);
    ctx.setTransform(sparkScale, 0, 0, sparkScale, 0, 0);
    for (const b of bubbles) {
      const age = t - b.born;
      if (age < 0) continue;
      let sd = bodySd(l, head, b.x, b.y);
      for (let i = 0; i < di; i++) {
        const o = i * 4;
        sd = Math.min(sd, Math.hypot(b.x - dropBuf[o], b.y - dropBuf[o + 1]) - dropBuf[o + 2]);
      }
      const popping = smooth(b.life - 0.12, b.life, age);
      const a = smooth(0, 0.2, age) * (1 - popping) * clamp((-sd - 1) / 5, 0, 1);
      if (a <= 0.01) continue;
      const r = b.r * (1 + popping * 0.35);
      ctx.globalAlpha = a;
      if (r < 1.5) {
        ctx.fillStyle = "rgb(255 238 220 / 0.85)";
        ctx.beginPath();
        ctx.arc(b.x, b.y, Math.max(r, 0.7), 0, TAU);
        ctx.fill();
        continue;
      }
      ctx.beginPath();
      ctx.arc(b.x, b.y, r, 0, TAU);
      ctx.fillStyle = "rgb(255 214 170 / 0.12)";
      ctx.fill();
      ctx.lineWidth = Math.max(0.6, r * 0.16);
      ctx.strokeStyle = "rgb(255 236 214 / 0.78)";
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(b.x - r * 0.38, b.y - r * 0.38, r * 0.27, 0, TAU);
      ctx.fillStyle = "rgb(255 255 255 / 0.95)";
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // --- the loop ----------------------------------------------------------------------
  let clock = 0;
  let last = performance.now();
  let frames = 0;
  let ema = 16;

  if (freezeAt != null) {
    // replay the voyage up to that moment so the splashes and puddles are there
    for (let t = 0; t < freezeAt; t += 1 / 60) step(t, 1 / 60, false);
    clock = freezeAt;
  } else {
    safety = window.setTimeout(finish, (END + 4) * 1000);
  }

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (!loc) {
      // hold on the black frame, without starting the clock, until it compiles
      if (parallel && !gl.getProgramParameter(prog, parallel.COMPLETION_STATUS_KHR)) {
        last = now;
        return;
      }
      if (!setup(gl)) {
        finish();
        return;
      }
    }
    const real = Math.max(0, (now - last) / 1000);
    last = now;
    // a throttled or backgrounded tab should not lurch forward
    const dt = freezeAt != null ? 0 : Math.min(real, 0.1);
    clock += dt;
    step(clock, dt, true);

    frames++;
    ema = ema * 0.9 + real * 1000 * 0.1;
    if (freezeAt == null && frames > 40 && frames % 20 === 0 && ema > 26 && quality > 0.55) {
      quality *= 0.8;
      resize();
    }
    if (freezeAt == null && clock >= END) finish();
  };
  raf = requestAnimationFrame(loop);

  return cleanup;
}
