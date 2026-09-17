import type { Metadata } from "next";
import ProjectsGrid from "@/components/ProjectsGrid";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Projects · Pooja Verma",
  description:
    "All projects by Pooja Verma: full-stack builds, ML research, products, and systems work.",
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
