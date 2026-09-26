/**
 * GPU drawing for the two things that used to live on 2D canvases, so the
 * whole scene stays in one WebGL context with no per-frame canvas uploads.
 *
 * - LifeLayer fills the swimmers into a half-resolution texture with the
 *   stencil-then-cover technique: a triangle fan over the outline flips the
 *   stencil bit of every pixel it crosses, pixels crossed an odd number of
 *   times are inside, and a second pass colours exactly those. It handles the
 *   concave fins and flukes that a plain fan would get wrong. Channels combine
 *   with MAX blending: red for the body, blue for sharpness.
 * - BubbleLayer draws every bubble as an instanced quad shaded by a distance
 *   field: a thin bright rim, a faint body and a highlight up and to the left.
 */

import { type Program, program } from "./gl";

const SHAPE_VS = `#version 300 es
in vec2 aPos;
uniform vec2 uView;
void main() {
  vec2 c = aPos / uView * 2.0 - 1.0;
  gl_Position = vec4(c.x, -c.y, 0.0, 1.0);
}`;
const SHAPE_FS = `#version 300 es
precision mediump float;
uniform vec4 uColor;
out vec4 o;
void main() { o = uColor; }`;

export class LifeLayer {
  private gl: WebGL2RenderingContext;
  readonly prog: Program;
  private vao: WebGLVertexArrayObject;
  private buf: WebGLBuffer;
  private verts = new Float32Array(2048);
  tex: WebGLTexture | null = null;
  private fbo: WebGLFramebuffer | null = null;
  private rb: WebGLRenderbuffer | null = null;
  private w = 1;
  private h = 1;
  private W = 1;
  private H = 1;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.prog = program(gl, SHAPE_VS, SHAPE_FS);
    this.vao = gl.createVertexArray()!;
    this.buf = gl.createBuffer()!;
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.bufferData(gl.ARRAY_BUFFER, this.verts.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
  }

  /** A texture at `scale` of the W × H viewport, with a stencil buffer. */
  size(W: number, H: number, scale: number) {
    const gl = this.gl;
    if (this.tex) gl.deleteTexture(this.tex);
    if (this.fbo) gl.deleteFramebuffer(this.fbo);
    if (this.rb) gl.deleteRenderbuffer(this.rb);
    this.W = W;
    this.H = H;
    this.w = Math.max(1, Math.ceil(W * scale));
    this.h = Math.max(1, Math.ceil(H * scale));
    this.tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, this.w, this.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    this.rb = gl.createRenderbuffer()!;
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.rb);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH24_STENCIL8, this.w, this.h);
    this.fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.tex, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.rb);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  begin() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, this.w, this.h);
    gl.clearColor(0, 0, 0, 1);
    gl.clearStencil(0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    gl.useProgram(this.prog.prog);
    gl.uniform2f(this.prog.u("uView"), this.W, this.H);
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.enable(gl.BLEND);
    gl.blendEquation(gl.MAX);
    gl.enable(gl.STENCIL_TEST);
  }

  private upload(n: number) {
    const gl = this.gl;
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.verts, 0, n * 2);
  }

  /** Fills a closed outline of `n` points (x, y pairs in CSS px). */
  fill(pts: Float32Array, n: number, r: number, g: number, b: number) {
    const gl = this.gl;
    if (n < 3 || (n + 2) * 2 > this.verts.length) return;
    const v = this.verts;
    v[0] = pts[0];
    v[1] = pts[1];
    for (let i = 0; i < n; i++) {
      v[2 + i * 2] = pts[i * 2];
      v[3 + i * 2] = pts[i * 2 + 1];
    }
    v[2 + n * 2] = pts[0];
    v[3 + n * 2] = pts[1];
    this.upload(n + 2);
    // stencil: flip for every triangle a pixel is under
    gl.colorMask(false, false, false, false);
    gl.stencilFunc(gl.ALWAYS, 0, 0xff);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.INVERT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, n + 2);
    // cover: colour what ended up odd, and clear the stencil as we go
    gl.colorMask(true, true, true, true);
    gl.stencilFunc(gl.NOTEQUAL, 0, 0xff);
    gl.stencilOp(gl.ZERO, gl.ZERO, gl.ZERO);
    gl.uniform4f(this.prog.u("uColor"), r, g, b, 1);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, n + 2);
  }

  end() {
    const gl = this.gl;
    gl.disable(gl.STENCIL_TEST);
    gl.blendEquation(gl.FUNC_ADD);
    gl.disable(gl.BLEND);
    gl.bindVertexArray(null);
  }
}

const BUBBLE_VS = `#version 300 es
layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec4 aBubble;
uniform vec2 uView;
out vec2 vLocal;
out float vR;
out float vA;
void main() {
  float pad = aBubble.z + 1.5;
  vLocal = aCorner * pad;
  vR = aBubble.z;
  vA = aBubble.w;
  vec2 c = (aBubble.xy + vLocal) / uView * 2.0 - 1.0;
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
    col = vec3(1.0, 0.93, 0.86) * a;
  } else {
    float w = max(0.6, vR * 0.16);
    float rim = (1.0 - smoothstep(w * 0.5 - 0.5, w * 0.5 + 0.5, abs(d - vR))) * 0.78;
    float body = (1.0 - smoothstep(vR - 0.5, vR + 0.5, d)) * 0.12;
    float hl = (1.0 - smoothstep(vR * 0.27 - 0.5, vR * 0.27 + 0.5, length(vLocal + vR * 0.38))) * 0.95;
    col = vec3(1.0, 0.925, 0.84) * rim + vec3(1.0, 0.84, 0.67) * body + vec3(1.0) * hl;
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

  /** Draws the first `n` bubbles in `data` (x, y, r, alpha) over the current target. */
  draw(n: number, W: number, H: number) {
    if (n <= 0) return;
    const gl = this.gl;
    gl.useProgram(this.prog.prog);
    gl.uniform2f(this.prog.u("uView"), W, H);
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
