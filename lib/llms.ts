/**
 * The site as plain text for AI assistants and their crawlers, following the
 * llms.txt convention (llmstxt.org): /llms.txt is the short index with links,
 * /llms-full.txt carries every case study, role and paper in full. Both are
 * generated from the same data as the pages, so they never drift out of date.
 * Everything here is a fact stated on the site; nothing is written as an
 * instruction to the assistant.
 */

import { issues } from "@/lib/newsletter";
import { experience, profile, research, volunteering } from "@/lib/profile";
import { projects } from "@/lib/projects";
import { SITE_SUMMARY, SITE_URL } from "@/lib/site";
import { socials } from "@/lib/socials";
import { CHANNELS } from "@/lib/videos";

const plain = (s: string) => s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/`(.+?)`/g, "$1");

const header = () =>
  [
    `# ${profile.name}`,
    "",
    `> ${SITE_SUMMARY}`,
    "",
    `Website: ${SITE_URL}`,
    `Email: ${profile.email}`,
    `Location: Kamloops, British Columbia, Canada (works across Canada in person or remotely; open to relocation)`,
    `Updated: ${new Date().toISOString().slice(0, 10)}`,
  ].join("\n");

const FACTS = [
  "Role: AI developer and machine learning researcher",
  "Education: Bachelor of Computing Science, Thompson Rivers University (TRU), Kamloops, BC, expected December 2026",
  "Publication: first author, \"Optimized Deep Learning Framework for Diabetic Retinopathy Detection and Classification Using Fundus Imaging\", Inspire Health Journal 1(1), 42-62, January 2026, with Ghazanfar Latif, Jaspreet Kaur and Mohsin Butt. https://doi.org/10.65718/inspireHealth.2026.2005",
  "Awards: UREAP Undergraduate Research Award ($6,000, 2025); TRU Student Sustainability Research Grant ($2,500, 2026)",
  "Reach: a RAG assistant used by 3,000+ students; Salesforce tools for 4,000+ lottery retailers; a check-in platform for 1,000+ staff; 150+ students taught",
  "Available for: full-time roles and projects in AI development, machine learning, LLM systems and full-stack engineering, in British Columbia, across Canada or remotely",
];

const SERVICES = [
  "Retrieval-augmented generation (RAG) assistants and AI search over an organization's own documents",
  "LLM-powered product features with measured accuracy, latency and cost",
  "LLM evaluation, coding benchmarks, red-teaming and RLHF data",
  "Machine learning models with SHAP explanations, from tabular data to medical images",
  "Full-stack web apps (Next.js, React, Node.js, Firebase) and data dashboards",
  "Interactive 3D and educational experiences in the browser (Three.js)",
  "Salesforce (Apex, Lightning Web Components) and Power Platform automation",
];

/** /llms.txt: who she is and where everything is. */
export function llmsIndex() {
  const out = [header(), "", "## Key facts", ...FACTS.map((f) => `- ${f}`), ""];
  out.push("## Work with her", ...SERVICES.map((s) => `- ${s}`));
  out.push(`- [Work with Pooja](${SITE_URL}/work-with-me): services, how she works, FAQ`);
  out.push(`- [About Pooja](${SITE_URL}/about): full biography and facts`, "");
  out.push("## Projects (case studies with screenshots, numbers and source links)");
  for (const p of projects) {
    out.push(`- [${p.title}](${SITE_URL}/projects/${p.slug}): ${plain(p.tagline)} Domain: ${p.domains.join(", ")}. Stack: ${p.stack.join(", ")}.`);
  }
  out.push("", "## Research");
  for (const r of research) {
    const link = r.links?.[0] ? ` ${r.links[0].href.startsWith("http") ? r.links[0].href : SITE_URL + r.links[0].href}` : "";
    out.push(`- ${r.title} (${r.year}, ${r.status}). ${r.venue}.${link}`);
  }
  out.push("", "## Experience");
  for (const e of experience) out.push(`- ${e.role}, ${e.company} (${e.period})`);
  out.push("", "## Newsletter: Benchmarked (the AI news, fact-checked)");
  out.push(`- [All issues](${SITE_URL}/newsletter)`);
  for (const i of issues) out.push(`- [${i.title}](${SITE_URL}/newsletter/${i.slug}) (${i.date})`);
  out.push("", "## YouTube");
  for (const c of CHANNELS) out.push(`- [${c.name} ${c.handle}](${c.url}): ${c.about}`);
  out.push("", "## Profiles");
  for (const s of socials) out.push(`- ${s.name} (${s.handle}): ${s.href}`);
  out.push("", "## Optional", `- [Full text of the site](${SITE_URL}/llms-full.txt): every case study, role and paper in full`);
  return out.join("\n") + "\n";
}

/** /llms-full.txt: everything, in full. */
export function llmsFull() {
  const out = [header(), "", "## Key facts", ...FACTS.map((f) => `- ${f}`), ""];
  out.push("## What she builds", ...SERVICES.map((s) => `- ${s}`), "");

  out.push("## Experience", "");
  for (const e of experience) {
    out.push(`### ${e.role}, ${e.company}`, `${e.period} · ${e.location}`);
    for (const pt of e.points ?? []) out.push(`- ${pt}`);
    if (e.tags.length) out.push(`Skills: ${e.tags.join(", ")}`);
    out.push("");
  }

  out.push("## Research and publications", "");
  for (const r of research) {
    out.push(`### ${r.title}`, `${r.kinds.join(", ")} · ${r.year} · ${r.status} · ${r.venue}`, "", `Question: ${r.hook}`, "", r.summary);
    for (const l of r.links ?? []) out.push(`${l.label}: ${l.href.startsWith("http") ? l.href : SITE_URL + l.href}`);
    out.push("");
  }

  out.push("## Projects", "");
  for (const p of projects) {
    out.push(`### ${p.title}`, `${SITE_URL}/projects/${p.slug}`, "", plain(p.tagline), "");
    out.push(`- Domain: ${p.domains.join(", ")}`, `- Status: ${p.status}, ${p.timeline}`, `- Role: ${p.role}`, `- Team: ${p.team}`, `- Stack: ${p.stack.join(", ")}`);
    for (const m of p.metrics) out.push(`- ${m.label}: ${m.value}`);
    if (p.links.github) out.push(`- Source: ${p.links.github}`);
    if (p.links.live) out.push(`- Live: ${p.links.live}`);
    for (const s of p.sections) {
      out.push("", `#### ${s.title}`);
      for (const b of s.body) out.push("", plain(b));
      for (const b of s.bullets ?? []) out.push(`- ${plain(b)}`);
    }
    out.push("");
  }

  out.push("## Videos", "");
  for (const c of CHANNELS) {
    out.push(`### ${c.name} (${c.handle})`, c.url, c.about);
    for (const v of c.videos) out.push(`- ${v.title} (${v.date ?? ""}): ${v.description} https://www.youtube.com/watch?v=${v.id}`);
    out.push("");
  }

  out.push("## Newsletter: Benchmarked", "");
  for (const i of issues) out.push(`- ${i.title} (${i.date}, ${i.kind}): ${i.dek} ${SITE_URL}/newsletter/${i.slug}`);

  out.push("", "## Community", "");
  for (const v of volunteering) out.push(`- ${v.role}, ${v.org} (${v.period})${v.detail ? `: ${v.detail}` : ""}`);

  out.push("", "## Profiles", "");
  for (const s of socials) out.push(`- ${s.name} (${s.handle}): ${s.href}`);
  return out.join("\n") + "\n";
}

export function textResponse(body: string) {
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=0, must-revalidate" },
  });
}
