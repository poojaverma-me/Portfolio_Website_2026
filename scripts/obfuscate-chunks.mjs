/**
 * Obfuscates the browser chunks that hold the site's own code: the intro
 * engine and its shaders, the pages and the components. The shader source and
 * the copy inside them are template strings, which minification leaves
 * readable; here they move into an encoded string table.
 *
 * It runs inside `next build`, from the adapter in scripts/next-adapter.mjs,
 * because on Vercel the deployment adapter collects the static files during
 * the build: anything changed after `next build` returns never ships.
 *
 * Framework and library chunks (React, Next, three.js) are left alone:
 * obfuscating them would add weight and slow hydration while protecting
 * nothing that isn't already public.
 *
 * The settings are the light ones on purpose: no control-flow flattening, no
 * dead code, no debugger traps or self-defending wrappers, which cost frame
 * rate in the intro's render loop and can break on future browser changes.
 * A fixed seed keeps the output the same for the same input.
 *
 * Run by hand on an existing build: node scripts/obfuscate-chunks.mjs
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Script } from "node:vm";
import JavaScriptObfuscator from "javascript-obfuscator";

// class names and strings that only this site's code contains
const MARKERS = ["glass-card", "btn-glass", "link-accent", "intro-overlay", "eyebrow"];
// above this, a chunk is mostly a library that happens to include a little site code
const MAX_BYTES = 300_000;
// how an obfuscated chunk starts, so a second pass skips it
const WRAPPED = "(function(){function _";

const OPTIONS = {
  compact: true,
  seed: 20261030,
  target: "browser",
  identifierNamesGenerator: "mangled",
  renameGlobals: false,
  stringArray: true,
  stringArrayThreshold: 0.75,
  stringArrayEncoding: ["base64"],
  stringArrayCallsTransform: false,
  stringArrayWrappersCount: 0,
  stringArrayRotate: false,
  stringArrayShuffle: false,
  splitStrings: false,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  debugProtection: false,
  selfDefending: false,
  disableConsoleOutput: false,
  numbersToExpressions: false,
  simplify: true,
  transformObjectKeys: false,
  unicodeEscapeSequence: false,
  sourceMap: false,
};

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? files(p) : p.endsWith(".js") ? [p] : [];
  });
}

/** Obfuscates the site chunks under a build's static directory (.next/static). */
export function obfuscateChunks(staticDir) {
  let done = 0;
  let before = 0;
  let after = 0;
  for (const file of files(join(staticDir, "chunks"))) {
    const code = readFileSync(file, "utf8");
    if (code.startsWith(WRAPPED) || code.length > MAX_BYTES || !MARKERS.some((m) => code.includes(m))) continue;
    // A chunk is a classic script and the obfuscator puts its helpers (the string
    // table and its decoder) at the top level, so they would be globals, and two
    // chunks' helpers would overwrite each other and decode the wrong strings.
    // Each chunk gets its own prefix, and the result is wrapped in a function
    // scope so nothing leaks; the chunk itself is one expression, so it runs the same.
    const prefix = `_${done.toString(36)}`;
    const obf = JavaScriptObfuscator.obfuscate(code, { ...OPTIONS, identifiersPrefix: prefix }).getObfuscatedCode();
    const out = `(function(){${obf}\n})();`;
    // a chunk that doesn't parse would break the page and stay in browsers' caches
    // under the same name for a year, so fail the build instead
    new Script(out, { filename: file });
    writeFileSync(file, out);
    done++;
    before += code.length;
    after += out.length;
  }
  console.log(`Obfuscated ${done} site chunks: ${(before / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB`);
  return done;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  obfuscateChunks(resolve(import.meta.dirname, "../.next/static"));
}
