/**
 * A Next.js build adapter (adapterPath in next.config.ts) that obfuscates the
 * site's own chunks at the end of `next build`, then hands over to the
 * platform's adapter if there is one.
 *
 * On Vercel, NEXT_ADAPTER_PATH names Vercel's adapter, which collects the
 * static files in this same hook; obfuscating first means the obfuscated files
 * are the ones deployed. Setting adapterPath replaces that default, so this
 * adapter loads Vercel's and passes every call through to it unchanged,
 * keeping its name, config changes and build handling. Locally there is no
 * platform adapter and only the obfuscation runs.
 */
import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { obfuscateChunks } from "./obfuscate-chunks.mjs";

const require = createRequire(import.meta.url);

async function platformAdapter() {
  const path = process.env.NEXT_ADAPTER_PATH;
  if (!path) return null;
  const mod = await import(pathToFileURL(require.resolve(path, { paths: [process.cwd()] })).href);
  return mod.default ?? mod;
}

const platform = await platformAdapter();

/** @type {import("next").NextAdapter} */
const adapter = {
  name: platform?.name ?? "site-obfuscation",
  ...(platform?.modifyConfig && { modifyConfig: (config, ctx) => platform.modifyConfig(config, ctx) }),
  async onBuildComplete(ctx) {
    obfuscateChunks(join(ctx.distDir, "static"));
    await platform?.onBuildComplete?.(ctx);
  },
};

export default adapter;
