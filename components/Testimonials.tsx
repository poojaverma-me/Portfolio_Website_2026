import { Quote } from "lucide-react";
import Reveal from "@/components/Reveal";
import { testimonials, type Testimonial } from "@/lib/testimonials";

function initials(name: string) {
  return name
    .replace(/^Dr\.\s+/, "")
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="glass-card flex h-full w-[340px] flex-col p-6 sm:w-[380px]">
      <div className="flex items-start justify-between gap-3">
        <Quote size={22} className="flex-none text-accent" aria-hidden />
        <span className="token">{t.context}</span>
      </div>
      <blockquote className="mt-4 flex-1 text-[0.9375rem] leading-[1.6] text-label-2">
        {t.quote}
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t hairline pt-4">
        <span className="app-icon text-[0.8125rem] font-semibold" aria-hidden>
          {initials(t.name)}
        </span>
        <div className="min-w-0">
          <p className="headline !text-[0.9375rem]">{t.name}</p>
          <p className="footnote">{t.role}</p>
        </div>
      </figcaption>
    </figure>
  );
}

/** One infinitely scrolling row. The list renders twice so the loop is seamless. */
function Row({ items, reverse = false }: { items: Testimonial[]; reverse?: boolean }) {
  return (
    <div className="overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div
        className={`marquee-track ![animation-duration:80s] motion-reduce:![animation:none] ${
          reverse ? "[animation-direction:reverse]" : ""
        }`}
      >
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex" aria-hidden={copy === 1 ? true : undefined}>
            {items.map((t) => (
              // padding instead of gap keeps each copy exactly half the track
              <li key={t.name} className="pr-4">
                <TestimonialCard t={t} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export default function Testimonials() {
  // each row carries every quote (second row shifted) so a copy is always
  // wider than the viewport and the loop never shows a gap
  const shifted = [...testimonials.slice(3), ...testimonials.slice(0, 3)];

  return (
    <section className="pt-32 scroll-mt-24" id="testimonials">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="eyebrow">Testimonials</p>
          <h2 className="section-title mt-2 max-w-3xl">
            Kind words. <span className="text-label-2">From people I&apos;ve built with.</span>
          </h2>
        </Reveal>
      </div>

      <Reveal delay={0.05} className="mt-12">
        <Row items={testimonials} />
        <Row items={shifted} reverse />
      </Reveal>
    </section>
  );
}
