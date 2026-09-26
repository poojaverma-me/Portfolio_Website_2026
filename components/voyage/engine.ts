/**
 * Runs the voyage. One clock drives everything, and the parts are coupled the
 * way they are in the world:
 *
 * - rowing.ts integrates the boat's force balance; its speed and oar angle
 *   come from there, not from an easing curve.
 * - The hull and the buried blades are moving bodies in the fluid (fluid.ts),
 *   so the wake, the bow wave and the swirls each stroke leaves come out of
 *   the simulation. Blade catches and the drips flicked off at the release
 *   knock rings into the wave field where they land.
 * - Fish that find the hull or a blade too close do a C-start (swimmers.ts);
 *   shallow whales leave fluke prints.
 * - Bubbles and drips drift with the simulated current, read back from the GPU
 *   without stalling it.
 */

import {
  BLADE,
  FOREARM,
  GRIP,
  PIVOT_X,
  PIVOT_Y,
  SHOULDER_X,
  SHOULDER_Y,
  UPPER_ARM,
} from "./Boat";
import { type FluidInput, Fluid, type Ripple, type Spot } from "./fluid";
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
import { bind, blit, canRenderHalfFloat, fullScreen, program, programsLinked, programsReady } from "./gl";
import { CATCH, FINISH, type Voyage, planVoyage } from "./rowing";
import { blowhole, drawSwimmers, makeSwimmers, stepSwimmers, type Swimmer } from "./swimmers";
import { BubbleLayer, LifeLayer, MAX_BUBBLES } from "./sprites";
import { FRAG, MAX_DROPS, VERT } from "./water-shader";

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;


const LIFE_SCALE = 0.5;

type EdgeDrop = { u: number; v: number; r: number; k: number; drift: number; born: number };
type Splash = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  k: number;
  born: number;
  life: number;
  /** a drip in flight; it lands with a ring when it dies */
  flick: boolean;
};
type Bubble = { x: number; y: number; r: number; born: number; life: number; ph: number };

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
      (nearBoat ? 0.03 + rand() * 0.04 : attached ? 0.07 + rand() * 0.09 : 0.035 + rand() * 0.06);
    const dist = attached ? w * (0.92 + rand() * 0.12) : w * (1.08 + rand() * 0.22) + r;
    const drift = side * l.boatLen * (0.02 + rand() * 0.03);
    drops.push({ u, v: side * dist, r, k: attached ? r * 1.1 : r * 0.7, drift, born: -1 });
    if (!attached && rand() < 0.6) {
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
  glCanvas.setAttribute("aria-hidden", "true");
  Object.assign(glCanvas.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  });
  host.insertBefore(glCanvas, host.firstChild);

  let raf = 0;
  let safety = 0;
  let done = false;
  let fluid: Fluid | null = null;
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
    fluid?.dispose();
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    glCanvas.remove();
  };

  // Without a GPU the browser would draw this in software: a slideshow for the
  // visitor and a frozen main thread. Better to go straight to the page.
  const gl = glCanvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    powerPreference: "high-performance",
    failIfMajorPerformanceCaveat: true,
  });
  if (!gl || !canRenderHalfFloat(gl)) {
    finish();
    return cleanup;
  }

  // compiled without waiting; the loop polls until every program is ready
  const screen = fullScreen(gl);
  const view = program(gl, VERT, FRAG);
  fluid = new Fluid(gl);
  const life = new LifeLayer(gl);
  const bubbleLayer = new BubbleLayer(gl);
  const programs = [view, life.prog, bubbleLayer.prog, ...fluid.programs];
  const parallel = gl.getExtension("KHR_parallel_shader_compile");
  let ready = false;

  // --- the boat's moving parts -----------------------------------------------
  const part = (name: string) => boat.querySelector<HTMLElement | SVGElement>(`[data-part="${name}"]`);
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
  let layout: Layout = makeLayout(1, 1);
  let voyage: Voyage = planVoyage(layout);
  let swimmers: Swimmer[] = [];
  let edgeDrops: EdgeDrop[] = [];
  let quality = 1;
  let q = 1;
  const splashes: Splash[] = [];
  const bubbles: Bubble[] = [];
  const dropBuf = new Float32Array(MAX_DROPS * 4);
  let dropCount = 0;
  const rand = seeded(11);
  let breath: number[] = [];
  let prevIn = 0;
  let prevBlades: { x: number; y: number }[] | null = null;
  let replay = false;

  function resize() {
    const W = host.clientWidth || window.innerWidth;
    const H = host.clientHeight || window.innerHeight;
    const born = edgeDrops.map((d) => d.born);
    layout = makeLayout(W, H);
    voyage = planVoyage(layout);
    swimmers = makeSwimmers(layout);
    breath = swimmers.map(() => 0.3 + rand() * 1.4);
    edgeDrops = makeEdgeDrops(layout);
    edgeDrops.forEach((d, i) => (d.born = born[i] ?? -1));
    prevBlades = null;

    const dpr = window.devicePixelRatio || 1;
    // the water is soft by nature; one sample per CSS pixel is plenty
    q = Math.min(dpr, 1) * quality;
    glCanvas.width = Math.round(W * q);
    glCanvas.height = Math.round(H * q);
    life.size(W, H, LIFE_SCALE);
    const size = `${layout.boatLen * 2}px`;
    boat.style.width = size;
    boat.style.height = size;
    boat.style.setProperty("--u", `${layout.boatLen / 200}px`);
    fluid!.size(W, H, layout.boatLen * 3);
    // a resize starts the water from rest; a frozen dev scene replays its history
    replay = freezeAt != null;
  }
  resize();
  window.addEventListener("resize", resize);
  glCanvas.addEventListener("webglcontextlost", finish);

  // --- helpers -------------------------------------------------------------------
  let bx = 0;
  let by = 0;
  let heading = 0;
  const fromBoat = (lx: number, ly: number) => {
    const s = layout.boatLen / 200;
    const c = Math.cos(heading);
    const n = Math.sin(heading);
    return { x: bx + (lx * c - ly * n) * s, y: by + (lx * n + ly * c) * s };
  };
  const bladeAt = (alpha: number, side: number) =>
    fromBoat(PIVOT_X + BLADE * Math.sin(alpha * DEG), side * (PIVOT_Y + BLADE * Math.cos(alpha * DEG)));

  const cluster = (x: number, y: number, n: number, spread: number, t: number, big = 1) => {
    const B = layout.boatLen;
    for (let i = 0; i < n; i++) {
      if (bubbles.length >= MAX_BUBBLES) bubbles.shift();
      bubbles.push({
        x: x + (rand() - 0.5) * spread * 2,
        y: y + (rand() - 0.5) * spread * 2,
        r: B * (0.006 + rand() * rand() * 0.028) * big,
        born: t + rand() * 0.2,
        life: 0.9 + rand() * 1.5,
        ph: rand() * TAU,
      });
    }
  };

  function elbow(sx: number, sy: number, hx: number, hy: number, side: number) {
    const dx = hx - sx;
    const dy = hy - sy;
    const d = clamp(Math.hypot(dx, dy), Math.abs(UPPER_ARM - FOREARM) + 0.1, UPPER_ARM + FOREARM - 0.1);
    const a = Math.acos(clamp((UPPER_ARM ** 2 + d * d - FOREARM ** 2) / (2 * UPPER_ARM * d), -1, 1));
    const base = Math.atan2(dy, dx);
    const e1 = { x: sx + UPPER_ARM * Math.cos(base + a), y: sy + UPPER_ARM * Math.sin(base + a) };
    const e2 = { x: sx + UPPER_ARM * Math.cos(base - a), y: sy + UPPER_ARM * Math.sin(base - a) };
    return side * e1.y > side * e2.y ? e1 : e2;
  }

  // --- simulate one step -----------------------------------------------------------
  let head = layout.bStart;

  function simulate(t: number, dt: number) {
    const l = layout;
    const B = l.boatLen;
    const st = voyage.sample(t);
    head = st.u;

    const c = center(l, head);
    const tg = tangent(l, head);
    bx = c.x;
    by = c.y;
    heading = Math.atan2(tg.y, tg.x);
    const speedN = st.v / (2 * B);

    // the blades: where they are, which way the shafts point, how fast they move
    const blades = [1, -1].map((side) => {
      const p = bladeAt(st.alpha, side);
      const pivot = fromBoat(PIVOT_X, side * PIVOT_Y);
      const ax = p.x - pivot.x;
      const ay = p.y - pivot.y;
      const an = Math.hypot(ax, ay) || 1;
      return { x: p.x, y: p.y, dx: ax / an, dy: ay / an };
    });
    const bladeVel = blades.map((b, i) =>
      prevBlades && dt > 0
        ? { vx: (b.x - prevBlades[i].x) / dt, vy: (b.y - prevBlades[i].y) / dt }
        : { vx: tg.x * st.v, vy: tg.y * st.v },
    );
    prevBlades = blades.map((b) => ({ x: b.x, y: b.y }));

    const ripples: Ripple[] = [];
    const spots: Spot[] = [];
    const minR = fluid!.cell * 1.3;

    // catch: the blades go in; release: they come out, flicking drips
    if (dt > 0) {
      if (prevIn < 0.5 && st.inWater >= 0.5) {
        for (const b of blades) {
          ripples.push({ x: b.x, y: b.y, r: Math.max(B * 0.04, minR), amp: -B * 0.012 });
          spots.push({ x: b.x, y: b.y, r: B * 0.05, foam: 0.9, slick: 0 });
          splashes.push({ x: b.x, y: b.y, vx: 0, vy: 0, r: B * 0.04, k: B * 0.04, born: t, life: 0.8, flick: false });
          cluster(b.x, b.y, 6, B * 0.04, t);
        }
      }
      if (prevIn >= 0.5 && st.inWater < 0.5 && st.mode === "row") {
        for (const b of blades) {
          for (let i = 0; i < 2; i++) {
            const sp = B * (0.4 + rand() * 0.35);
            splashes.push({
              x: b.x,
              y: b.y,
              vx: b.dx * sp - tg.x * B * 0.3 + (rand() - 0.5) * B * 0.2,
              vy: b.dy * sp - tg.y * B * 0.3 + (rand() - 0.5) * B * 0.2,
              r: B * (0.013 + rand() * 0.012),
              k: B * 0.02,
              born: t,
              life: 0.35 + rand() * 0.25,
              flick: true,
            });
          }
        }
      }
    }
    prevIn = st.inWater;

    // splashes along the banks appear just behind the boat
    for (const d of edgeDrops) if (d.born < 0 && head >= d.u + 0.012) d.born = t;

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
        // a drip lands: a small ring and a fleck of white
        if (s.flick) {
          ripples.push({ x: s.x, y: s.y, r: Math.max(B * 0.015, minR), amp: -B * 0.006 });
          spots.push({ x: s.x, y: s.y, r: B * 0.02, foam: 0.5, slick: 0 });
        }
        splashes.splice(i, 1);
        continue;
      }
      // drips fly ballistically with a little air drag
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vx *= Math.exp(-dt * 2);
      s.vy *= Math.exp(-dt * 2);
      if (di >= MAX_DROPS) continue;
      const r = s.flick
        ? s.r * (1 - 0.4 * (age / s.life))
        : s.r * (1 - Math.exp(-age * 14)) * (1 - smooth(s.life * 0.4, s.life, age));
      if (r > 0.3) dropBuf.set([s.x, s.y, r, s.k], (di++) * 4);
    }
    while (splashes.length > 16) splashes.shift();
    dropCount = di;

    // --- swimmers, who notice the boat
    const threats = [{ x: bx, y: by, r: B * 0.55 }];
    if (st.inWater > 0.5) for (const b of blades) threats.push({ x: b.x, y: b.y, r: B * 0.18 });
    const prints = dt > 0 ? stepSwimmers(swimmers, dt, t, threats) : [];
    for (const p of prints) {
      spots.push({ x: p.x, y: p.y, r: p.r, foam: 0, slick: 0.9 * p.strength });
      ripples.push({ x: p.x, y: p.y, r: Math.max(p.r * 0.6, minR), amp: B * 0.005 * p.strength });
    }
    // the thrust wake of a shallow whale, pushed back off its flukes
    const jets = swimmers
      .filter((s) => s.kind === "whale" && s.depth > 0.7)
      .map((s) => {
        const back = -0.55 * s.L;
        const push = s.U * 2.2 * (s.depth - 0.6);
        return {
          x: s.x + Math.cos(s.heading) * back,
          y: s.y + Math.sin(s.heading) * back,
          r: s.L * 0.12,
          ax: -Math.cos(s.heading) * push,
          ay: -Math.sin(s.heading) * push,
        };
      });

    // --- the water itself
    if (dt > 0) {
      const input: FluidInput = {
        hull: {
          x: bx,
          y: by,
          dx: tg.x,
          dy: tg.y,
          vx: tg.x * st.v,
          vy: tg.y * st.v,
          halfLen: B * 0.5,
          halfBeam: B * 0.18,
          on: 1,
          foam: 4 * clamp(speedN, 0, 1.3),
          depth: B * 0.012,
        },
        blades: blades.map((b, i) => ({ ...b, ...bladeVel[i], on: st.inWater })),
        bladeHalf: [B * 0.09, B * 0.022],
        bladeDepth: B * 0.008,
        bladeFoam: [0, 1].map(() =>
          st.inWater * (st.mode === "row" ? 6 * st.thrust : 6 * clamp(speedN, 0, 1)),
        ) as [number, number],
        jets,
        spots,
        ripples,
        // a third of the cruising speed: the V trails at Kelvin's angle
        waveSpeed: (2 * B) / 3,
      };
      gl!.bindVertexArray(screen);
      fluid!.step(dt, input);

      // --- bubbles: rising, drifting with the current, popping
      if (rand() < dt * 7) {
        const u = lerp(0, head - 0.03, rand());
        const w = widthAt(l, u, head);
        if (w > 0) {
          const p = toWorld(l, u, (rand() * 2 - 1) * w * 0.8);
          cluster(p.x, p.y, 2 + Math.floor(rand() * 6), B * 0.07, t);
        }
      }
      if (rand() < dt * 26 * clamp(speedN, 0, 1.2)) {
        const p = fromBoat(-104 - rand() * 30, (rand() - 0.5) * 40);
        cluster(p.x, p.y, 1, B * 0.02, t, 0.7);
      }
      swimmers.forEach((s, i) => {
        if (s.kind !== "whale") return;
        breath[i] -= dt;
        if (breath[i] > 0) return;
        breath[i] = 1 + rand() * 2;
        const bh = blowhole(s);
        cluster(bh.x, bh.y, 5 + Math.floor(rand() * 6), s.L * 0.03, t, 0.9);
      });
      for (const b of bubbles) {
        const [vx, vy] = fluid!.velocityAt(b.x, b.y);
        const wob = Math.sin(t * 5 + b.ph) * B * 0.012;
        b.x += (vx * 0.9 + wob) * dt;
        b.y += vy * 0.9 * dt;
      }
    }
    for (let i = bubbles.length - 1; i >= 0; i--) {
      if (t - bubbles[i].born > bubbles[i].life) bubbles.splice(i, 1);
    }

    // --- the boat: transforms only, so the compositor moves it without repainting
    const U = B / 200;
    const px = (v: number) => `${(v * U).toFixed(2)}px`;
    boat.style.transform = `translate3d(${(bx - B).toFixed(2)}px, ${(by - B).toFixed(2)}px, 0) rotate(${(heading / DEG).toFixed(3)}deg)`;
    const turn = `rotate(${(-st.alpha).toFixed(2)}deg)`;
    if (oarS) oarS.style.transform = turn;
    if (oarP) oarP.style.transform = `scale(1, -1) ${turn}`;
    // a squared blade in the water is edge-on from above; feathered, it shows its face
    const feather = `scaleX(${(1 - 0.55 * st.inWater).toFixed(3)})`;
    const shade = (1 - 0.3 * st.inWater).toFixed(3);
    for (const b of [bladeS, bladeP]) {
      if (!b) continue;
      b.style.transform = feather;
      b.style.opacity = shade;
    }
    const lean = lerp(-7, 5, clamp((CATCH - st.alpha) / (CATCH - FINISH), 0, 1));
    if (rower) rower.style.transform = `translateX(${px(lean)})`;
    if (hat) hat.style.transform = `translateX(${px(lean)})`;
    for (const arm of arms) {
      const hx = PIVOT_X - GRIP * Math.sin(st.alpha * DEG);
      const hy = arm.side * (PIVOT_Y - GRIP * Math.cos(st.alpha * DEG));
      const sx = SHOULDER_X + lean;
      const sy = arm.side * SHOULDER_Y;
      const e = elbow(sx, sy, hx, hy, arm.side);
      const a1 = Math.atan2(e.y - sy, e.x - sx);
      const a2 = Math.atan2(hy - e.y, hx - e.x);
      // rigid bones: the hand sits where the forearm ends
      const wx = e.x + Math.cos(a2) * FOREARM;
      const wy = e.y + Math.sin(a2) * FOREARM;
      if (arm.sleeve) arm.sleeve.style.transform = `translate(${px(sx)}, ${px(sy)}) rotate(${a1.toFixed(4)}rad)`;
      if (arm.fore) arm.fore.style.transform = `translate(${px(e.x)}, ${px(e.y)}) rotate(${a2.toFixed(4)}rad)`;
      if (arm.hand) arm.hand.style.transform = `translate(${px(wx)}, ${px(wy)})`;
    }
  }

  // --- draw one frame -----------------------------------------------------------------
  function render(t: number) {
    const l = layout;
    const g = gl!;
    const f = fluid!;
    life.begin();
    drawSwimmers(life, swimmers);
    life.end();

    g.bindVertexArray(screen);
    g.useProgram(view.prog);
    const u = view.u;
    g.uniform2f(u("uRes"), glCanvas.width, glCanvas.height);
    g.uniform1f(u("uScale"), q);
    g.uniform2f(u("uView"), l.W, l.H);
    g.uniform1f(u("uTime"), t);
    g.uniform2f(u("uP0"), l.p0.x, l.p0.y);
    g.uniform2f(u("uDir"), l.dir.x, l.dir.y);
    g.uniform2f(u("uPerp"), l.perp.x, l.perp.y);
    g.uniform1f(u("uL"), l.L);
    g.uniform1f(u("uBend"), l.bend);
    g.uniform1f(u("uHead"), head);
    g.uniform1f(u("uWHead"), l.wHead);
    g.uniform1f(u("uWTail"), l.wTail);
    g.uniform1f(u("uSpread"), l.spread);
    g.uniform1f(u("uLead"), l.lead);
    g.uniform1f(u("uBoatLen"), l.boatLen);
    g.uniform2f(u("uBoat"), bx, by);
    g.uniform2f(u("uBoatDir"), Math.cos(heading), Math.sin(heading));
    const sun = toWorld(l, 0.42, -l.wTail * 0.5);
    g.uniform2f(u("uSun"), sun.x, sun.y);
    g.uniform4fv(u("uDrops"), dropBuf);
    g.uniform2f(u("uSimTexel"), 1 / Math.round(l.W / f.cell), 1 / Math.round(l.H / f.cell));
    g.uniform1f(u("uCell"), f.cell);
    bind(g, view, "uLife", 0, life.tex!);
    bind(g, view, "uWave", 1, f.wave.read.tex);
    bind(g, view, "uDye", 2, f.dye.read.tex);
    blit(g, null);

    // bubbles, kept inside the water, drawn over it in the same pass
    const data = bubbleLayer.data;
    let n = 0;
    for (const b of bubbles) {
      const age = t - b.born;
      if (age < 0 || n >= MAX_BUBBLES) continue;
      let sd = bodySd(l, head, b.x, b.y);
      for (let i = 0; i < dropCount; i++) {
        const o = i * 4;
        sd = Math.min(sd, Math.hypot(b.x - dropBuf[o], b.y - dropBuf[o + 1]) - dropBuf[o + 2]);
      }
      const popping = smooth(b.life - 0.12, b.life, age);
      const a = smooth(0, 0.2, age) * (1 - popping) * clamp((-sd - 1) / 5, 0, 1);
      if (a <= 0.01) continue;
      data[n * 4] = b.x;
      data[n * 4 + 1] = b.y;
      data[n * 4 + 2] = b.r * (1 + popping * 0.35);
      data[n * 4 + 3] = a;
      n++;
    }
    bubbleLayer.draw(n, l.W, l.H);
  }

  // --- the loop ----------------------------------------------------------------------
  let clock = 0;
  let last = performance.now();
  let frames = 0;
  let ema = 16;
  if (freezeAt == null) safety = window.setTimeout(finish, 12000);

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (!ready) {
      // hold on the black frame, without starting the clock, until it compiles
      if (!programsReady(gl, programs, parallel)) {
        last = now;
        return;
      }
      if (!programsLinked(gl, programs)) {
        finish();
        return;
      }
      ready = true;
      // the first draw with each program builds its GPU pipeline, which can take
      // a tenth of a second; do it on the black frame, before the clock starts
      simulate(0, 1 / 60);
      render(0);
      edgeDrops.forEach((d) => (d.born = -1));
      last = performance.now();
      return;
    }
    if (replay && freezeAt != null) {
      // replay the voyage up to that moment so the water has its history
      replay = false;
      splashes.length = 0;
      bubbles.length = 0;
      edgeDrops.forEach((d) => (d.born = -1));
      prevIn = 0;
      for (let t = 0; t < freezeAt; t += 1 / 60) simulate(t, 1 / 60);
      clock = freezeAt;
    }
    const real = Math.max(0, (now - last) / 1000);
    last = now;
    if (freezeAt != null) {
      simulate(clock, 0);
    } else {
      // a long frame is split into steps the solvers stay stable over, and a
      // backgrounded tab does not lurch forward when it comes back
      const span = Math.min(real, 0.1);
      const n = Math.max(1, Math.ceil(span / (1 / 30)));
      for (let i = 0; i < n; i++) {
        clock += span / n;
        simulate(clock, span / n);
      }
    }
    render(clock);

    frames++;
    ema = ema * 0.9 + real * 1000 * 0.1;
    if (freezeAt == null && frames > 40 && frames % 20 === 0 && ema > 26 && quality > 0.55) {
      quality *= 0.8;
      q = Math.min(window.devicePixelRatio || 1, 1) * quality;
      glCanvas.width = Math.round(layout.W * q);
      glCanvas.height = Math.round(layout.H * q);
    }
    if (freezeAt == null && clock >= voyage.end) finish();
  };
  raf = requestAnimationFrame(loop);

  return cleanup;
}
