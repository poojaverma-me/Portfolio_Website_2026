import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
} from "lucide-react";
import { CASE_STUDIES_PUBLISHED, getProject, projects, type Figure } from "@/lib/projects";
import { SITE_URL } from "@/lib/site";
import { categoryIcon } from "@/lib/categories";
import CaseStudyToc from "@/components/CaseStudyToc";
import Screenshot from "@/components/Screenshot";
import ScreenshotPlaceholder from "@/components/ScreenshotPlaceholder";
import Reveal from "@/components/Reveal";
import VideoPlayer from "@/components/VideoPlayer";
import { isoDuration, projectVideo } from "@/lib/videos";

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
  const url = `/projects/${project.slug}`;
  return {
    title: project.title,
    description: project.tagline,
    keywords: [project.title, project.category, ...project.domains, ...project.stack, "Pooja Verma"],
    alternates: { canonical: url },
    // placeholder write-ups are kept out of search until they are real
    robots: CASE_STUDIES_PUBLISHED ? undefined : { index: false, follow: true },
    openGraph: {
      type: "article",
      title: `${project.title} · Pooja Verma`,
      description: project.tagline,
      url,
      publishedTime: `${project.year}-01-01`,
      authors: ["Pooja Verma"],
      tags: project.stack,
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} · Pooja Verma`,
      description: project.tagline,
    },
  };
}

/** Renders the write-ups' own markup: **bold** and `code`, with HTML escaped first. */
function Prose({ text }: { text: string }) {
  const html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
  return <p dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Screenshots in order; phone shots pair up side by side. */
function Figures({ figures, first }: { figures: Figure[]; first: boolean }) {
  const rows: Figure[][] = [];
  for (const f of figures) {
    const last = rows[rows.length - 1];
    if (f.device === "phone" && last?.[0]?.device === "phone" && last.length < 2) last.push(f);
    else rows.push([f]);
  }
  return (
    <div className="mt-10 grid gap-10">
      {rows.map((row, r) =>
        row[0].device === "phone" ? (
          <div key={r} className={`grid gap-4 sm:gap-8 ${row.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
            {row.map((f) => (
              <Screenshot key={f.caption} src={f.src!} alt={f.alt ?? f.caption} caption={f.caption} device="phone" />
            ))}
          </div>
        ) : row[0].src ? (
          <Screenshot
            key={r}
            src={row[0].src}
            alt={row[0].alt ?? row[0].caption}
            caption={row[0].caption}
            priority={first && r === 0}
          />
        ) : (
          <ScreenshotPlaceholder
            key={r}
            caption={row[0].caption}
            aspect={row[0].aspect === "wide" ? "wide" : row[0].aspect === "tall" ? "tall" : "video"}
          />
        ),
      )}
    </div>
  );
}

function MetaItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
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
  const video = projectVideo(project.slug);

  // what this project is, for search engines and assistants
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.title,
    description: project.tagline,
    url: `${SITE_URL}/projects/${project.slug}`,
    ...(project.links.github && { codeRepository: project.links.github }),
    programmingLanguage: project.stack,
    keywords: [...project.domains, ...project.stack].join(", "),
    dateCreated: project.year,
    ...(project.cover && { image: `${SITE_URL}${project.cover}` }),
    author: { "@id": `${SITE_URL}/#person` },
    ...(video && {
      subjectOf: {
        "@type": "VideoObject",
        name: video.title,
        description: video.description,
        thumbnailUrl: `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${video.id}`,
        contentUrl: `https://www.youtube.com/watch?v=${video.id}`,
        ...(video.published && { uploadDate: video.published }),
        ...(video.duration && { duration: isoDuration(video.duration) }),
      },
    }),
  };

  return (
    <div className="mx-auto max-w-4xl px-6 pb-24 pt-32 sm:pt-36 lg:max-w-5xl xl:max-w-6xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="lg:grid lg:grid-cols-[168px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[200px_minmax(0,1fr)] xl:gap-14">
        <CaseStudyToc
          sections={project.sections.map((s) => ({ id: s.id, title: s.title }))}
        />

        <div className="min-w-0">
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
                  <dt className="mt-2 text-[0.9375rem] text-label-2">
                    {m.label}
                  </dt>
                </div>
              ))}
            </dl>

            {/* the facts */}
            <div className="mt-12 grid gap-x-8 gap-y-7 border-t hairline pt-8 sm:grid-cols-2 lg:grid-cols-3">
              <MetaItem label="Timeline">{project.timeline}</MetaItem>
              <MetaItem label="Role">{project.role}</MetaItem>
              <MetaItem label="Team">{project.team}</MetaItem>
              <MetaItem label="Domain">{project.domains.join(" · ")}</MetaItem>
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

          {/* the demo, when one is posted on YouTube */}
          {video && (
            <Reveal>
              <figure className="mt-14" aria-label={`${project.title} demo video`}>
                <div className="glass-card overflow-hidden">
                  <VideoPlayer id={video.id} title={video.title} duration={video.duration} hd />
                </div>
                <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="footnote">
                    Demo{video.duration && ` · ${video.duration}`} · {video.title}
                  </span>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="link-accent text-[0.875rem]"
                  >
                    Watch on YouTube <ArrowUpRight size={14} />
                  </a>
                </figcaption>
              </figure>
            </Reveal>
          )}

          {project.sections.map((section, i) => (
            <Reveal key={section.id}>
              <section
                id={section.id}
                className="mt-20 scroll-mt-28 border-t hairline pt-12"
              >
                <p className="section-marker">
                  <span aria-hidden>{"//"}</span> Section{" "}
                  {String(i + 1).padStart(2, "0")}
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

                {section.figures && <Figures figures={section.figures} first={i === 0} />}
              </section>
            </Reveal>
          ))}

          {/* previous / next */}
          <nav
            aria-label="More case studies"
            className="mt-20 grid gap-3 border-t hairline pt-10 sm:grid-cols-2"
          >
            <Link
              href={`/projects/${prev.slug}`}
              className="glass-card group p-5"
            >
              <p className="footnote flex items-center gap-1">
                <ChevronLeft size={14} /> Previous
              </p>
              <p className="headline mt-1 group-hover:text-accent">
                {prev.title}
              </p>
            </Link>
            <Link
              href={`/projects/${next.slug}`}
              className="glass-card group p-5 text-right"
            >
              <p className="footnote flex items-center justify-end gap-1">
                Next <ChevronRight size={14} />
              </p>
              <p className="headline mt-1 group-hover:text-accent">
                {next.title}
              </p>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
