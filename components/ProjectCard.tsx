import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Project } from "@/lib/projects";
import { categoryIcon } from "@/lib/categories";

export default function ProjectCard({
  project,
  headingLevel = 3,
}: {
  project: Project;
  /** 2 where the cards sit straight under the page title, 3 under a section heading. */
  headingLevel?: 2 | 3;
}) {
  const Icon = categoryIcon[project.category];
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="glass-card group flex h-full flex-col overflow-hidden"
    >
      <div className="cover-placeholder relative aspect-[16/10] w-full overflow-hidden border-b hairline">
        {project.cover ? (
          <Image
            src={project.cover}
            alt={`${project.title} screenshot`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="app-icon is-lg transition-transform duration-500 ease-out group-hover:scale-105">
              <Icon size={30} strokeWidth={1.75} />
            </span>
          </span>
        )}
        <span className="token absolute right-3 top-3 !bg-base/60 backdrop-blur-md tabular-nums">
          {project.year}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="footnote flex items-center gap-1.5">
          <span className="font-semibold text-label">{project.category}</span>
          <span className="font-normal text-label-3">·</span>
          <span className="font-normal text-label-2">{project.status}</span>
        </p>
        <Heading className="headline mt-1.5 !text-[1.25rem]">
          {project.title}
        </Heading>
        <p className="mt-2 flex-1 text-[0.9375rem] leading-[1.47] text-label-2">
          {project.tagline}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.domains.map((d) => (
            <span key={d} className="token">
              {d}
            </span>
          ))}
        </div>
        <span className="link-accent mt-5 text-[0.9375rem] group-hover:underline group-hover:underline-offset-[3px]">
          Read case study <ChevronRight size={16} strokeWidth={2.25} />
        </span>
      </div>
    </Link>
  );
}
