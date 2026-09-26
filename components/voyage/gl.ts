/** Small WebGL2 helpers: programs, render targets, and the one full-screen triangle. */

export type Program = {
  prog: WebGLProgram;
  vs: WebGLShader;
  fs: WebGLShader;
  u: (name: string) => WebGLUniformLocation | null;
};

/**
 * Compiles and links without asking for the result. Asking blocks until the
 * GPU is done; see `programsReady` for the non-blocking way to wait.
 */
export function program(gl: WebGL2RenderingContext, vsSrc: string, fsSrc: string): Program {
  const vs = gl.createShader(gl.VERTEX_SHADER)!;
  const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(vs, vsSrc);
  gl.shaderSource(fs, fsSrc);
  gl.compileShader(vs);
  gl.compileShader(fs);
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.bindAttribLocation(prog, 0, "aPos");
  gl.linkProgram(prog);
  const cache = new Map<string, WebGLUniformLocation | null>();
  return {
    prog,
    vs,
    fs,
    u(name) {
      if (!cache.has(name)) cache.set(name, gl.getUniformLocation(prog, name));
      return cache.get(name)!;
    },
  };
}

/** True once every program has finished compiling, without stalling. */
export function programsReady(
  gl: WebGL2RenderingContext,
  programs: Program[],
  parallel: { COMPLETION_STATUS_KHR: number } | null,
) {
  if (!parallel) return true;
  return programs.every((p) => gl.getProgramParameter(p.prog, parallel.COMPLETION_STATUS_KHR));
}

/** False, with the compiler's complaint logged, if any program failed. */
export function programsLinked(gl: WebGL2RenderingContext, programs: Program[]) {
  for (const p of programs) {
    if (!gl.getProgramParameter(p.prog, gl.LINK_STATUS)) {
      console.warn(gl.getShaderInfoLog(p.vs), gl.getShaderInfoLog(p.fs), gl.getProgramInfoLog(p.prog));
      return false;
    }
  }
  return true;
}

export type Target = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };
export type Pair = { read: Target; write: Target; swap: () => void };

export function target(
  gl: WebGL2RenderingContext,
  w: number,
  h: number,
  internal: number = gl.RGBA16F,
  type: number = gl.HALF_FLOAT,
  filter: number = gl.LINEAR,
): Target {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, gl.RGBA, type, null);
  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.viewport(0, 0, w, h);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return { tex, fbo, w, h };
}

export function pair(gl: WebGL2RenderingContext, w: number, h: number): Pair {
  const p = { read: target(gl, w, h), write: target(gl, w, h), swap() {
    const r = p.read;
    p.read = p.write;
    p.write = r;
  } };
  return p;
}

export function dispose(gl: WebGL2RenderingContext, t: Target) {
  gl.deleteTexture(t.tex);
  gl.deleteFramebuffer(t.fbo);
}

/** Whether half-float render targets work here; the fluid needs them. */
export function canRenderHalfFloat(gl: WebGL2RenderingContext) {
  gl.getExtension("EXT_color_buffer_float");
  gl.getExtension("EXT_color_buffer_half_float");
  const t = target(gl, 4, 4);
  gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
  const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  dispose(gl, t);
  return ok;
}

/** One triangle that covers the screen; bind its VAO before any full-screen pass. */
export function fullScreen(gl: WebGL2RenderingContext) {
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  return vao;
}

/** Draws the full-screen triangle into a target, or the canvas when null. */
export function blit(gl: WebGL2RenderingContext, to: Target | null) {
  if (to) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, to.fbo);
    gl.viewport(0, 0, to.w, to.h);
  } else {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  }
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

/** Binds a texture to a unit and points a sampler uniform at it. */
export function bind(gl: WebGL2RenderingContext, p: Program, name: string, unit: number, tex: WebGLTexture) {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.uniform1i(p.u(name), unit);
}
