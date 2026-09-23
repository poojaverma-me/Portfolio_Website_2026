"use client";

import { useEffect, useState } from "react";

type Section = { id: string; title: string };

/** Sticky contents rail beside a case study, from laptop width up, like the reference. */
export default function CaseStudyToc({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-20% 0px -65% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="Case study contents"
      className="hidden lg:sticky lg:top-[124px] lg:block lg:self-start"
    >
      <p className="section-marker">
        <span aria-hidden>{"//"}</span> Contents
      </p>
      <ul className="mt-4 flex flex-col">
        {sections.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`block border-l py-1.5 pl-3 font-mono text-[0.6875rem] uppercase tracking-[0.08em] transition-colors ${
                  isActive
                    ? "border-accent text-accent"
                    : "border-[var(--color-separator)] text-label-3 hover:text-label"
                }`}
              >
                {s.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
