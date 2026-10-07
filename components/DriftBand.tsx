"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Oversized outlined words behind a section heading, sliding sideways as the
 * section scrolls through the viewport. Decorative only; still with reduced
 * motion and hidden on small screens, where it would crowd the heading.
 */
export default function DriftBand({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["6%", "-34%"]);
  return (
    <div ref={ref} aria-hidden className={`pointer-events-none absolute inset-x-0 hidden sm:block ${className}`}>
      <motion.div
        style={{ x }}
        className="whitespace-nowrap font-display text-[clamp(6rem,17vw,15rem)] uppercase leading-none text-transparent [-webkit-text-stroke:1px_var(--color-separator)]"
      >
        {text}
      </motion.div>
    </div>
  );
}
