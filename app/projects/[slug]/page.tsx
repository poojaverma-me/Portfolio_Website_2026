import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronLeft, ChevronRight, CircleCheck } from "lucide-react";
import { getProject, projects } from "@/lib/projects";
import { categoryIcon } from "@/lib/categories";
import ScreenshotPlaceholder from "@/components/ScreenshotPlaceholder";
import Reveal from "@/components/Reveal";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} · Pooja Verma`,
    description: project.tagline,
  };
}

/** Renders our trusted dummy-data markup: **bold** and <code>…</code>. */
function Prose({ text }: { text: string }) {
  const html = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  return <p dangerouslySetInnerHTML={{ __html: html }} />;
}

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className="mt-2 text-[1.0625rem] font-semibold leading-snug text-label">
        {children}
      </p>
    </div>
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const idx = projects.findIndex((p) => p.slug === slug);
  const prev = projects[(idx - 1 + projects.length) % projects.length];
  const next = projects[(idx + 1) % projects.length];
  const Icon = categoryIcon[project.category];

  return (
    <div className="mx-auto max-w-4xl px-6 pb-24 pt-32 sm:pt-36">
      <Link href="/projects" className="link-accent text-[0.9375rem]">
        <ChevronLeft size={17} strokeWidth={2.25} /> Back to projects
      </Link>

      {/* title block */}
      <header className="mt-8">
        <p className="eyebrow flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="app-icon !h-6 !w-6 !rounded-[7px]" aria-hidden>
            <Icon size={13} strokeWidth={2.5} />
          </span>
          <span>{project.category}</span>
          <span aria-hidden>·</span>
          <span>{project.status}</span>
          <span aria-hidden>·</span>
          <span>{project.year}</span>
        </p>

        <h1 className="large-title mt-5 !text-[clamp(2.75rem,8vw,5rem)]">
          {project.title}
        </h1>
        <p className="lead mt-5 max-w-2xl">{project.tagline}</p>

        {/* headline numbers */}
        <dl className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-3">
          {project.metrics.map((m) => (
            <div key={m.label} className="border-l-2 border-accent pl-4">
              <dd className="display-num text-[2.125rem] leading-none text-label tabular-nums">
                {m.value}
              </dd>
              <dt className="mt-2 text-[0.9375rem] text-label-2">{m.label}</dt>
            </div>
          ))}
        </dl>

        {/* the facts */}
        <div className="mt-12 grid gap-x-8 gap-y-7 border-t hairline pt-8 sm:grid-cols-2 lg:grid-cols-3">
          <MetaItem label="Timeline">{project.timeline}</MetaItem>
          <MetaItem label="Role">{project.role}</MetaItem>
          <MetaItem label="Team">{project.team}</MetaItem>
          <MetaItem label="Status">
            <span className="flex items-center gap-1.5">
              <CircleCheck size={15} className="text-accent" />
              {project.status}
            </span>
          </MetaItem>
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="eyebrow">Stack</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {project.stack.map((s) => (
                <span key={s} className="token">
                  {s}
                </span>
              ))}
            </div>
          </div>
          {(project.links.live || project.links.github) && (
            <div>
              <p className="eyebrow">Source</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {project.links.live && (
                  <a
                    href={project.links.live}
                    target="_blank"
                    rel="noreferrer"
                    className="link-accent text-[1.0625rem] font-semibold"
                  >
                    Live site <ArrowUpRight size={16} />
                  </a>
                )}
                {project.links.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noreferrer"
                    className="link-accent text-[1.0625rem] font-semibold"
                  >
                    GitHub <ArrowUpRight size={16} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {project.sections.map((section, i) => (
        <Reveal key={section.id}>
          <section id={section.id} className="mt-20 scroll-mt-28 border-t hairline pt-12">
            <p className="section-marker">
              <span aria-hidden>{"//"}</span> Section {String(i + 1).padStart(2, "0")}
            </p>
            <h2 className="section-title mt-4 !text-[clamp(1.875rem,4vw,2.5rem)]">
              {section.title}
            </h2>

            <div className="docs-prose mt-6">
              {section.body.map((b, i) => (
                <Prose key={i} text={b} />
              ))}
            </div>

            {section.bullets && (
              <ul className="mt-7 flex flex-col gap-3 border-l hairline pl-5">
                {section.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-3 text-[1rem] leading-[1.5] text-label-2"
                  >
                    <CircleCheck
                      size={18}
                      strokeWidth={2}
                      className="mt-0.5 flex-none text-accent"
                    />
                    {b}
                  </li>
                ))}
              </ul>
            )}

            {section.figures && (
              <div className="mt-10 grid gap-8">
                {section.figures.map((f) => (
                  <ScreenshotPlaceholder
                    key={f.caption}
                    caption={f.caption}
                    aspect={
                      f.aspect === "wide" ? "wide" : f.aspect === "tall" ? "tall" : "video"
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </Reveal>
      ))}

      {/* previous / next */}
      <nav
        aria-label="More case studies"
        className="mt-20 grid gap-3 border-t hairline pt-10 sm:grid-cols-2"
      >
        <Link href={`/projects/${prev.slug}`} className="glass-card group p-5">
          <p className="footnote flex items-center gap-1">
            <ChevronLeft size={14} /> Previous
          </p>
          <p className="headline mt-1 group-hover:text-accent">{prev.title}</p>
        </Link>
        <Link href={`/projects/${next.slug}`} className="glass-card group p-5 text-right">
          <p className="footnote flex items-center justify-end gap-1">
            Next <ChevronRight size={14} />
          </p>
          <p className="headline mt-1 group-hover:text-accent">{next.title}</p>
        </Link>
      </nav>
    </div>
  );
}
