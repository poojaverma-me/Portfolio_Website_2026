"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Quote } from "lucide-react";
import Reveal from "@/components/Reveal";
import { testimonials, type Testimonial } from "@/lib/testimonials";

/** Pixels the row drifts per frame while you are not touching it. */
const DRIFT = 0.32;
/** How long the drift waits after a touch scroll, in ms. */
const RESUME_AFTER = 2500;
/** The list is laid out three times, and the row sits in the middle copy. */
const COPIES = [0, 1, 2];

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
  // Held while you hover, focus or scroll the row. A ref, not state, so it
  // takes effect on the very next frame rather than after a re-render.
  const held = useRef(false);
  const idleTimer = useRef<number | null>(null);
  const [onScreen, setOnScreen] = useState(false);
  const placed = useRef(false);

  /** Distance between a card and its twin in the next copy. */
  const period = useCallback(() => {
    const el = scroller.current;
    const first = el?.children[0] as HTMLElement | undefined;
    const twin = el?.children[testimonials.length] as HTMLElement | undefined;
    return first && twin ? twin.offsetLeft - first.offsetLeft : 0;
  }, []);

  const hold = useCallback(() => {
    held.current = true;
    if (idleTimer.current) clearTimeout(idleTimer.current);
  }, []);

  const release = useCallback(() => {
    held.current = false;
  }, []);

  /** For touch, where there is no pointer to leave: resume once you stop. */
  const holdBriefly = useCallback(() => {
    held.current = true;
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      held.current = false;
    }, RESUME_AFTER);
  }, []);

  // start in the middle copy, so the row can be scrolled either way
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setOnScreen(entry.isIntersecting);
        if (entry.isIntersecting && !placed.current && period()) {
          el.scrollLeft = period();
          placed.current = true;
        }
      },
      { rootMargin: "120px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [period]);

  // the drift, paused whenever the row is yours
  useEffect(() => {
    const el = scroller.current;
    if (!el || reduceMotion || !onScreen) return;
    let frame = 0;
    const step = () => {
      frame = requestAnimationFrame(step);
      if (held.current) return;
      const p = period();
      el.scrollLeft += DRIFT;
      if (p && el.scrollLeft >= p * 2) el.scrollLeft -= p;
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [reduceMotion, onScreen, period]);

  /**
   * Once your own scrolling has settled, slide back to the middle copy. The
   * copies are identical, so the jump cannot be seen, and waiting for the
   * scroll to stop keeps it from cutting a gesture short.
   */
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let settle = 0;
    const onScroll = () => {
      if (!held.current) return;
      clearTimeout(settle);
      settle = window.setTimeout(() => {
        const p = period();
        if (!p) return;
        if (el.scrollLeft >= p * 2) el.scrollLeft -= p;
        else if (el.scrollLeft < p * 0.5) el.scrollLeft += p;
      }, 220);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(settle);
      el.removeEventListener("scroll", onScroll);
    };
  }, [period]);

  // native listeners rather than React's synthetic enter/leave, so the hold
  // is bound straight to the element the pointer is actually over
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.addEventListener("pointerenter", hold);
    el.addEventListener("pointerleave", release);
    el.addEventListener("focusin", hold);
    el.addEventListener("focusout", release);
    return () => {
      el.removeEventListener("pointerenter", hold);
      el.removeEventListener("pointerleave", release);
      el.removeEventListener("focusin", hold);
      el.removeEventListener("focusout", release);
    };
  }, [hold, release]);

  useEffect(
    () => () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    },
    [],
  );

  return (
    <section className="scroll-mt-24 pt-32" id="testimonials">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="eyebrow">Testimonials</p>
          <h2 className="section-title mt-2 max-w-3xl">
            Kind words.{" "}
            <span className="text-label-2">From people I&apos;ve built with.</span>
          </h2>
        </Reveal>
      </div>

      <Reveal delay={0.05} className="mt-12">
        <ul
          ref={scroller}
          tabIndex={0}
          aria-label="Testimonials, hover to stop and scroll"
          onTouchStart={holdBriefly}
          onTouchMove={holdBriefly}
          onTouchEnd={holdBriefly}
          className="no-scrollbar flex gap-4 overflow-x-auto overscroll-x-contain py-3 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] focus-visible:outline-none"
        >
          {COPIES.map((copy) =>
            testimonials.map((t) => (
              <li
                key={`${copy}-${t.name}`}
                className="flex-none first:ml-6 last:mr-6"
                aria-hidden={copy === 0 ? undefined : true}
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
