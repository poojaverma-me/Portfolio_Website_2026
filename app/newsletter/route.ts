import { issues } from "@/lib/newsletter";
import { newsletterResponse } from "@/lib/newsletter-html";

// the Benchmarked contents page, built once at build time
export const dynamic = "force-static";

export function GET() {
  return newsletterResponse({
    file: "index.html",
    path: "/newsletter",
    title: "Benchmarked: the AI news, fact-checked",
    description: `Every number labelled by who reported it: the company, an independent tester, the press or the community. ${issues.length} issues by Pooja Verma.`,
    image: issues[0]?.cover,
    // the contents page links each issue as <slug>/index.html; point them at the clean routes
    rewrite: (html) => html.replace(/href="([^"/]+)\/index\.html"/g, 'href="/newsletter/$1"'),
  });
}
