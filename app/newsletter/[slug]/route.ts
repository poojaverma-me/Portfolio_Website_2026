import { issues } from "@/lib/newsletter";
import { newsletterResponse } from "@/lib/newsletter-html";

// one static page per Benchmarked issue; anything else is a 404
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return issues.map((i) => ({ slug: i.slug }));
}

export async function GET(_request: Request, { params }: RouteContext<"/newsletter/[slug]">) {
  const { slug } = await params;
  const issue = issues.find((i) => i.slug === slug);
  if (!issue) return new Response("Not found", { status: 404 });
  return newsletterResponse({
    file: `${slug}.html`,
    path: `/newsletter/${slug}`,
    title: `${issue.title} · Benchmarked`,
    description: issue.dek,
    image: issue.cover,
    base: `/newsletter/${slug}/`,
  });
}
