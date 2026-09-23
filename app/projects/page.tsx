import type { Metadata } from "next";
import ProjectsGrid from "@/components/ProjectsGrid";
import Reveal from "@/components/Reveal";

const description =
  "Case studies by Pooja Verma: full-stack builds, retrieval and CNN research, Salesforce platform work, and data systems, each written up with the problem, the architecture and the result.";

export const metadata: Metadata = {
  // the layout template appends the name, so the title stays short here
  title: "Projects",
  description,
  keywords: [
    "Pooja Verma projects",
    "software engineering case studies",
    "RAG system project",
    "CNN research project",
    "Salesforce automation project",
    "full-stack portfolio projects",
  ],
  alternates: { canonical: "/projects" },
  openGraph: {
    type: "website",
    title: "Projects · Pooja Verma",
    description,
    url: "/projects",
  },
  twitter: { card: "summary_large_image", title: "Projects · Pooja Verma", description },
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-36">
      <Reveal>
        <p className="eyebrow">The archive</p>
        <h1 className="large-title mt-2">Projects.</h1>
        <p className="lead mt-5 max-w-2xl">
          Every project ships with a full case study covering the problem, the
          architecture, and the results, written like documentation, because
          that&apos;s how I work.
        </p>
      </Reveal>
      <ProjectsGrid />
    </div>
  );
}
