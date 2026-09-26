/**
 * The sea, drawn in one full-screen pass. Work happens in CSS pixels with y
 * pointing down so the numbers match geometry.ts.
 *
 * Layers, bottom to top: depth colour, sunlight and shafts, the creatures
 * (read from a texture drawn by creatures.ts), caustics, glints, the boat's
 * shadow, bow foam, the Kelvin wake, oar puddles, and the bright meniscus at
 * the water's edge. Outside the water there is only a faint ember glow.
 *
 * All colours are shades of the site's one accent, #f96b0b.
 */

export const MAX_DROPS = 32;
export const MAX_PUDDLES = 16;

export const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

export const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uScale;
uniform vec2 uView;
uniform float uTime;

uniform vec2 uP0;
uniform vec2 uDir;
uniform vec2 uPerp;
uniform float uL;
uniform float uBend;
uniform float uHead;
uniform float uWHead;
uniform float uWTail;
uniform float uSpread;
uniform float uLead;
uniform float uBoatLen;

uniform vec2 uBoat;
uniform vec2 uBoatDir;
uniform float uWake;
uniform vec2 uSun;

uniform vec4 uDrops[${MAX_DROPS}];
uniform vec4 uPuddles[${MAX_PUDDLES}];
uniform sampler2D uLife;

const vec3 C_SHALLOW = vec3(1.0, 0.56, 0.20);
const vec3 C_MID     = vec3(0.88, 0.31, 0.03);
const vec3 C_DEEP    = vec3(0.50, 0.13, 0.012);
const vec3 C_ABYSS   = vec3(0.21, 0.045, 0.0);
const vec3 C_CAUSTIC = vec3(1.0, 0.83, 0.60);
const vec3 C_SUN     = vec3(1.0, 0.72, 0.42);
const vec3 C_FOAM    = vec3(1.0, 0.96, 0.90);
const vec3 C_GLOW    = vec3(0.976, 0.42, 0.043);

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
vec2 hash2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 s = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), s.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), s.x), s.y);
}
float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    s += a * noise(p);
    p = p * 2.03 + 17.1;
    a *= 0.5;
  }
  return s / 0.875;
}
float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

// Distance to the nearest border between drifting Voronoi cells. Caustics are
// light focused into exactly this kind of net.
float cellEdge(vec2 x, float t) {
  vec2 n = floor(x);
  vec2 f = fract(x);
  vec2 mg = vec2(0.0);
  vec2 mr = vec2(0.0);
  float md = 8.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = 0.5 + 0.42 * sin(t + 6.2831 * hash2(n + g));
      vec2 r = g + o - f;
      float d = dot(r, r);
      if (d < md) { md = d; mr = r; mg = g; }
    }
  }
  md = 8.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = mg + vec2(float(i), float(j));
      vec2 o = 0.5 + 0.42 * sin(t + 6.2831 * hash2(n + g));
      vec2 r = g + o - f;
      vec2 dr = r - mr;
      if (dot(dr, dr) > 0.00001) md = min(md, dot(0.5 * (mr + r), normalize(dr)));
    }
  }
  return md;
}

float caustics(vec2 p, float t) {
  // a strong, two-scale warp bends the cell walls into the curling threads
  // that real caustics make
  vec2 w = p + 0.42 * vec2(
    sin(p.y * 0.9 + t * 0.8) + 0.5 * sin(p.y * 2.3 - t * 1.1),
    cos(p.x * 0.8 - t * 0.7) + 0.5 * cos(p.x * 2.1 + t)
  );
  float a = cellEdge(w, t * 0.9);
  float b = cellEdge(w * 1.33 + 4.1, 1.7 - t * 0.7);
  float la = 1.0 - smoothstep(0.0, 0.055, a);
  float lb = 1.0 - smoothstep(0.0, 0.05, b);
  return la * 0.6 + lb * 0.34 + la * lb * 0.9 + exp(-a * 14.0) * 0.12;
}

vec3 outsideGlow(float sd) {
  float s = max(sd, 0.0);
  return C_GLOW * (exp(-s / 70.0) * 0.075 + exp(-s / 14.0) * 0.07);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uScale;

  // --- where the water is -------------------------------------------------
  vec2 q = p - uP0;
  float u = dot(q, uDir) / uL;
  float v = dot(q, uPerp) - uBend * 4.0 * u * (1.0 - u);
  float behind = (uHead - u) * uL;
  float grow = 1.0 - exp(-max(behind, 0.0) / uSpread);
  float w = uWHead + (uWTail - uWHead) * grow;

  // each bank gets its own ripple, blended through the middle so the two
  // noises never meet in a seam
  float along = u * uL / uBoatLen;
  float nA = fbm(vec2(along * 1.5 + uTime * 0.06, 3.7));
  float nB = fbm(vec2(along * 1.5 - uTime * 0.05, 11.3));
  float nBig = noise(vec2(along * 0.42, 1.3 + step(0.0, v) * 7.0));
  float bank = smoothstep(-0.3, 0.3, v / max(w, 1.0));
  float n = mix(nA, nB, bank) - 0.5 + (nBig - 0.5) * 0.8;
  float amp = mix(0.05, 0.22, grow);
  float wEdge = w * (1.0 + amp * n * 2.0);

  float sd;
  if (behind >= 0.0) {
    sd = abs(v) - wEdge;
  } else {
    // the rounded bow wave just ahead of the boat
    float cap = length(vec2(-behind / uLead, v / max(wEdge, 1.0)));
    sd = (cap - 1.0) * uWHead;
  }

  // splashes, merged into the body where they touch it
  float sdw = sd;
  for (int i = 0; i < ${MAX_DROPS}; i++) {
    vec4 d = uDrops[i];
    if (d.z <= 0.0) continue;
    sdw = smin(sdw, length(p - d.xy) - d.z, d.w);
  }

  // nothing but the glow outside the water, so skip the expensive part
  if (sdw > 1.0) {
    gl_FragColor = vec4(outsideGlow(sdw), 1.0);
    return;
  }

  float mask = smoothstep(0.8, -0.8, sdw);

  // --- depth ---------------------------------------------------------------
  float vn = clamp(abs(v) / max(wEdge, 1.0), 0.0, 1.0);
  float depth = 1.0 - vn * vn;
  if (behind < 0.0) depth *= clamp(1.0 + behind / uLead, 0.0, 1.0);
  depth *= mix(0.42, 1.0, grow);
  float patchy = fbm(p / (uBoatLen * 1.1) + vec2(uTime * 0.03, 0.0));
  float dpt = clamp(depth * 1.1 + (patchy - 0.5) * 0.5, 0.0, 1.0);

  vec3 col = mix(C_SHALLOW, C_MID, smoothstep(0.0, 0.3, dpt));
  col = mix(col, C_DEEP, smoothstep(0.25, 0.85, dpt));
  col = mix(col, C_ABYSS, smoothstep(0.5, 1.0, dpt) * smoothstep(uBoatLen * 0.6, uBoatLen * 4.0, behind) * 0.75);

  // --- sunlight from the upper left, with slow shafts ------------------------
  vec2 sp = (p - uSun) / uBoatLen;
  float sun = exp(-dot(sp, sp) / 1.4);
  vec2 rayDir = normalize(vec2(1.0, 0.62));
  float rays = noise(vec2(dot(p, vec2(rayDir.y, -rayDir.x)) / (uBoatLen * 0.085), uTime * 0.22));
  col += C_SUN * (sun * 0.22 + sun * smoothstep(0.55, 0.95, rays) * 0.2) * (1.0 - dpt * 0.4);

  // --- whales and fish, drawn by creatures.ts --------------------------------
  // five taps soften the silhouettes, deeper under the surface than at it
  vec2 luv = p / uView;
  vec2 lo = 1.6 / uView;
  vec2 life = texture2D(uLife, luv).rg * 0.36
    + (texture2D(uLife, luv + vec2(lo.x, lo.y)).rg
    + texture2D(uLife, luv + vec2(-lo.x, lo.y)).rg
    + texture2D(uLife, luv + vec2(lo.x, -lo.y)).rg
    + texture2D(uLife, luv + vec2(-lo.x, -lo.y)).rg) * 0.16;
  col = mix(col, col * vec3(0.15, 0.095, 0.085) + vec3(0.025, 0.005, 0.0), life.r);
  col += vec3(0.2, 0.075, 0.025) * life.g * life.r;

  // --- caustics ---------------------------------------------------------------
  // light pools in patches and fades with depth
  float cz = caustics(p / (uBoatLen * 0.12), uTime * 0.85);
  float pool = smoothstep(0.2, 0.85, fbm(p / (uBoatLen * 0.8) + vec2(0.0, uTime * 0.06)));
  float thread = 0.45 + 0.55 * noise(p / (uBoatLen * 0.06) + uTime * 0.4);
  float ci = mix(1.15, 0.16, dpt) * (0.4 + 0.6 * pool) * thread * (1.0 + sun * 0.9) * (1.0 - life.r * 0.72);
  col += C_CAUSTIC * cz * ci;

  // --- glints on the surface --------------------------------------------------
  vec2 cell = floor(p / 11.0);
  vec2 rnd = hash2(cell);
  vec2 cp = (cell + 0.15 + 0.7 * rnd) * 11.0;
  float tw = pow(max(0.0, sin(uTime * (1.4 + rnd.x * 2.6) + rnd.y * 40.0)), 26.0);
  float glint = tw * step(0.8, hash(cell + 7.1)) * smoothstep(1.8, 0.2, length(p - cp));
  col += C_FOAM * glint * (0.95 - dpt * 0.6) * (0.55 + sun);

  // --- the boat: shadow, bow foam, wake ----------------------------------------
  vec2 bn = vec2(-uBoatDir.y, uBoatDir.x);
  vec2 bq = p - uBoat;
  float lx = dot(bq, uBoatDir);
  float ly = dot(bq, bn);
  float ha = uBoatLen * 0.5;
  float hb = uBoatLen * 0.185;
  float e = length(vec2(lx / ha, ly / hb));

  vec2 sq = bq - vec2(uBoatLen * 0.05, uBoatLen * 0.08);
  float se = length(vec2(dot(sq, uBoatDir) / ha, dot(sq, bn) / (hb * 1.08)));
  col *= 1.0 - smoothstep(1.3, 0.55, se) * 0.5;

  float foam = 0.0;
  float churn = noise(p * 0.11 + uTime * 2.2);
  float hullFoam = smoothstep(1.42, 1.04, e) * smoothstep(0.9, 1.04, e);
  hullFoam *= (0.3 + 0.7 * smoothstep(-0.4, 0.9, lx / ha)) * (0.45 + 0.55 * churn);
  foam += hullFoam * (0.35 + 0.65 * uWake);

  float bx = -(lx + ha * 0.88);
  if (bx > 0.0) {
    float arm = abs(ly) - (hb * 0.85 + bx * 0.34);
    float wdt = 1.4 + bx * 0.03;
    float line = exp(-arm * arm / (wdt * wdt));
    float fade = exp(-bx / (uBoatLen * 2.3)) * smoothstep(0.0, 14.0, bx);
    float brk = smoothstep(0.2, 0.75, noise(vec2(bx * 0.05 - uTime * 1.1, ly * 0.07)));
    float wash = exp(-ly * ly / (hb * hb * 0.7)) * exp(-bx / (uBoatLen * 0.8));
    wash *= smoothstep(0.35, 0.8, noise(vec2(bx * 0.09 - uTime * 1.4, ly * 0.2)));
    foam += (line * fade * (0.3 + 0.7 * brk) + wash * 0.4) * uWake;
  }

  // the pair of swirls each oar stroke leaves behind
  for (int i = 0; i < ${MAX_PUDDLES}; i++) {
    vec4 pd = uPuddles[i];
    if (pd.w <= 0.0) continue;
    float age = pd.z;
    float dist = length(p - pd.xy);
    float R = uBoatLen * (0.03 + 0.045 * age);
    float th = 1.1 + age * 1.8;
    float ring = exp(-pow((dist - R) / th, 2.0));
    float swirl = smoothstep(R, 0.0, dist) * 0.22;
    foam += (ring * 0.75 + swirl) * pd.w * exp(-age * 0.75);
  }

  col = mix(col, C_FOAM, clamp(foam, 0.0, 1.0) * 0.82);

  // --- the meniscus -------------------------------------------------------------
  float rim = smoothstep(-8.0, -0.5, sdw);
  col = mix(col, C_SHALLOW * 1.06, rim * 0.5);
  col += C_FOAM * exp(-pow((sdw + 1.6) / 1.1, 2.0)) * 0.3;

  // a little grain keeps the dark gradients from banding
  col += (hash(p + fract(uTime) * 91.0) - 0.5) * 0.02;

  gl_FragColor = vec4(mix(outsideGlow(sdw), col, mask), 1.0);
}
`;
