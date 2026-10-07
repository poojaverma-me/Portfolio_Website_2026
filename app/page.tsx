import { HeartHandshake, Users } from "lucide-react";
import Hero from "@/components/Hero";
import Toolkit from "@/components/Toolkit";
import WhatIDo from "@/components/WhatIDo";
import Reveal from "@/components/Reveal";
import ScrollMorphHero from "@/components/ui/scroll-morph-hero";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import Research from "@/components/Research";
import Newsletter from "@/components/Newsletter";
import Videos from "@/components/Videos";
import { projectCovers } from "@/lib/projectCovers";
import { volunteering } from "@/lib/profile";

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

      <Toolkit />

      {/* what I do, with scroll parallax */}
      <WhatIDo />

      {/* featured projects */}
      <section className="mt-8 sm:mt-12" id="projects">
        <ScrollMorphHero cards={projectCovers()} allHref="/projects" />
      </section>

      {/* experience */}
      <section className="mx-auto max-w-6xl px-6 pt-24 sm:pt-28 scroll-mt-24" id="experience">
        <SectionHeader
          eyebrow="Experience"
          title={
            <>
              Teams I&apos;ve built for.{" "}
              <span className="text-label-2">Problems I left solved.</span>
            </>
          }
        />
        <ExperienceTimeline />
      </section>

      <Research />

      <Newsletter />
      <Videos />

      {/* volunteering */}
      <section className="mx-auto max-w-6xl px-6 pt-24 sm:pt-28 scroll-mt-24" id="community">
        <SectionHeader
          eyebrow="Beyond the code"
          title={
            <>
              Community.{" "}
              <span className="text-label-2">Where I show up off the clock.</span>
            </>
          }
          lead="Co-founding TRU's first combat robotics club, and staffing the registration desks that keep conferences, showcases and races running."
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
    </>
  );
}
