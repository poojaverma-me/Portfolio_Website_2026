import type { Metadata } from "next";
import ProjectsGrid from "@/components/ProjectsGrid";
import Reveal from "@/components/Reveal";

const description =
  "Case studies by Pooja Verma: AI products built on TypeSafe's Jev (a movie recommender, live sales-call coaching, ticket routing, resume screening, a voice-controlled game and a cooking app), a wildfire-recovery atlas from her ML research, a keystroke-biometrics study and more.";

export const metadata: Metadata = {
  // the layout template appends the name, so the title stays short here
  title: "Projects",
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
          Twelve builds across machine learning research, AI products and
          full-stack apps. Each case study covers the problem, how it works and the
          results, with screenshots of the real thing and what I would fix
          next.
        </p>
      </Reveal>
      <ProjectsGrid />
    </div>
  );
}
