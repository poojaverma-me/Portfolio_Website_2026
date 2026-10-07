/**
 * GPU drawing for the creatures and the bubbles, so the whole scene stays in
 * one WebGL context with no per-frame canvas uploads.
 *
 * - CreatureLayer draws every animal into a full-resolution layer that the
 *   water shader then sees through the surface. The animals are painted
 *   character sprites (scripts/bake-cartoon.py), cut into parts: a swimmer's
 *   body is a ribbon bent along its spine, a turtle's flippers and a
 *   jellyfish's arms and tentacles are strips of their own. Each kind has a
 *   colour texture with a soft alpha edge and a shape texture: a surface
 *   normal raised from the silhouette, turned here to follow the bending body.
 *   The paintings carry their own shading, so the sun only adds a soft wrap
 *   and a crisp cel glint. Deeper animals are drawn from blurrier mip levels
 *   and fade toward the colour of the water above them.
 * - BubbleLayer draws every bubble as an instanced quad shaded by a distance
 *   field: a thin bright rim, a faint body and a highlight up and to the left.
 */

import { type Program, program } from "./gl";

export type CreatureKind = "orca" | "shark" | "fish" | "turtle" | "jelly";

/**
 * Floats per vertex: position (2), texture coordinate (2), the angle the part
 * is turned to, lift (extra nearness), opacity (negative for a mirrored part)
 * and depth.
 */
export const CREATURE_STRIDE = 8;

const CREATURE_VS = `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec2 aUv;
layout(location = 2) in float aAngle;
layout(location = 3) in float aLift;
layout(location = 4) in float aAlpha;
layout(location = 5) in float aDepth;
uniform vec2 uView;
uniform vec2 uCam;
uniform float uZoom;
out vec2 vUv;
out float vAngle;
out float vDepth;
out float vAlpha;
out float vMirror;
void main() {
  vUv = aUv;
  vAngle = aAngle;
  vDepth = clamp(aDepth + aLift, 0.0, 1.0);
  vAlpha = abs(aAlpha);
  vMirror = aAlpha < 0.0 ? -1.0 : 1.0;
  vec2 screen = (aPos - uCam) * uZoom + uView * 0.5;
  vec2 c = screen / uView * 2.0 - 1.0;
  gl_Position = vec4(c.x, -c.y, 0.0, 1.0);
}`;

const CREATURE_FS = `#version 300 es
precision highp float;
in vec2 vUv;
in float vAngle;
in float vDepth;
in float vAlpha;
in float vMirror;
uniform sampler2D uAlbedo;
uniform sampler2D uShape;
uniform float uFade;
uniform vec3 uWater;
out vec4 o;
// toward the sun: up and to the left, as in the water shader
const vec3 L = vec3(-0.42, -0.5, 0.76) / 1.0748;
void main() {
  float depth = vDepth;
  // the deeper the animal, the blurrier: the water above it scatters the image
  float bias = (1.0 - depth) * 2.2;
  vec4 a = texture(uAlbedo, vUv, bias);
  if (a.a < 0.003) discard;
  vec4 sh = texture(uShape, vUv, bias);
  vec3 albedo = a.rgb / a.a;
  // the normal is stored in the part's own frame; a mirrored part flips it
  vec2 nb = (sh.rg * 2.0 - 1.0) * vec2(1.0, vMirror);
  float c = cos(vAngle);
  float s = sin(vAngle);
  vec3 N = normalize(vec3(c * nb.x - s * nb.y, s * nb.x + c * nb.y, sqrt(max(1.0 - dot(nb, nb), 0.0))));
  float diffuse = dot(N, L);
  // the painting is already shaded: the sun only wraps a little light round it
  vec3 lit = albedo * (0.8 + 0.32 * smoothstep(-0.25, 0.95, diffuse));
  // and puts a crisp, cartoon glint on the ones near the surface
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  // (only where the body turns toward the sun, not across its flat top)
  float glint = smoothstep(0.978, 0.992, dot(N, H));
  lit += vec3(0.9, 0.97, 1.0) * glint * 0.22 * depth * depth;
  // water above the animal tints it toward the sea and lowers its contrast
  vec3 col = mix(uWater, lit, mix(0.42, 0.97, depth));
  float alpha = a.a * mix(0.62, 1.0, depth) * uFade * vAlpha;
  o = vec4(col * alpha, alpha);
}`;

const KINDS: CreatureKind[] = ["orca", "shark", "fish", "turtle", "jelly"];

type Pair = { albedo: WebGLTexture; shape: WebGLTexture };

export type CreatureDraw = { kind: CreatureKind; first: number; count: number };

export class CreatureLayer {
  private gl: WebGL2RenderingContext;
  readonly prog: Program;
  private vao: WebGLVertexArrayObject;
  private buf: WebGLBuffer;
  readonly verts = new Float32Array(CREATURE_STRIDE * 12288);
  tex: WebGLTexture | null = null;
  private fbo: WebGLFramebuffer | null = null;
  private w = 1;
  private h = 1;
  private textures = new Map<CreatureKind, Pair>();
  private pending = 0;
  /** when the last texture arrived (performance.now), or -1 while loading */
  loadedAt = -1;

  constructor(gl: WebGL2RenderingContext, base = "/voyage") {
    this.gl = gl;
    this.prog = program(gl, CREATURE_VS, CREATURE_FS);
    this.vao = gl.createVertexArray()!;
    this.buf = gl.createBuffer()!;
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.bufferData(gl.ARRAY_BUFFER, this.verts.byteLength, gl.DYNAMIC_DRAW);
    const F = 4;
    const stride = CREATURE_STRIDE * F;
    const attrs = [2, 2, 1, 1, 1, 1];
    let offset = 0;
    attrs.forEach((size, i) => {
      gl.enableVertexAttribArray(i);
      gl.vertexAttribPointer(i, size, gl.FLOAT, false, stride, offset * F);
      offset += size;
    });
    gl.bindVertexArray(null);
    for (const kind of KINDS) {
      this.textures.set(kind, {
        albedo: this.load(`${base}/${kind}-albedo.webp`, true),
        shape: this.load(`${base}/${kind}-shape.webp`, false),
      });
    }
  }

  get ready() {
    return this.pending === 0;
  }

  /** Starts loading an image into a mipmapped texture. */
  private load(url: string, premultiply: boolean): WebGLTexture {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    // a transparent texel until the image arrives
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    this.pending++;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
      // colour is stored premultiplied so mipmaps fade edges without dark fringes;
      // the shape map keeps its alpha as data
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiply);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.pending--;
      if (this.pending === 0) this.loadedAt = performance.now();
    };
    img.onerror = () => {
      this.pending--;
      if (this.pending === 0) this.loadedAt = performance.now();
    };
    img.src = url;
    return tex;
  }

  /** A full-resolution RGBA target the size of the canvas. */
  size(w: number, h: number) {
    const gl = this.gl;
    if (this.tex) gl.deleteTexture(this.tex);
    if (this.fbo) gl.deleteFramebuffer(this.fbo);
    this.w = Math.max(1, w);
    this.h = Math.max(1, h);
    this.tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, this.w, this.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    this.fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  /**
   * Draws the strips laid out in `verts` (see StripWriter): each entry of
   * `draws` is a run of animals of one kind, stitched into one strip.
   * The camera maps world (CSS px) to the screen; W × H is the view in CSS px.
   */
  draw(
    draws: CreatureDraw[],
    used: number,
    W: number,
    H: number,
    cam: { x: number; y: number; zoom: number },
    water: [number, number, number],
    fade: number,
  ) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, this.w, this.h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (fade > 0 && used > 0) {
      const p = this.prog;
      gl.useProgram(p.prog);
      gl.uniform2f(p.u("uView"), W, H);
      gl.uniform2f(p.u("uCam"), cam.x, cam.y);
      gl.uniform1f(p.u("uZoom"), cam.zoom);
      gl.uniform3f(p.u("uWater"), water[0], water[1], water[2]);
      gl.uniform1f(p.u("uFade"), fade);
      gl.uniform1i(p.u("uAlbedo"), 0);
      gl.uniform1i(p.u("uShape"), 1);
      gl.bindVertexArray(this.vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.verts, 0, used * CREATURE_STRIDE);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      let bound: CreatureKind | null = null;
      for (const d of draws) {
        if (d.kind !== bound) {
          const t = this.textures.get(d.kind)!;
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, t.albedo);
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, t.shape);
          bound = d.kind;
        }
        gl.drawArrays(gl.TRIANGLE_STRIP, d.first, d.count);
      }
      gl.disable(gl.BLEND);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindVertexArray(null);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
}

/**
 * Writes triangle strips into a CreatureLayer's vertex array. Consecutive
 * strips of one kind are stitched into a single strip with two repeated
 * (zero-area) vertices between them, so a whole run of animals is one draw.
 */
export class StripWriter {
  draws: CreatureDraw[] = [];
  used = 0;
  private open = false;
  private kind: CreatureKind | null = null;
  private startOfStrip = 0;
  constructor(readonly verts: Float32Array) {}

  reset() {
    this.draws.length = 0;
    this.used = 0;
    this.kind = null;
    this.open = false;
  }

  /** room for n more vertices (plus stitching)? */
  fits(n: number) {
    return (this.used + n + 2) * CREATURE_STRIDE <= this.verts.length;
  }

  begin(kind: CreatureKind) {
    if (kind !== this.kind) {
      this.draws.push({ kind, first: this.used, count: 0 });
      this.kind = kind;
      this.open = false;
    }
    this.startOfStrip = this.used;
    this.stitch = this.open;
  }
  private stitch = false;

  vertex(x: number, y: number, u: number, v: number, angle: number, lift: number, alpha: number, depth: number) {
    const f = this.verts;
    if (this.stitch) {
      // repeat the previous strip's last vertex, then this strip's first
      const prev = (this.used - 1) * CREATURE_STRIDE;
      f.copyWithin(this.used * CREATURE_STRIDE, prev, prev + CREATURE_STRIDE);
      this.used++;
      this.put(x, y, u, v, angle, lift, alpha, depth);
      this.stitch = false;
    }
    this.put(x, y, u, v, angle, lift, alpha, depth);
  }

  private put(x: number, y: number, u: number, v: number, angle: number, lift: number, alpha: number, depth: number) {
    const o = this.used * CREATURE_STRIDE;
    const f = this.verts;
    f[o] = x;
    f[o + 1] = y;
    f[o + 2] = u;
    f[o + 3] = v;
    f[o + 4] = angle;
    f[o + 5] = lift;
    f[o + 6] = alpha;
    f[o + 7] = depth;
    this.used++;
    this.draws[this.draws.length - 1].count = this.used - this.draws[this.draws.length - 1].first;
  }

  end() {
    this.open = this.used > this.startOfStrip;
  }
}

const BUBBLE_VS = `#version 300 es
layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec4 aBubble;
uniform vec2 uView;
uniform vec2 uCam;
uniform float uZoom;
out vec2 vLocal;
out float vR;
out float vA;
void main() {
  float r = aBubble.z * uZoom;
  float pad = r + 1.5;
  vLocal = aCorner * pad;
  vR = r;
  vA = aBubble.w;
  vec2 screen = (aBubble.xy - uCam) * uZoom + uView * 0.5 + vLocal;
  vec2 c = screen / uView * 2.0 - 1.0;
  gl_Position = vec4(c.x, -c.y, 0.0, 1.0);
}`;
const BUBBLE_FS = `#version 300 es
precision mediump float;
in vec2 vLocal;
in float vR;
in float vA;
out vec4 o;
void main() {
  float d = length(vLocal);
  vec3 col;
  float a;
  if (vR < 1.5) {
    float r = max(vR, 0.7);
    a = (1.0 - smoothstep(r - 0.3, r + 0.7, d)) * 0.85;
    col = vec3(0.9, 0.98, 1.0) * a;
  } else {
    float w = max(0.6, vR * 0.16);
    float rim = (1.0 - smoothstep(w * 0.5 - 0.5, w * 0.5 + 0.5, abs(d - vR))) * 0.78;
    float body = (1.0 - smoothstep(vR - 0.5, vR + 0.5, d)) * 0.12;
    float hl = (1.0 - smoothstep(vR * 0.27 - 0.5, vR * 0.27 + 0.5, length(vLocal + vR * 0.38))) * 0.95;
    col = vec3(0.88, 0.97, 1.0) * rim + vec3(0.62, 0.88, 1.0) * body + vec3(1.0) * hl;
    a = max(max(rim, body), hl);
  }
  o = vec4(col, a) * vA;
}`;

export const MAX_BUBBLES = 320;

export class BubbleLayer {
  private gl: WebGL2RenderingContext;
  readonly prog: Program;
  private vao: WebGLVertexArrayObject;
  private inst: WebGLBuffer;
  readonly data = new Float32Array(MAX_BUBBLES * 4);

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.prog = program(gl, BUBBLE_VS, BUBBLE_FS);
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this.inst = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.inst);
    gl.bufferData(gl.ARRAY_BUFFER, this.data.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(1, 1);
    gl.bindVertexArray(null);
  }

  /**
   * Draws the first `n` bubbles in `data` (x, y, r, alpha) over the current
   * target, seen by a camera centred on (camX, camY) at `zoom`.
   */
  draw(n: number, W: number, H: number, camX: number, camY: number, zoom: number) {
    if (n <= 0) return;
    const gl = this.gl;
    gl.useProgram(this.prog.prog);
    gl.uniform2f(this.prog.u("uView"), W, H);
    gl.uniform2f(this.prog.u("uCam"), camX, camY);
    gl.uniform1f(this.prog.u("uZoom"), zoom);
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.inst);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.data, 0, n * 4);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, n);
    gl.disable(gl.BLEND);
    gl.bindVertexArray(null);
  }
}
