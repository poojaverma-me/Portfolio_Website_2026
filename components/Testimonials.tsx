"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
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
    <figure className="glass-card flex h-full w-[300px] flex-col p-6 sm:w-[360px]">
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

export default function Testimonials() {
  const scroller = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const readEdges = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    readEdges();
    el.addEventListener("scroll", readEdges, { passive: true });
    window.addEventListener("resize", readEdges);
    return () => {
      el.removeEventListener("scroll", readEdges);
      window.removeEventListener("resize", readEdges);
    };
  }, [readEdges]);

  const step = (direction: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector("li")?.getBoundingClientRect().width ?? 320;
    el.scrollBy({ left: direction * (card + 16), behavior: "smooth" });
  };

  return (
    <section className="scroll-mt-24 pt-32" id="testimonials">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="eyebrow">Testimonials</p>
          <div className="flex items-end justify-between gap-6">
            <h2 className="section-title mt-2 max-w-3xl">
              Kind words.{" "}
              <span className="text-label-2">From people I&apos;ve built with.</span>
            </h2>
            <div className="hidden flex-none gap-2 sm:flex">
              <button
                type="button"
                onClick={() => step(-1)}
                disabled={atStart}
                aria-label="Previous testimonials"
                className="btn-glass !h-10 !w-10 !p-0 disabled:pointer-events-none disabled:opacity-35"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                disabled={atEnd}
                aria-label="Next testimonials"
                className="btn-glass !h-10 !w-10 !p-0 disabled:pointer-events-none disabled:opacity-35"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.05} className="mt-12">
        <ul
          ref={scroller}
          tabIndex={0}
          aria-label="Testimonials, scroll for more"
          className="no-scrollbar flex gap-4 overflow-x-auto overscroll-x-contain py-3 [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)] focus-visible:outline-none"
        >
          {testimonials.map((t) => (
            <li key={t.name} className="flex-none first:ml-6 last:mr-6">
              <TestimonialCard t={t} />
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
