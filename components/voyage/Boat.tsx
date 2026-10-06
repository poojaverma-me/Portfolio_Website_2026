/**
 * A wooden rowboat seen from above, bow pointing to +x. One unit is 1/200 of
 * the hull's length. The rower sits facing the stern, as rowers do, so the
 * oars sweep toward the bow on the recovery and pull back on the drive.
 *
 * The boat is built in layers so that nothing is ever repainted while it rows:
 * the hull is drawn once, and the oars, blades, rower, hat and each arm
 * segment are separate elements that engine.ts only moves with CSS transforms,
 * which the compositor applies without touching pixels. (Changing SVG
 * attributes instead forced the whole boat to re-rasterise every frame.)
 * The arms are rigid segments of fixed length, solved each frame by two-bone
 * inverse kinematics.
 *
 * Colours follow the reference painting: a varnished wooden hull with a pale
 * honey gunwale, a planked interior, wooden oars, a rower in a pale shirt and
 * navy trousers, and a straw hat with a tan band.
 */

import type { CSSProperties } from "react";

const HULL =
  "M100 0 C88 -18 58 -34 14 -36 C-36 -38 -76 -35 -90 -27 Q-97 -23 -97 -13 L-97 13 Q-97 23 -90 27 C-76 35 -36 38 14 36 C58 34 88 18 100 0 Z";
const INNER =
  "M90 0 C79 -15 52 -29 12 -31 C-34 -33 -70 -30 -84 -23 Q-91 -19 -91 -11 L-91 11 Q-91 19 -84 23 C-70 30 -34 33 12 31 C52 29 79 15 90 0 Z";

// boat geometry shared with engine.ts, in boat units
export const PIVOT_X = -6;
export const PIVOT_Y = 38;
export const BLADE = 113;
export const GRIP = 30;
export const SHOULDER_X = 12;
export const SHOULDER_Y = 15;
export const UPPER_ARM = 20;
export const FOREARM = 22;
export const SLEEVE = 8.5;
export const FORE = 5.8;
export const HAND = 7.4;

/** A box in boat units, placed relative to the boat's centre. */
function place(x: number, y: number, w: number, h: number): CSSProperties {
  return {
    position: "absolute",
    left: `calc(50% + ${x} * var(--u))`,
    top: `calc(50% + ${y} * var(--u))`,
    width: `calc(${w} * var(--u))`,
    height: `calc(${h} * var(--u))`,
  };
}

const layer: CSSProperties = { willChange: "transform" };

/** Shaft and handle of an oar in its own frame: pivot at the origin, blade along +y. */
function Shaft() {
  return (
    <svg viewBox="-9 -40 18 128" style={place(-9, -40, 18, 128)} aria-hidden>
      <rect x={-2.4} y={-38} width={4.8} height={14} rx={2.4} fill="#7a4a22" />
      <rect x={-1.9} y={-25} width={3.8} height={121} rx={1.9} fill="url(#voy-shaft)" />
      <rect x={-0.5} y={-24} width={0.9} height={112} fill="rgb(255 244 222 / 0.5)" />
      <rect x={-2.7} y={-5} width={5.4} height={11} rx={1.3} fill="#5a3a1e" />
    </svg>
  );
}

function Blade({ part }: { part: string }) {
  return (
    <svg
      data-part={part}
      viewBox="-9 88 18 50"
      style={{ ...place(-9, 88, 18, 50), ...layer, transformOrigin: "50% 50%" }}
      aria-hidden
    >
      <path
        d="M0 91 C7.5 95 8 124 0 135 C-8 124 -7.5 95 0 91 Z"
        fill="url(#voy-blade)"
        stroke="rgb(90 48 18 / 0.55)"
        strokeWidth={0.8}
      />
      <path d="M0 95 L0 131" stroke="rgb(255 236 200 / 0.35)" strokeWidth={0.9} />
    </svg>
  );
}

/** An oar pivoting in its oarlock; the port one is mirrored by the engine. */
function Oar({ side }: { side: "s" | "p" }) {
  const y = side === "s" ? PIVOT_Y : -PIVOT_Y;
  return (
    <div
      data-part={`oar-${side}`}
      style={{ ...place(PIVOT_X, y, 0, 0), ...layer, transformOrigin: "0 0" }}
    >
      <Shaft />
      <Blade part={`${side}-blade`} />
    </div>
  );
}

/** A rigid limb segment, jointed at its left end. */
function Segment({ part, length, thick, color }: { part: string; length: number; thick: number; color: string }) {
  return (
    <div
      data-part={part}
      style={{
        ...place(-thick / 2, -thick / 2, length + thick, thick),
        ...layer,
        background: color,
        borderRadius: `calc(${thick / 2} * var(--u))`,
        transformOrigin: `calc(${thick / 2} * var(--u)) 50%`,
      }}
    />
  );
}

export default function Boat() {
  return (
    <div className="relative h-full w-full" aria-hidden>
      {/* the hull, drawn once */}
      <svg viewBox="-200 -200 400 400" className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient id="voy-hull" x1="0" y1="-38" x2="0" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#d59251" />
            <stop offset="0.5" stopColor="#a8622b" />
            <stop offset="1" stopColor="#6a3512" />
          </linearGradient>
          <linearGradient id="voy-wood" x1="-90" y1="-30" x2="90" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#7a4119" />
            <stop offset="0.55" stopColor="#9a5a27" />
            <stop offset="1" stopColor="#6b3614" />
          </linearGradient>
          <linearGradient id="voy-seat" x1="0" y1="-30" x2="0" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#d49a5a" />
            <stop offset="1" stopColor="#a4652e" />
          </linearGradient>
          <linearGradient id="voy-shaft" x1="-2" y1="0" x2="2" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#f0c585" />
            <stop offset="1" stopColor="#b97a3e" />
          </linearGradient>
          <linearGradient id="voy-blade" x1="-7" y1="0" x2="7" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#eab874" />
            <stop offset="1" stopColor="#b5763a" />
          </linearGradient>
          <radialGradient id="voy-straw" cx="9" cy="-6" r="24" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff2c6" />
            <stop offset="0.55" stopColor="#f1cf86" />
            <stop offset="1" stopColor="#c99448" />
          </radialGradient>
          <radialGradient id="voy-crown" cx="11" cy="-4" r="12" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff6dc" />
            <stop offset="1" stopColor="#e6bb6c" />
          </radialGradient>
          <radialGradient id="voy-shirt" cx="10" cy="-8" r="26" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.6" stopColor="#e2edf6" />
            <stop offset="1" stopColor="#a6bfd6" />
          </radialGradient>
          <clipPath id="voy-inner">
            <path d={INNER} />
          </clipPath>
        </defs>

        <path d={HULL} fill="url(#voy-hull)" />
        <path d={HULL} fill="none" stroke="rgb(255 226 180 / 0.45)" strokeWidth={1} />
        <path d={HULL} fill="none" stroke="rgb(70 32 8 / 0.5)" strokeWidth={1.1} transform="scale(0.985 0.93)" />
        <path d={INNER} fill="url(#voy-wood)" />
        <g clipPath="url(#voy-inner)">
          {[-22, -11, 0, 11, 22].map((y) => (
            <g key={y}>
              <line x1={-100} x2={100} y1={y} y2={y} stroke="#3a1c0a" strokeWidth={0.9} />
              <line x1={-100} x2={100} y1={y + 1} y2={y + 1} stroke="rgb(255 210 160 / 0.16)" strokeWidth={0.8} />
            </g>
          ))}
          {[-76, -60, -44, -28, -12, 4, 20, 36, 52, 68].map((x) => (
            <line key={x} x1={x} x2={x} y1={-40} y2={40} stroke="rgb(40 16 4 / 0.08)" strokeWidth={1.2} />
          ))}
          <rect x={-88} y={-40} width={21} height={80} fill="url(#voy-seat)" />
          <rect x={-88} y={-40} width={21} height={80} fill="none" stroke="rgb(0 0 0 / 0.35)" strokeWidth={1} />
          <rect x={6} y={-40} width={15} height={80} fill="url(#voy-seat)" />
          <rect x={6} y={-40} width={15} height={80} fill="none" stroke="rgb(0 0 0 / 0.35)" strokeWidth={1} />
          <path d="M60 -26 L96 0 L60 26 Z" fill="url(#voy-seat)" />
          <path d="M60 -26 L60 26" stroke="rgb(0 0 0 / 0.35)" strokeWidth={1} />
          <path d={INNER} fill="none" stroke="rgb(40 16 4 / 0.38)" strokeWidth={7} />
        </g>
        <path d={INNER} fill="none" stroke="#dea566" strokeWidth={3.2} />
        <path d={INNER} fill="none" stroke="rgb(255 236 200 / 0.55)" strokeWidth={0.8} />
        <circle cx={72} cy={0} r={5.2} fill="none" stroke="#dcc091" strokeWidth={1.7} />
        <circle cx={72} cy={0} r={2.7} fill="none" stroke="#c9a570" strokeWidth={1.5} />
        {[-1, 1].map((s) => (
          <circle key={s} cx={PIVOT_X} cy={36.5 * s} r={2.9} fill="#5a3c1c" stroke="rgb(255 226 180 / 0.4)" strokeWidth={0.7} />
        ))}
        {[-1, 1].map((s) => (
          <g key={s}>
            <path d={`M9 ${6 * s} L-22 ${9 * s}`} stroke="#1f3552" strokeWidth={7.5} strokeLinecap="round" />
            <ellipse cx={-26} cy={9.5 * s} rx={5.2} ry={3.4} fill="#2a1a10" />
          </g>
        ))}
      </svg>

      <Oar side="s" />
      <Oar side="p" />

      {/* the rower's shoulders, under the arms */}
      <svg data-part="rower" viewBox="-12 -26 52 52" style={{ ...place(-12, -26, 52, 52), ...layer }}>
        <ellipse cx={14} cy={0} rx={11} ry={20.5} fill="url(#voy-shirt)" />
        <ellipse cx={17} cy={3} rx={19} ry={19} fill="rgb(0 0 0 / 0.28)" />
      </svg>

      {(["s", "p"] as const).map((s) => (
        <div key={s}>
          <Segment part={`sleeve-${s}`} length={UPPER_ARM} thick={SLEEVE} color="#e4eef7" />
          <Segment part={`fore-${s}`} length={FOREARM} thick={FORE} color="#d99a6c" />
          <div
            data-part={`hand-${s}`}
            style={{ ...place(-HAND / 2, -HAND / 2, HAND, HAND), ...layer, background: "#c9865a", borderRadius: "50%" }}
          />
        </div>
      ))}

      {/* the hat, over everything */}
      <svg data-part="hat" viewBox="-6 -20 40 40" style={{ ...place(-6, -20, 40, 40), ...layer }}>
        <circle cx={14} cy={0} r={19} fill="url(#voy-straw)" stroke="#b98a48" strokeWidth={0.8} />
        <circle cx={14} cy={0} r={16.2} fill="none" stroke="rgb(140 90 40 / 0.35)" strokeWidth={0.7} strokeDasharray="2.2 1.4" />
        <circle cx={14} cy={0} r={13.4} fill="none" stroke="rgb(140 90 40 / 0.3)" strokeWidth={0.7} strokeDasharray="2 1.3" />
        <circle cx={14} cy={0} r={10.6} fill="none" stroke="#a8743a" strokeWidth={2.4} />
        <circle cx={14} cy={0} r={9.3} fill="url(#voy-crown)" />
        <circle cx={14} cy={0} r={6.4} fill="none" stroke="rgb(140 90 40 / 0.25)" strokeWidth={0.6} strokeDasharray="1.6 1.2" />
        <ellipse cx={10.5} cy={-4} rx={4} ry={2.6} fill="rgb(255 255 255 / 0.5)" transform="rotate(-35 10.5 -4)" />
      </svg>
    </div>
  );
}
