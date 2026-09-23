"use client";

import { useEffect, useRef, useState } from "react";

type Section = { id: string; title: string };

export default function DocsIndex({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(sections[0]?.id);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-25% 0px -60% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  // keep the current chip in the middle of the compact rail
  useEffect(() => {
    const rail = railRef.current;
    const chip = rail?.querySelector<HTMLElement>(`[data-chip="${active}"]`);
    if (!rail || !chip) return;
    rail.scrollTo({
      left: chip.offsetLeft - (rail.clientWidth - chip.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, [active]);

  return (
    <nav aria-label="Case study contents" className="lg:sticky lg:top-[156px]">
      {/* phones and tablets: one line of chips that follows your reading */}
      <div
        ref={railRef}
        className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 lg:hidden"
      >
        {sections.map((s, i) => {
          const isActive = active === s.id;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              data-chip={s.id}
              aria-current={isActive ? "location" : undefined}
              className={`flex flex-none items-center gap-1.5 rounded-full py-1.5 pl-1.5 pr-3 text-[0.8125rem] transition-colors ${
                isActive ? "bg-fill-2 text-label" : "text-label-2"
              }`}
            >
              <span
                className={`flex h-5 w-5 flex-none items-center justify-center rounded-full text-[0.6875rem] font-semibold tabular-nums transition-colors ${
                  isActive ? "bg-accent text-[var(--on-accent)]" : "bg-fill-2 text-label-2"
                }`}
              >
                {i + 1}
              </span>
              {s.title}
            </a>
          );
        })}
      </div>

      {/* desktop: the full index, pinned beside the article */}
      <div className="hidden lg:block">
        <p className="px-3 text-[0.6875rem] font-semibold tracking-[0.01em] text-label-3">
          Contents
        </p>
        <ol className="mt-1.5 flex flex-col gap-0.5">
          {sections.map((s, i) => {
            const isActive = active === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={isActive ? "location" : undefined}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[0.875rem] transition-colors ${
                    isActive
                      ? "bg-fill-2 text-label"
                      : "text-label-2 hover:bg-fill hover:text-label"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 flex-none items-center justify-center rounded-full text-[0.6875rem] font-semibold tabular-nums transition-colors ${
                      isActive ? "bg-accent text-[var(--on-accent)]" : "bg-fill-2 text-label-2"
                    }`}
                  >
                    {i + 1}
                  </span>
                  {s.title}
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
