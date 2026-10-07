"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import VideoCard from "@/components/VideoCard";
import { CHANNELS } from "@/lib/videos";

/**
 * YouTube: one tab per channel (Beyond Prompt, then the personal channel's
 * project demos). The segmented control matches the projects archive;
 * arrow keys move between tabs. Driven by lib/videos.ts.
 */
export default function Videos() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduce = useReducedMotion();
  const channel = CHANNELS[active];

  function onKey(e: KeyboardEvent) {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (active + step + CHANNELS.length) % CHANNELS.length;
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <section className="mx-auto max-w-6xl scroll-mt-24 px-6 pt-24 sm:pt-28" id="videos">
      <Reveal>
        <p className="eyebrow">YouTube</p>
        <h2 className="section-title mt-2 max-w-3xl">
          Making AI make sense, <span className="text-label-2">one video at a time.</span>
        </h2>
        <p className="lead mt-4 max-w-2xl">
          On Beyond Prompt I check the week&apos;s AI launches against independent benchmarks. On
          my own channel I demo the products I build, each in under two minutes.
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div
            role="tablist"
            aria-label="YouTube channel"
            onKeyDown={onKey}
            className="glass inline-flex max-w-full rounded-full p-1"
          >
            {CHANNELS.map((c, i) => {
              const selected = i === active;
              return (
                <button
                  key={c.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${c.id}`}
                  aria-selected={selected}
                  aria-controls="videos-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(i)}
                  className={`relative whitespace-nowrap rounded-full px-4 py-1.5 text-[0.875rem] transition-colors ${
                    selected ? "text-label" : "text-label-2 hover:text-label"
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="channel-segment"
                      className="absolute inset-0 rounded-full bg-fill-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_1px_3px_var(--shadow-strong)]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">
                    {c.name} <span className="tabular-nums text-label-3">{c.videos.length}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <a href={channel.url} target="_blank" rel="noreferrer" className="link-accent text-[0.9375rem]">
            {channel.handle} on YouTube <ArrowUpRight size={15} />
          </a>
        </div>
      </Reveal>

      <div id="videos-panel" role="tabpanel" aria-labelledby={`tab-${channel.id}`}>
        <p className="footnote mt-4">{channel.about}</p>
        {/* keyed by channel so the grid remounts with a fresh fade-in */}
        <div key={channel.id} className="mt-6 grid gap-4 md:grid-cols-3">
          {channel.videos.map((v, i) => (
            <motion.div
              key={v.id}
              className="h-full"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <VideoCard v={v} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
