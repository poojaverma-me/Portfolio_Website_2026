"use client";

import { useEffect, useState } from "react";

export default function DocsIndex({
  sections,
}: {
  sections: { id: string; title: string }[];
}) {
  const [active, setActive] = useState(sections[0]?.id);
  const [progress, setProgress] = useState(0);

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

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
    };
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [sections]);

  return (
    <nav aria-label="Case study contents" className="lg:sticky lg:top-[136px]">
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
                  isActive ? "bg-fill-2 text-label" : "text-label-2 hover:bg-fill hover:text-label"
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

      <div className="mt-6 px-3">
        <div className="flex items-center justify-between text-[0.6875rem] text-label-3">
          <span className="font-semibold">Reading progress</span>
          <span className="tabular-nums">{Math.round(progress * 100)}%</span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-fill-2">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-150"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </nav>
  );
}
