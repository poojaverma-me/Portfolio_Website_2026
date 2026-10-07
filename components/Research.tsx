import Reveal from "@/components/Reveal";
import { NotchedProjectCard } from "@/components/ui/notched-project-card";
import { research } from "@/lib/profile";

/**
 * Research and publications, each told from the question that started it, as
 * notched cards: the question as the title, what happened as the text, then
 * the formal title and venue. Covers sit in black and white until hovered.
 * New papers and preprints go into `research` in lib/profile.ts.
 */
export default function Research() {
  return (
    <section className="mx-auto max-w-6xl scroll-mt-24 px-6 pt-24 sm:pt-28" id="research">
      <Reveal>
        <p className="eyebrow">Research &amp; Publications</p>
        <h2 className="section-title mt-2 max-w-3xl">
          Every study began <span className="text-label-2">with a question I couldn&apos;t let go.</span>
        </h2>
        <p className="lead mt-4 max-w-2xl">
          A disease one photograph can catch before it takes someone&apos;s sight. A fire season
          that burned twice its old record. A language model that might learn to type like us.
          Each question became a study, and each study became something people can use.
        </p>
      </Reveal>
      {/* each card spans five shared rows (cover, question, story, tags, fine
          print) through subgrid, so every part lines up across the row */}
      <ol className="mt-12 grid gap-x-6 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
        {research.map((r, i) => (
          <li key={r.title} className="row-span-5 grid grid-rows-subgrid gap-y-0">
            <Reveal delay={(i % 3) * 0.06} className="row-span-5 grid grid-rows-subgrid gap-y-0">
              <NotchedProjectCard
                href={r.links?.[0]?.href}
                title={r.hook}
                description={r.summary}
                image={r.cover.src}
                imageAlt={r.cover.alt}
                screen={
                  r.screen
                    ? { src: r.screen, alt: `${r.title}: the work`, className: "rounded-tl-xl" }
                    : undefined
                }
                badge={r.year}
                tags={[...r.kinds, r.status]}
                monochrome
                compact
                className="row-span-5 grid grid-rows-subgrid gap-y-0"
                footnote={
                  <div className="mt-4 self-start border-t hairline pb-14 pt-4 lg:pb-0">
                    <p className="footnote !text-label">{r.title}</p>
                    <p className="footnote mt-1">{r.venue}</p>
                  </div>
                }
              />
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
