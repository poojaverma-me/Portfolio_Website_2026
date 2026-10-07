import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SITE_URL } from "@/lib/site";

/**
 * Serves a Benchmarked page (synced into content/newsletter by
 * scripts/sync-newsletter.mjs) as it was written, with the site's additions
 * slipped in: a <base> so its relative image paths resolve under
 * /newsletter/<slug>/, a canonical URL, a description and share-card tags,
 * and a quiet link back to the portfolio. Runs at build time only; the
 * routes are fully static.
 */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export function newsletterResponse({
  file,
  path,
  title,
  description,
  image,
  base,
  rewrite,
}: {
  /** file name inside content/newsletter */
  file: string;
  /** the page's path on this site, e.g. /newsletter/2026-10-03-ai-week-roundup */
  path: string;
  title: string;
  description: string;
  image?: string;
  base?: string;
  /** extra edits to the page's HTML */
  rewrite?: (html: string) => string;
}) {
  let html = readFileSync(join(process.cwd(), "content/newsletter", file), "utf8");
  if (rewrite) html = rewrite(html);

  const url = `${SITE_URL}${path}`;
  const head = [
    base && `<base href="${esc(base)}">`,
    `<link rel="canonical" href="${esc(url)}">`,
    `<meta name="description" content="${esc(description)}">`,
    `<meta name="author" content="Pooja Verma">`,
    `<link rel="icon" href="/icon.svg" type="image/svg+xml">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:site_name" content="Benchmarked by Pooja Verma">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    image && `<meta property="og:image" content="${esc(`${SITE_URL}${image}`)}">`,
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}">`,
  ]
    .filter(Boolean)
    .join("\n");

  // the charset must stay first in <head>; everything else goes right after it
  html = html.replace(/<meta charset="utf-8">/i, (m) => `${m}\n${head}`);
  html = html.replace(
    /<div class="wrap">/,
    (m) =>
      `${m}\n  <a href="/#writing" style="display:inline-block;margin:0 0 10px 4px;font-size:13px;color:var(--muted);text-decoration:none">← Pooja Verma</a>`,
  );

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
