import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronLeft, ChevronRight, CircleCheck } from "lucide-react";
import { getProject, projects } from "@/lib/projects";
import { categoryIcon } from "@/lib/categories";
import DocsIndex from "@/components/DocsIndex";
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
    <div className="mx-auto max-w-6xl px-4 pt-28 sm:px-6">
      <Link href="/projects" className="link-accent text-[1.0625rem]">
        <ChevronLeft size={18} strokeWidth={2.25} /> All projects
      </Link>

      {/* the case study is a macOS window */}
      <div className="window mt-5">
        {/* unified toolbar */}
        <div className="case-toolbar glass sticky top-[96px] z-20 flex h-12 items-center border-b hairline !rounded-none px-4 !shadow-none">
          <div className="traffic-lights" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <p className="absolute inset-x-[72px] flex items-center justify-center gap-2 truncate sm:inset-x-28 text-[0.8125rem] font-semibold">
            <span
              className="app-icon !h-5 !w-5 !rounded-[5px]"
              aria-hidden
            >
              <Icon size={11} strokeWidth={2.5} />
            </span>
            <span className="truncate">{project.title}</span>
          </p>
          <span className="ml-auto hidden text-[0.75rem] text-label-2 sm:block">
            Case study
          </span>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[250px_minmax(0,1fr)]">
          {/* sidebar runs to the window edge (macOS 27) */}
          <aside className="sidebar-material sticky top-[144px] z-10 min-w-0 border-b hairline px-3 py-2.5 lg:static lg:z-auto lg:border-b-0 lg:border-r lg:p-3 lg:py-5">
            <DocsIndex
              sections={project.sections.map((s) => ({ id: s.id, title: s.title }))}
            />
          </aside>

          <article className="min-w-0 px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
            {/* header */}
            <header>
              <div className="flex items-center gap-4">
                <span className="app-icon is-lg">
                  <Icon size={30} strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-[0.9375rem] font-semibold">
                    {project.category}
                  </p>
                  <p className="footnote flex items-center gap-1.5">
                    <CircleCheck size={13} />
                    {project.status} · {project.year}
                  </p>
                </div>
              </div>

              <h1 className="large-title mt-6 !text-[clamp(2.75rem,6vw,4.5rem)]">
                {project.title}
              </h1>
              <p className="lead mt-4 max-w-2xl">{project.tagline}</p>

              <div className="mt-6 flex flex-wrap gap-1.5">
                {project.stack.map((s) => (
                  <span key={s} className="token">
                    {s}
                  </span>
                ))}
              </div>

              {(project.links.live || project.links.github) && (
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {project.links.live && (
                    <a
                      href={project.links.live}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary"
                    >
                      Visit live site
                    </a>
                  )}
                  {project.links.github && (
                    <a
                      href={project.links.github}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-glass"
                    >
                      View source <ArrowUpRight size={16} className="text-label-2" />
                    </a>
                  )}
                </div>
              )}

              {/* metrics */}
              <dl className="mt-10 grid overflow-hidden rounded-2xl bg-fill sm:grid-cols-3">
                {project.metrics.map((m, i) => (
                  <div
                    key={m.label}
                    className={`px-5 py-5 hairline ${i > 0 ? "border-t sm:border-t-0 sm:border-l" : ""}`}
                  >
                    <dt className="footnote">{m.label}</dt>
                    <dd className="display-num mt-2 text-[2rem] text-accent tabular-nums">
                      {m.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </header>

            {project.sections.map((section) => (
              <Reveal key={section.id}>
                <section
                  id={section.id}
                  className="mt-14 scroll-mt-[196px] border-t hairline pt-12 lg:scroll-mt-[156px]"
                >
                  <h2 className="section-title mb-6 !text-[clamp(2rem,3.5vw,2.75rem)]">
                    {section.title}
                  </h2>
                  <div className="docs-prose">
                    {section.body.map((b, i) => (
                      <Prose key={i} text={b} />
                    ))}
                  </div>

                  {section.bullets && (
                    <ul className="mt-5 flex flex-col gap-3">
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
                    <div className="mt-8 grid gap-6">
                      {section.figures.map((f) => (
                        <ScreenshotPlaceholder
                          key={f.caption}
                          caption={f.caption}
                          aspect={f.aspect === "wide" ? "wide" : f.aspect === "tall" ? "tall" : "video"}
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
              className="mt-16 grid gap-3 border-t hairline pt-10 sm:grid-cols-2"
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
          </article>
        </div>
      </div>
    </div>
  );
}
