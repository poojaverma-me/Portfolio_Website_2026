/**
 * The sea, drawn in one full-screen pass from the simulated surface
 * (fluid.ts). Work happens in CSS pixels with y pointing down.
 *
 * The optics follow the surface rather than decorate it:
 * - the normal comes from the gradient of the simulated wave height, plus a
 *   fine capillary chop;
 * - caustics are light focused by that surface, so their net is displaced by
 *   the slope and brightened where the surface is convex (intensity grows as
 *   the Laplacian of the height goes negative), which is why ripple rings show
 *   up as bright rings on the bed;
 * - what lies beneath (orcas, sharks, turtles, jellyfish and fish, drawn by CreatureLayer) is
 *   seen through the surface, so it is refracted by the same slope;
 * - glints are real specular reflection of a sun in the upper left;
 * - foam and calm slicks are dyes carried by the simulated current.
 *
 * The palette follows the reference painting: a cyan and cobalt sea on black,
 * navy orcas, white foam and near-white caustics.
 */

export const MAX_DROPS = 32;

export const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

export const FRAG = `#version 300 es
precision highp float;
precision highp sampler2D;
out vec4 o;

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
uniform vec2 uSun;

uniform vec4 uDrops[${MAX_DROPS}];
uniform sampler2D uLife;
uniform sampler2D uWave;
uniform sampler2D uDye;
uniform vec2 uSimTexel;
uniform float uCell;
// the camera: the world point at the centre of the screen, how far in it is
// zoomed, and how far the frame has faded to black
uniform vec2 uCam;
uniform float uZoom;
uniform float uDark;

// the reference painting's sea: cyan shallows over a cobalt deep, with
// near-white caustics and navy orcas
const vec3 C_SHALLOW = vec3(0.26, 0.80, 0.95);
const vec3 C_MID     = vec3(0.02, 0.52, 0.76);
const vec3 C_DEEP    = vec3(0.015, 0.30, 0.52);
const vec3 C_ABYSS   = vec3(0.012, 0.17, 0.32);
const vec3 C_CAUSTIC = vec3(0.80, 0.97, 1.0);
const vec3 C_SUN     = vec3(0.72, 0.93, 1.0);
const vec3 C_FOAM    = vec3(0.96, 0.99, 1.0);
const vec3 C_GLOW    = vec3(0.03, 0.55, 0.80);
// toward the sun: up and to the left, well above the horizon
const vec3 SUN_DIR   = vec3(-0.42, -0.5, 0.76);

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

// distance to the nearest wall between drifting Voronoi cells: the net that
// focused sunlight draws on a shallow bed
float cellEdge(vec2 x, float t) {
  vec2 n = floor(x);
  vec2 f = fract(x);
  vec2 mg = vec2(0.0);
  vec2 mr = vec2(0.0);
  float md = 8.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 q = 0.5 + 0.42 * sin(t + 6.2831 * hash2(n + g));
      vec2 r = g + q - f;
      float d = dot(r, r);
      if (d < md) { md = d; mr = r; mg = g; }
    }
  }
  md = 8.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = mg + vec2(float(i), float(j));
      vec2 q = 0.5 + 0.42 * sin(t + 6.2831 * hash2(n + g));
      vec2 r = g + q - f;
      vec2 dr = r - mr;
      if (dot(dr, dr) > 0.00001) md = min(md, dot(0.5 * (mr + r), normalize(dr)));
    }
  }
  return md;
}

float caustics(vec2 p, float t) {
  vec2 w = p + 0.42 * vec2(
    sin(p.y * 0.9 + t * 0.8) + 0.5 * sin(p.y * 2.3 - t * 1.1),
    cos(p.x * 0.8 - t * 0.7) + 0.5 * cos(p.x * 2.1 + t)
  );
  float a = cellEdge(w, t * 0.9);
  float b = cellEdge(w * 1.33 + 4.1, 1.7 - t * 0.7);
  float la = 1.0 - smoothstep(0.0, 0.038, a);
  float lb = 1.0 - smoothstep(0.0, 0.032, b);
  return la * 0.6 + lb * 0.34 + la * lb * 0.9 + exp(-a * 14.0) * 0.12;
}

vec3 outsideGlow(float sd) {
  float s = max(sd, 0.0);
  return C_GLOW * (exp(-s / 70.0) * 0.075 + exp(-s / 14.0) * 0.07);
}

void main() {
  vec2 ps = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uScale;
  vec2 p = uCam + (ps - uView * 0.5) / uZoom;
  vec2 su = vec2(p.x / uView.x, 1.0 - p.y / uView.y);
  float h = texture(uWave, su).r;

  // --- where the water is -------------------------------------------------
  vec2 q = p - uP0;
  float u = dot(q, uDir) / uL;
  float v = dot(q, uPerp) - uBend * 4.0 * u * (1.0 - u);
  float behind = (uHead - u) * uL;
  float grow = 1.0 - exp(-max(behind, 0.0) / uSpread);
  float w = uWHead + (uWTail - uWHead) * grow;

  // cheap bounds first: the edge noise moves the bank by at most 0.4 w, and
  // every splash lies within half a boat length of it
  float amp = mix(0.05, 0.2, grow);
  float reach = w * amp * 2.0;
  float sd0 = behind >= 0.0
    ? abs(v) - w
    : (length(vec2(-behind / uLead, v / max(w, 1.0))) - 1.0) * uWHead;
  if (sd0 - reach > uBoatLen * 0.6) {
    o = vec4(outsideGlow(sd0 - reach) * (1.0 - uDark), 1.0);
    return;
  }

  // the organic bank, only where it can matter
  float wEdge = w;
  if (sd0 > -reach * 1.2) {
    float along = u * uL / uBoatLen;
    float nA = fbm(vec2(along * 1.3 + uTime * 0.06, 3.7));
    float nB = fbm(vec2(along * 1.3 - uTime * 0.05, 11.3));
    float nBig = noise(vec2(along * 0.4, 1.3 + step(0.0, v) * 7.0));
    float bank = smoothstep(-0.3, 0.3, v / max(w, 1.0));
    float n = mix(nA, nB, bank) - 0.5 + (nBig - 0.5) * 0.8;
    wEdge = w * (1.0 + amp * n * 2.0);
  }

  float sd;
  if (behind >= 0.0) {
    sd = abs(v) - wEdge;
  } else {
    float cap = length(vec2(-behind / uLead, v / max(wEdge, 1.0)));
    sd = (cap - 1.0) * uWHead;
  }
  // waves reaching the bank lift it
  sd -= h * 0.6;

  float sdw = sd;
  for (int i = 0; i < ${MAX_DROPS}; i++) {
    vec4 d = uDrops[i];
    if (d.z <= 0.0) continue;
    sdw = smin(sdw, length(p - d.xy) - d.z, d.w);
  }

  if (sdw > 1.0) {
    o = vec4(outsideGlow(sdw) * (1.0 - uDark), 1.0);
    return;
  }
  float mask = smoothstep(0.8, -0.8, sdw);

  // --- the surface ------------------------------------------------------------
  float hL = texture(uWave, su - vec2(uSimTexel.x, 0.0)).r;
  float hR = texture(uWave, su + vec2(uSimTexel.x, 0.0)).r;
  float hT = texture(uWave, su + vec2(0.0, uSimTexel.y)).r;
  float hB = texture(uWave, su - vec2(0.0, uSimTexel.y)).r;
  // slope in screen space (y down) and curvature, from the simulated height
  vec2 slope = vec2(hR - hL, hB - hT) / (2.0 * uCell);
  float curv = (hL + hR + hT + hB - 4.0 * h) / (uCell * uCell);
  // fine capillary chop on top
  vec2 cp = p / (uBoatLen * 0.05);
  float c0 = noise(cp + uTime * 0.9);
  vec2 chop = vec2(noise(cp + vec2(0.7, 0.0) + uTime * 0.9) - c0, noise(cp + vec2(0.0, 0.7) + uTime * 0.9) - c0) * 0.12;
  vec3 N = normalize(vec3(-(slope + chop), 1.0));
  vec4 dye = texture(uDye, su);
  float calm = clamp(dye.g, 0.0, 1.0);

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

  // --- sunlight and shafts --------------------------------------------------
  vec2 sp = (p - uSun) / uBoatLen;
  float sun = exp(-dot(sp, sp) / 1.4);
  vec2 rayDir = normalize(vec2(1.0, 0.62));
  float rays = noise(vec2(dot(p, vec2(rayDir.y, -rayDir.x)) / (uBoatLen * 0.085), uTime * 0.22));
  col += C_SUN * (sun * 0.22 + sun * smoothstep(0.55, 0.95, rays) * 0.2) * (1.0 - dpt * 0.4);

  // --- what lies beneath, seen through the moving surface ---------------------
  // the creature layer is already lit, tinted by depth and soft-edged, in
  // screen pixels (CreatureLayer); the surface slope bends the view of it
  vec2 luv = gl_FragCoord.xy / uRes + vec2(N.x, -N.y) * (3.0 + 5.0 * dpt) * uScale * uZoom / uRes;
  vec4 lc = texture(uLife, luv);
  col = col * (1.0 - lc.a) + lc.rgb;

  // --- caustics, focused by the surface ----------------------------------------
  float focus = clamp(1.0 - curv * 12.0, 0.45, 2.0);
  float pool = smoothstep(0.2, 0.85, fbm(p / (uBoatLen * 0.8) + vec2(0.0, uTime * 0.06)));
  float ci = mix(1.15, 0.16, dpt) * (0.4 + 0.6 * pool) * (1.0 + sun * 0.9) * (1.0 - lc.a * 0.4) * focus * (1.0 - 0.55 * calm);
  // light only nets where enough of it reaches the bed
  if (ci > 0.04) {
    float thread = 0.45 + 0.55 * noise(p / (uBoatLen * 0.06) + uTime * 0.4);
    col += C_CAUSTIC * caustics(p / (uBoatLen * 0.12) + slope * 1.1, uTime * 0.85) * ci * thread;
  }
  // broad focusing even between the threads, so rings read as light
  col += C_CAUSTIC * clamp(-curv * 2.5, -0.06, 0.18) * (1.0 - dpt * 0.5);

  // --- light on the surface -----------------------------------------------------
  // slopes facing the sun are brighter, a calm slick is glassier
  col *= 1.0 + dot(N.xy, SUN_DIR.xy) * 0.55;
  col = mix(col, col * 0.86, calm * 0.6);
  vec3 H = normalize(SUN_DIR + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(N, H), 0.0), 220.0) * (1.0 - calm * 0.8);
  col += C_FOAM * spec * 1.6;

  // --- the boat's shadow on the water -------------------------------------------
  vec2 bn = vec2(-uBoatDir.y, uBoatDir.x);
  vec2 sq = p - uBoat - vec2(uBoatLen * 0.05, uBoatLen * 0.08);
  float se = length(vec2(dot(sq, uBoatDir) / (uBoatLen * 0.5), dot(sq, bn) / (uBoatLen * 0.2)));
  col *= 1.0 - smoothstep(1.3, 0.55, se) * 0.5;

  // --- white water, carried by the current ----------------------------------------
  // as in the painting the wake reads as clean white ribbons: a line where the
  // foam's edge lies, torn streaks at the stern, and a few loose bubbles
  float f = dye.r;
  if (f > 0.02) {
    float tear = fbm(p / (uBoatLen * 0.14) + vec2(uTime * 0.05, 0.0));
    // contour lines of the foam, a constant couple of pixels wide whatever the
    // gradient, so a broad fading patch shows only its rim
    float fw = max(fwidth(f) * 1.4, 0.002);
    float ribbon = max(exp(-pow((f - 0.22) / fw, 2.0)), exp(-pow((f - 0.5) / fw, 2.0)) * 0.8)
      * smoothstep(0.3, 0.55, tear);
    float streak = smoothstep(0.72, 1.0, f) * smoothstep(0.62, 0.76, tear);
    vec2 fq = p / (uBoatLen * 0.08);
    vec2 fp = p / (uBoatLen * 0.03) + 0.7 * vec2(noise(fq), noise(fq + 5.2));
    float speck = (1.0 - smoothstep(0.0, 0.07, cellEdge(fp, uTime * 0.4))) * smoothstep(0.08, 0.6, f) * smoothstep(0.55, 0.8, tear);
    col = mix(col, C_FOAM, clamp(ribbon * 0.85 + streak * 0.7 + speck * 0.3, 0.0, 0.9));
  }

  // --- the meniscus ------------------------------------------------------------------
  float rim = smoothstep(-8.0, -0.5, sdw);
  col = mix(col, C_SHALLOW * 1.06, rim * 0.5);
  col += C_FOAM * exp(-pow((sdw + 1.6) / 1.1, 2.0)) * 0.3;

  col += (hash(ps + fract(uTime) * 91.0) - 0.5) * 0.02;
  o = vec4(mix(outsideGlow(sdw), col, mask) * (1.0 - uDark), 1.0);
}
`;
