"use client";

import { useRef, useSyncExternalStore } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { BrainCircuit, Code, Database, Layers } from "lucide-react";
import Reveal from "@/components/Reveal";

const features = [
  {
    icon: Code,
    title: "Full-stack builds",
    desc: "React, TypeScript, and REST APIs, taken end to end from design to deploy.",
  },
  {
    icon: BrainCircuit,
    title: "AI and ML",
    desc: "RAG systems, CNNs, and LLM evaluation, from research question to shipped model.",
  },
  {
    icon: Database,
    title: "Data and analytics",
    desc: "SQL, Snowflake, Tableau, and Power BI: pipelines that end in decisions.",
  },
  {
    icon: Layers,
    title: "Enterprise platforms",
    desc: "Salesforce (Apex, LWC) and Power Apps automation at national scale.",
  },
];

// Scroll distance (px) each card travels; alternating depths read as layers.
const CARD_DEPTH = [70, 150, 40, 120];

const LG_QUERY = "(min-width: 1024px)";

function useIsLarge() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(LG_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(LG_QUERY).matches,
    () => false,
  );
}

function ParallaxCard({
  feature,
  progress,
  depth,
}: {
  feature: (typeof features)[number];
  progress: MotionValue<number>;
  depth: number;
}) {
  const y = useTransform(progress, [0, 1], [depth, -depth]);
  return (
    <motion.div style={{ y }} className="h-full">
      <div className="glass-card is-interactive h-full p-6">
        <span className="app-icon">
          <feature.icon size={20} strokeWidth={2} />
        </span>
        <h3 className="headline mt-5">{feature.title}</h3>
        <p className="mt-2 text-[0.9375rem] leading-[1.47] text-label-2">{feature.desc}</p>
      </div>
    </motion.div>
  );
}

export default function WhatIDo() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() ?? false;
  const large = useIsLarge();

  // 0 when the section enters from below, 1 when it leaves at the top
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const still = useTransform(scrollYProgress, () => 0);
  const progress = reduce ? still : scrollYProgress;

  const bandX = useTransform(progress, [0, 1], reduce ? ["0%", "0%"] : ["6%", "-34%"]);
  const headerY = useTransform(progress, [0, 1], reduce ? [0, 0] : [40, -40]);
  const cardDepth = reduce || !large ? 0 : 1;

  return (
    <section ref={ref} className="relative overflow-hidden pt-24 pb-10 sm:pt-32 sm:pb-24">
      {/* oversized outline band drifting behind the heading */}
      <motion.div
        aria-hidden
        style={{ x: bandX }}
        className="pointer-events-none absolute left-0 top-20 whitespace-nowrap font-display text-[clamp(6rem,17vw,15rem)] uppercase leading-none text-transparent [-webkit-text-stroke:1px_var(--color-separator)]"
      >
        Build · Ship · Research · Build · Ship
      </motion.div>

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div style={{ y: headerY }}>
          <Reveal>
            <p className="eyebrow">What I do</p>
            <h2 className="section-title mt-2 max-w-3xl">
              Built for problems. <span className="text-label-2">Wired for shipping.</span>
            </h2>
          </Reveal>
        </motion.div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:pt-16">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06} className="h-full">
              <ParallaxCard
                feature={f}
                progress={progress}
                depth={CARD_DEPTH[i] * cardDepth}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
