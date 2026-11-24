import type { Metadata } from "next";
import Link from "next/link";
import ProjectsGrid from "@/components/ProjectsGrid";
import { projectCountWord } from "@/lib/projects";
import Reveal from "@/components/Reveal";

const description =
  "AI and machine learning case studies by Kamloops developer Pooja Verma. Explore wildfire recovery models, support ticket routing and the data behind their results.";

export const metadata: Metadata = {
  // the layout template appends the name, so the title stays short here
  title: "AI and Machine Learning Projects",
  description,
  keywords: [
    "Pooja Verma projects",
    "machine learning case studies",
    "wildfire recovery machine learning",
    "keystroke dynamics behavioural biometrics",
    "Gemini LLM app",
    "Firebase real-time app",
    "Next.js portfolio projects",
  ],
  alternates: { canonical: "/projects" },
  openGraph: {
    type: "website",
    title: "AI and Machine Learning Projects · Pooja Verma",
    description,
    url: "/projects",
  },
  twitter: { card: "summary_large_image", title: "AI and Machine Learning Projects · Pooja Verma", description },
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-36">
      <Reveal>
        <p className="eyebrow">The archive</p>
        <h1 className="large-title mt-2">Projects.</h1>
        <p className="lead mt-5 max-w-2xl">
          {projectCountWord()} builds across machine learning research, AI products, games and
          full-stack apps. See how I tested{" "}
          <Link href="/projects/tidal" className="text-accent hover:underline">Tidal&apos;s support ticket routing</Link>
          {" "}on 96 labelled tickets, or explore the six datasets behind{" "}
          <Link href="/projects/after-fire" className="text-accent hover:underline">After Fire&apos;s wildfire recovery atlas</Link>.
          Each case study covers what I built, how I tested it and what I would change.
        </p>
      </Reveal>
      <ProjectsGrid />
    </div>
  );
}
