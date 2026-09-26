/**
 * A wooden rowboat seen from above, bow pointing to +x. One unit is 1/200 of
 * the hull's length. The rower sits facing the stern, as rowers do, so the
 * oars sweep toward the bow on the recovery and pull back on the drive.
 *
 * Nothing here animates by itself: engine.ts moves the oars, the arms and the
 * rower's lean every frame through the data-part hooks.
 *
 * Graphite hull and varnished interior keep to the site's neutrals and ember;
 * the accent shows only as a pinstripe, the hat band and the oar blades.
 */

const HULL =
  "M100 0 C88 -18 58 -34 14 -36 C-36 -38 -76 -35 -90 -27 Q-97 -23 -97 -13 L-97 13 Q-97 23 -90 27 C-76 35 -36 38 14 36 C58 34 88 18 100 0 Z";
const INNER =
  "M90 0 C79 -15 52 -29 12 -31 C-34 -33 -70 -30 -84 -23 Q-91 -19 -91 -11 L-91 11 Q-91 19 -84 23 C-70 30 -34 33 12 31 C52 29 79 15 90 0 Z";

/** Starboard oar in its own frame: pivot at the origin, blade out along +y. */
function Oar({ part }: { part: string }) {
  return (
    <g data-part={part}>
      <rect x={-2.4} y={-38} width={4.8} height={14} rx={2.4} fill="#26262a" />
      <rect x={-1.9} y={-25} width={3.8} height={121} rx={1.9} fill="url(#voy-shaft)" />
      <rect x={-0.5} y={-24} width={0.9} height={118} fill="rgb(255 240 220 / 0.45)" />
      <rect x={-2.7} y={-5} width={5.4} height={11} rx={1.3} fill="#1a1a1d" />
      <g data-part={`${part}-blade`}>
        <path
          d="M0 91 C7.5 95 8 124 0 135 C-8 124 -7.5 95 0 91 Z"
          fill="#1d1d20"
          stroke="rgb(255 255 255 / 0.22)"
          strokeWidth={0.8}
        />
        <path d="M-5.6 103.5 L5.6 103.5" stroke="#f96b0b" strokeWidth={2.4} />
      </g>
    </g>
  );
}

export default function Boat() {
  return (
    <svg viewBox="-200 -200 400 400" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id="voy-hull" x1="0" y1="-38" x2="0" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#46464c" />
          <stop offset="0.45" stopColor="#242428" />
          <stop offset="1" stopColor="#0e0e10" />
        </linearGradient>
        <linearGradient id="voy-wood" x1="-90" y1="-30" x2="90" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3a1807" />
          <stop offset="0.55" stopColor="#5a2a10" />
          <stop offset="1" stopColor="#2e1306" />
        </linearGradient>
        <linearGradient id="voy-seat" x1="0" y1="-30" x2="0" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#a65c26" />
          <stop offset="1" stopColor="#6c3413" />
        </linearGradient>
        <linearGradient id="voy-shaft" x1="-2" y1="0" x2="2" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f2c890" />
          <stop offset="1" stopColor="#b8773d" />
        </linearGradient>
        <radialGradient id="voy-straw" cx="9" cy="-6" r="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff3da" />
          <stop offset="0.55" stopColor="#efd39e" />
          <stop offset="1" stopColor="#c4924f" />
        </radialGradient>
        <radialGradient id="voy-crown" cx="11" cy="-4" r="12" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff8e8" />
          <stop offset="1" stopColor="#e2bd7c" />
        </radialGradient>
        <radialGradient id="voy-shirt" cx="10" cy="-8" r="26" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#e7e7eb" />
          <stop offset="1" stopColor="#b4b4bb" />
        </radialGradient>
        <clipPath id="voy-inner">
          <path d={INNER} />
        </clipPath>
      </defs>

      {/* hull */}
      <path d={HULL} fill="url(#voy-hull)" />
      <path d={HULL} fill="none" stroke="rgb(255 255 255 / 0.2)" strokeWidth={1} />
      <path
        d={HULL}
        fill="none"
        stroke="#f96b0b"
        strokeWidth={1.1}
        transform="scale(0.985 0.93)"
      />
      <path d={INNER} fill="url(#voy-wood)" />
      <g clipPath="url(#voy-inner)">
        {[-22, -11, 0, 11, 22].map((y) => (
          <g key={y}>
            <line x1={-100} x2={100} y1={y} y2={y} stroke="#1f0c03" strokeWidth={0.9} />
            <line x1={-100} x2={100} y1={y + 1} y2={y + 1} stroke="rgb(255 190 140 / 0.1)" strokeWidth={0.8} />
          </g>
        ))}
        {[-76, -60, -44, -28, -12, 4, 20, 36, 52, 68].map((x) => (
          <line key={x} x1={x} x2={x} y1={-40} y2={40} stroke="rgb(0 0 0 / 0.26)" strokeWidth={1.5} />
        ))}
        {/* stern bench, rowing thwart and the little bow deck */}
        <rect x={-88} y={-40} width={21} height={80} fill="url(#voy-seat)" />
        <rect x={-88} y={-40} width={21} height={80} fill="none" stroke="rgb(0 0 0 / 0.35)" strokeWidth={1} />
        <rect x={6} y={-40} width={15} height={80} fill="url(#voy-seat)" />
        <rect x={6} y={-40} width={15} height={80} fill="none" stroke="rgb(0 0 0 / 0.35)" strokeWidth={1} />
        <path d="M60 -26 L96 0 L60 26 Z" fill="url(#voy-seat)" />
        <path d="M60 -26 L60 26" stroke="rgb(0 0 0 / 0.35)" strokeWidth={1} />
        <path d={INNER} fill="none" stroke="rgb(0 0 0 / 0.4)" strokeWidth={7} />
      </g>
      <path d={INNER} fill="none" stroke="#b4632a" strokeWidth={3} />
      <path d={INNER} fill="none" stroke="rgb(255 214 170 / 0.35)" strokeWidth={0.8} />

      {/* a coil of rope on the bow deck */}
      <circle cx={72} cy={0} r={5.2} fill="none" stroke="#dcc091" strokeWidth={1.7} />
      <circle cx={72} cy={0} r={2.7} fill="none" stroke="#c9a570" strokeWidth={1.5} />

      {/* oarlocks */}
      {[-1, 1].map((s) => (
        <circle key={s} cx={-6} cy={36.5 * s} r={2.9} fill="#2c2c30" stroke="rgb(255 255 255 / 0.3)" strokeWidth={0.7} />
      ))}

      {/* legs, stretched toward the stern */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={`M9 ${6 * s} L-22 ${9 * s}`} stroke="#2e2e33" strokeWidth={7.5} strokeLinecap="round" />
          <ellipse cx={-26} cy={9.5 * s} rx={5.2} ry={3.4} fill="#141416" />
        </g>
      ))}

      {/* oars */}
      <g data-part="oar-s" transform="translate(-6 38)">
        <Oar part="s" />
      </g>
      <g transform="scale(1 -1)">
        <g data-part="oar-p" transform="translate(-6 38)">
          <Oar part="p" />
        </g>
      </g>

      {/* the rower */}
      <g data-part="rower">
        <ellipse cx={14} cy={0} rx={11} ry={20.5} fill="url(#voy-shirt)" />
        <ellipse cx={17} cy={3} rx={19} ry={19} fill="rgb(0 0 0 / 0.28)" />
      </g>
      {["s", "p"].map((s) => (
        <g key={s}>
          <path data-part={`sleeve-${s}`} fill="none" stroke="#ececf0" strokeWidth={8.5} strokeLinecap="round" />
          <path data-part={`fore-${s}`} fill="none" stroke="#d99a6c" strokeWidth={5.8} strokeLinecap="round" />
          <circle data-part={`hand-${s}`} r={3.7} fill="#c9865a" />
        </g>
      ))}
      <g data-part="hat">
        <circle cx={14} cy={0} r={19} fill="url(#voy-straw)" stroke="#b3874c" strokeWidth={0.8} />
        <circle cx={14} cy={0} r={16.2} fill="none" stroke="rgb(140 90 40 / 0.35)" strokeWidth={0.7} strokeDasharray="2.2 1.4" />
        <circle cx={14} cy={0} r={13.4} fill="none" stroke="rgb(140 90 40 / 0.3)" strokeWidth={0.7} strokeDasharray="2 1.3" />
        <circle cx={14} cy={0} r={10.6} fill="none" stroke="#f96b0b" strokeWidth={2.4} />
        <circle cx={14} cy={0} r={9.3} fill="url(#voy-crown)" />
        <circle cx={14} cy={0} r={6.4} fill="none" stroke="rgb(140 90 40 / 0.25)" strokeWidth={0.6} strokeDasharray="1.6 1.2" />
        <ellipse cx={10.5} cy={-4} rx={4} ry={2.6} fill="rgb(255 255 255 / 0.5)" transform="rotate(-35 10.5 -4)" />
      </g>
    </svg>
  );
}
