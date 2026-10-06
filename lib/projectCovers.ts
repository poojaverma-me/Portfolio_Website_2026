import type { MorphCard } from "@/components/ui/scroll-morph-hero";
import { projects } from "@/lib/projects";

/**
 * The homepage arc's cards: small portrait crops of each project's real
 * screenshots, dealt round-robin so neighbouring cards come from different
 * projects.
 */
export function projectCovers(): MorphCard[] {
  const queues = projects.map((p) => ({ project: p, srcs: [...(p.thumbs ?? [])] }));
  const cards: MorphCard[] = [];
  while (queues.some((q) => q.srcs.length)) {
    for (const q of queues) {
      const src = q.srcs.shift();
      if (!src) continue;
      cards.push({
        src,
        title: q.project.title,
        category: q.project.category,
        href: `/projects/${q.project.slug}`,
      });
    }
  }
  return cards;
}
