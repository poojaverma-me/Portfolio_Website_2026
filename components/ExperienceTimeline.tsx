"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { MapPin } from "lucide-react";
import { experience, type Experience } from "@/lib/profile";

const ease = [0.22, 1, 0.36, 1] as const;

function Entry({ item, index }: { item: Experience; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const reduce = useReducedMotion() ?? false;
  // the rail segment burns down once, the first time you reach this role
  const lit = useInView(ref, { once: true, margin: "-15% 0px -25% 0px" });
  // the role you are actually reading gets the light
  const active = useInView(ref, { margin: "-42% 0px -42% 0px" });
  const on = reduce || lit;

  return (
    <li ref={ref} className="relative grid gap-x-10 gap-y-3 pb-14 lg:grid-cols-[210px_1fr]">
      {/* who and when */}
      <div className="pl-8 lg:pl-0 lg:pt-1 lg:text-right">
        <p className="section-marker">{String(index + 1).padStart(2, "0")}</p>
        <h3
          className={`mt-1.5 font-display text-[1.0625rem] uppercase leading-tight tracking-[0.01em] transition-colors duration-500 ${
            active ? "text-accent" : "text-label"
          }`}
        >
          {item.company}
        </h3>
        <p className="mt-1.5 font-mono text-[0.75rem] tabular-nums text-label-3">
          {item.period}
        </p>
        <p className="footnote mt-1 flex items-center gap-1 lg:justify-end">
          <MapPin size={12} /> {item.location}
        </p>
      </div>

      {/* the rail, and what happened */}
      <div className="relative pl-8">
        <span
          aria-hidden
          className="absolute left-0 top-2 h-[calc(100%+3.5rem)] w-px bg-[var(--color-separator)]"
        />
        <motion.span
          aria-hidden
          className="absolute left-0 top-2 h-[calc(100%+3.5rem)] w-px origin-top bg-gradient-to-b from-accent to-transparent"
          initial={reduce ? false : { scaleY: 0 }}
          animate={{ scaleY: on ? 1 : 0 }}
          transition={{ duration: reduce ? 0 : 1.1, ease }}
        />
        <span
          aria-hidden
          className={`absolute -left-[4.5px] top-[6px] h-[10px] w-[10px] rounded-full transition-all duration-500 ${
            active
              ? "bg-accent shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_18%,transparent),0_0_22px_var(--color-accent)]"
              : on
                ? "bg-accent/70"
                : "bg-fill-2"
          }`}
        />

        <div
          className={`rounded-2xl p-5 transition-all duration-500 ${
            active
              ? "bg-[color-mix(in_srgb,var(--color-surface)_55%,transparent)] shadow-[inset_0_0_0_1px_var(--edge)]"
              : "bg-transparent shadow-[inset_0_0_0_1px_transparent]"
          }`}
        >
          <h4 className="headline !text-[1.1875rem]">{item.role}</h4>
          <ul className="mt-4 flex flex-col gap-2.5">
            {item.points.map((pt) => (
              <li
                key={pt}
                className="flex gap-2.5 text-[0.9375rem] leading-[1.5] text-label-2"
              >
                <span aria-hidden className="mt-[1px] flex-none font-mono text-accent">
                  ›
                </span>
                {pt}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {item.tags.map((t) => (
              <span key={t} className="token">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}

export default function ExperienceTimeline() {
  return (
    <ol className="mt-12">
      {experience.map((item, i) => (
        <Entry key={`${item.company}-${item.role}`} item={item} index={i} />
      ))}
    </ol>
  );
}
