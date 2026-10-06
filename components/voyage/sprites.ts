/**
 * GPU drawing for the creatures and the bubbles, so the whole scene stays in
 * one WebGL context with no per-frame canvas uploads.
 *
 * - CreatureLayer draws every whale, shark and fish as a textured ribbon bent
 *   along its swimming spine, into a full-resolution layer that the water
 *   shader then sees through the surface. The textures are baked from height
 *   fields (scripts/bake-creatures.py): skin colour with a soft coverage edge,
 *   and a surface normal map. Lighting happens here, with the scene's sun and
 *   the normals turned to follow the bending body. Deeper animals are drawn
 *   from blurrier mip levels and fade toward the colour of the water above
 *   them, which is what keeps their edges soft.
 * - BubbleLayer draws every bubble as an instanced quad shaded by a distance
 *   field: a thin bright rim, a faint body and a highlight up and to the left.
 */

import { type Program, program } from "./gl";

export type CreatureKind = "whale" | "shark" | "fish";

/** Floats per vertex: position (2), texture coordinate (2), angle, lift. */
export const CREATURE_STRIDE = 6;

const CREATURE_VS = `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec2 aUv;
layout(location = 2) in float aAngle;
layout(location = 3) in float aLift;
uniform vec2 uView;
uniform vec2 uCam;
uniform float uZoom;
out vec2 vUv;
out float vAngle;
out float vLift;
void main() {
  vUv = aUv;
  vAngle = aAngle;
  vLift = aLift;
  vec2 screen = (aPos - uCam) * uZoom + uView * 0.5;
  vec2 c = screen / uView * 2.0 - 1.0;
  gl_Position = vec4(c.x, -c.y, 0.0, 1.0);
}`;

const CREATURE_FS = `#version 300 es
precision highp float;
in vec2 vUv;
in float vAngle;
in float vLift;
uniform sampler2D uAlbedo;
uniform sampler2D uShape;
uniform float uDepth;
uniform float uFade;
uniform vec3 uWater;
out vec4 o;
// toward the sun: up and to the left, as in the water shader
const vec3 L = vec3(-0.42, -0.5, 0.76) / 1.0748;
void main() {
  float depth = clamp(uDepth + vLift, 0.0, 1.0);
  // the deeper the animal, the blurrier: the water above it scatters the image
  float bias = (1.0 - depth) * 2.6;
  vec4 a = texture(uAlbedo, vUv, bias);
  if (a.a < 0.003) discard;
  vec4 sh = texture(uShape, vUv, bias);
  vec3 albedo = a.rgb / a.a;
  // the normal is baked in the body's frame; turn it with the bending spine
  vec2 nb = sh.rg * 2.0 - 1.0;
  float c = cos(vAngle);
  float s = sin(vAngle);
  vec3 N = normalize(vec3(c * nb.x - s * nb.y, s * nb.x + c * nb.y, sqrt(max(1.0 - dot(nb, nb), 0.0))));
  float diffuse = max(dot(N, L), 0.0);
  // light that has come through water arrives soft: wrap it round the body
  vec3 lit = albedo * (0.38 + 0.8 * diffuse) * sh.a;
  // a wet sheen on the shallow ones
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  lit += vec3(0.75, 0.9, 1.0) * pow(max(dot(N, H), 0.0), 38.0) * 0.16 * depth * depth;
  // water above the animal tints it toward the sea and lowers its contrast
  vec3 col = mix(uWater, lit, mix(0.38, 0.94, depth));
  float alpha = a.a * mix(0.62, 1.0, depth) * uFade;
  o = vec4(col * alpha, alpha);
}`;

const KINDS: CreatureKind[] = ["whale", "shark", "fish"];

type Pair = { albedo: WebGLTexture; shape: WebGLTexture };

export class CreatureLayer {
  private gl: WebGL2RenderingContext;
  readonly prog: Program;
  private vao: WebGLVertexArrayObject;
  private buf: WebGLBuffer;
  readonly verts = new Float32Array(CREATURE_STRIDE * 4096);
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
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 2 * F);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, stride, 4 * F);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, stride, 5 * F);
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
      // the shape map keeps its alpha (occlusion) as data
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
   * Draws the ribbons laid out in `verts`: each entry of `draws` is one animal
   * (its kind, how deep it swims, and its first vertex and count, as a strip).
   * The camera maps world (CSS px) to the screen; W × H is the view in CSS px.
   */
  draw(
    draws: { kind: CreatureKind; depth: number; first: number; count: number }[],
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
        gl.uniform1f(p.u("uDepth"), d.depth);
        gl.drawArrays(gl.TRIANGLE_STRIP, d.first, d.count);
      }
      gl.disable(gl.BLEND);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindVertexArray(null);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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
