import type { MetadataRoute } from "next";
import { CASE_STUDIES_PUBLISHED, projects } from "@/lib/projects";
import { issues } from "@/lib/newsletter";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "monthly", priority: 1 },
    {
      url: `${SITE_URL}/projects`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // placeholder case studies stay out until they are real (see lib/projects.ts)
    ...(CASE_STUDIES_PUBLISHED ? projects : []).map((p) => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    { url: `${SITE_URL}/newsletter`, lastModified: new Date(issues[0].iso), changeFrequency: "weekly", priority: 0.7 },
    ...issues.map((i) => ({
      url: `${SITE_URL}/newsletter/${i.slug}`,
      lastModified: new Date(i.iso),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
