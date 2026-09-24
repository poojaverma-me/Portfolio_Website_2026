import {
  BookOpen,
  HeartHandshake,
  Users,
} from "lucide-react";
import Hero from "@/components/Hero";
import WhatIDo from "@/components/WhatIDo";
import Reveal from "@/components/Reveal";
import ScrollMorphHero from "@/components/ui/scroll-morph-hero";
import CountUp from "@/components/CountUp";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import Testimonials from "@/components/Testimonials";
import { projectCovers } from "@/lib/projectCovers";
import {
  profile,
  research,
  volunteering,
} from "@/lib/profile";

const stats: { value: number; suffix: string; prefix?: string; label: string }[] = [
  { value: 3000, suffix: "+", label: "Students using my RAG system" },
  { value: 4000, suffix: "+", label: "Retailers on my Salesforce builds" },
  { value: 1000, suffix: "+", label: "Staff on my check-in platform" },
  { value: 8500, suffix: "", prefix: "$", label: "Won across two research grants" },
];

function SectionHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
}) {
  return (
    <Reveal>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title mt-2 max-w-3xl">{title}</h2>
      {lead && <p className="lead mt-4 max-w-2xl">{lead}</p>}
    </Reveal>
  );
}

export default function Home() {
  return (
    <>
      <Hero />

      {/* skills */}
      <div className="relative overflow-hidden border-y hairline py-4">
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-base to-transparent"
        />
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-base to-transparent"
        />
        <div className="marquee-track">
          {[...profile.skills, ...profile.skills].map((s, i) => (
            <span
              key={`${s}-${i}`}
              className="flex items-center whitespace-nowrap text-[0.9375rem] text-label-2"
            >
              <span className="px-5">{s}</span>
              <span aria-hidden className="text-label-3">
                ·
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* what I do, with scroll parallax */}
      <WhatIDo />

      {/* featured projects */}
      <section className="mt-8 sm:mt-12" id="projects">
        <ScrollMorphHero cards={projectCovers()} allHref="/projects" />
      </section>

      {/* by the numbers */}
      <section className="mx-auto max-w-6xl px-6 pt-24">
        <div className="glass-card grid grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`px-6 py-8 hairline ${i % 2 === 1 ? "border-l" : ""} ${
                i >= 2 ? "border-t lg:border-t-0" : ""
              } ${i === 2 ? "lg:border-l" : ""}`}
            >
              <p className="display-num text-[clamp(2.5rem,5vw,3.5rem)] text-accent tabular-nums">
                {s.prefix ?? ""}
                <CountUp to={s.value} suffix={s.suffix} />
              </p>
              <p className="footnote mt-3">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* experience */}
      <section className="mx-auto max-w-6xl px-6 pt-32 scroll-mt-24" id="experience">
        <SectionHeader
          eyebrow="Experience"
          title={
            <>
              Where I&apos;ve worked.{" "}
              <span className="text-label-2">What I shipped there.</span>
            </>
          }
        />
        <ExperienceTimeline />
      </section>

      {/* research */}
      <section className="mx-auto max-w-6xl px-6 pt-32 scroll-mt-24" id="research">
        <SectionHeader
          eyebrow="Research"
          title={
            <>
              Published and presented.{" "}
              <span className="text-label-2">Documented to be reproduced.</span>
            </>
          }
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {research.map((r, i) => (
            <Reveal key={r.title} delay={i * 0.08}>
              <article className="glass-card flex h-full flex-col p-7">
                <div className="flex items-center justify-between gap-3">
                  <span className="app-icon">
                    <BookOpen size={19} strokeWidth={2} />
                  </span>
                  <span className="token">
                    {r.status} · {r.year}
                  </span>
                </div>
                <h3 className="headline mt-6 !text-[1.25rem]">
                  {r.title}
                </h3>
                <p className="mt-3 flex-1 text-[0.9375rem] leading-[1.5] text-label-2">
                  {r.summary}
                </p>
                <p className="footnote mt-6 border-t hairline pt-4">{r.venue}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* volunteering */}
      <section className="mx-auto max-w-6xl px-6 pt-32 scroll-mt-24" id="community">
        <SectionHeader
          eyebrow="Beyond the code"
          title={
            <>
              Volunteering.{" "}
              <span className="text-label-2">Showing up in person.</span>
            </>
          }
          lead="Club nights, conference desks and start lines."
        />

        {(() => {
          const club = volunteering.find((v) => v.featured);
          const shifts = volunteering.filter((v) => !v.featured);
          return (
            <div className="mt-12 grid items-start gap-4 lg:grid-cols-2">
              {club && (
                <Reveal>
                  <article className="glass-card is-interactive h-full p-6">
                    <div className="flex items-start gap-4">
                      <span className="app-icon flex-none">
                        <Users size={19} strokeWidth={2} />
                      </span>
                      <div className="min-w-0">
                        <h3 className="headline">{club.role}</h3>
                        <p className="footnote mt-1 !text-label">{club.org}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-[0.9375rem] leading-[1.47] text-label-2">
                      {club.detail}
                    </p>
                    <p className="footnote mt-4 tabular-nums">
                      {club.period} · {club.cause}
                    </p>
                  </article>
                </Reveal>
              )}

              <Reveal delay={0.08}>
                <ul className="glass-card overflow-hidden">
                  {shifts.map((v, i) => (
                    <li
                      key={`${v.org}-${v.role}`}
                      className={`flex items-baseline gap-4 px-5 py-4 ${
                        i > 0 ? "border-t hairline" : ""
                      }`}
                    >
                      <span
                        className="app-icon !h-7 !w-7 !rounded-[8px] hidden flex-none self-center sm:inline-flex"
                        aria-hidden
                      >
                        <HeartHandshake size={14} strokeWidth={2} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.9375rem] font-medium leading-tight">
                          {v.org}
                        </p>
                        <p className="footnote mt-0.5">
                          {v.role} · {v.cause}
                          {/* on a phone the date joins this line instead of squeezing the title */}
                          <span className="sm:hidden"> · {v.period}</span>
                        </p>
                      </div>
                      <span className="footnote hidden flex-none tabular-nums sm:block">
                        {v.period}
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          );
        })()}
      </section>

      {/* testimonials, right before the contact card in the footer */}
      <Testimonials />
    </>
  );
}
