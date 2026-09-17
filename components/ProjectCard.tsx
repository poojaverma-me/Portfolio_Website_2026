import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Project } from "@/lib/projects";
import { categoryIcon } from "@/lib/categories";

export default function ProjectCard({ project }: { project: Project }) {
  const Icon = categoryIcon[project.category];

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="glass-card group flex h-full flex-col overflow-hidden"
    >
      {/* cover placeholder until real screenshots land */}
      <div
        className="cover-placeholder relative flex aspect-[16/10] w-full items-center justify-center border-b hairline"
      >
        <span className="app-icon is-lg transition-transform duration-500 ease-out group-hover:scale-105">
          <Icon size={30} strokeWidth={1.75} />
        </span>
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
        <h3 className="headline mt-1.5 !text-[1.25rem]">
          {project.title}
        </h3>
        <p className="mt-2 flex-1 text-[0.9375rem] leading-[1.47] text-label-2">
          {project.tagline}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.stack.slice(0, 3).map((s) => (
            <span key={s} className="token">
              {s}
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
