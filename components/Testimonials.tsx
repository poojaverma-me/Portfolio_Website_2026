"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import Reveal from "@/components/Reveal";
import { testimonials, type Testimonial } from "@/lib/testimonials";

/** Pixels the row drifts per frame while nobody is touching it. */
const DRIFT = 0.35;
/** How long the drift waits after you stop scrolling, in ms. */
const RESUME_AFTER = 3500;

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
  const reduceMotion = useReducedMotion() ?? false;
  // paused while you hover, focus, drag or scroll the row yourself
  const [paused, setPaused] = useState(false);
  // nothing should drift while the row is off screen
  const [onScreen, setOnScreen] = useState(false);
  const idleTimer = useRef<number | null>(null);

  /**
   * Distance between a card and its twin in the second copy, measured rather
   * than halved, so padding and gaps cannot throw the loop off by a few pixels.
   */
  const period = () => {
    const el = scroller.current;
    const first = el?.children[0] as HTMLElement | undefined;
    const twin = el?.children[testimonials.length] as HTMLElement | undefined;
    return first && twin ? twin.offsetLeft - first.offsetLeft : 0;
  };

  const holdFor = useCallback((ms: number) => {
    setPaused(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setPaused(false), ms);
  }, []);

  // gentle drift, wrapping at the halfway point so the row never ends
  useEffect(() => {
    const el = scroller.current;
    if (!el || reduceMotion || paused || !onScreen) return;
    let frame = 0;
    const step = () => {
      el.scrollLeft += DRIFT;
      if (el.scrollLeft > period()) el.scrollLeft -= period();
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [paused, reduceMotion, onScreen]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // keep your own scrolling inside the loop too
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollLeft > period()) el.scrollLeft -= period();
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(
    () => () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    },
    [],
  );

  const nudge = (direction: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    holdFor(RESUME_AFTER);
    const card = el.querySelector("li")?.getBoundingClientRect().width ?? 320;
    // stepping back from the start jumps into the second copy first, so there
    // is always something to scroll back to
    if (direction === -1 && el.scrollLeft < card) el.scrollLeft += period();
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
                onClick={() => nudge(-1)}
                aria-label="Previous testimonials"
                className="btn-glass !h-10 !w-10 !p-0"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => nudge(1)}
                aria-label="Next testimonials"
                className="btn-glass !h-10 !w-10 !p-0"
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
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          onPointerDown={() => holdFor(RESUME_AFTER)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onWheel={() => holdFor(RESUME_AFTER)}
          onTouchStart={() => holdFor(RESUME_AFTER)}
          className="no-scrollbar flex gap-4 overflow-x-auto overscroll-x-contain px-6 py-3 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] focus-visible:outline-none"
        >
          {[0, 1].map((copy) =>
            testimonials.map((t) => (
              <li
                key={`${copy}-${t.name}`}
                className="flex-none"
                aria-hidden={copy === 1 ? true : undefined}
              >
                <TestimonialCard t={t} />
              </li>
            )),
          )}
        </ul>
      </Reveal>
    </section>
  );
}
