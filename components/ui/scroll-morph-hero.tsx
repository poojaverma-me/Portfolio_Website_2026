"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";

// --- Types ---
export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

export type MorphCard = {
  src: string;
  title: string;
  category: string;
  href: string;
};

type Target = {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
};

// --- FlipCard ---
const IMG_WIDTH = 60;
const IMG_HEIGHT = 85;

function FlipCard({
  card,
  target,
  instant,
}: {
  card: MorphCard;
  target: Target;
  instant: boolean;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotation,
        scale: target.scale,
        opacity: target.opacity,
      }}
      transition={
        instant ? { duration: 0 } : { type: "spring", stiffness: 40, damping: 15 }
      }
      style={{
        position: "absolute",
        width: IMG_WIDTH,
        height: IMG_HEIGHT,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      <Link
        href={card.href}
        aria-label={`${card.title} case study`}
        tabIndex={target.opacity === 0 ? -1 : undefined}
        className="block h-full w-full rounded-xl focus-visible:!outline-offset-2"
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
        onFocus={() => setFlipped(true)}
        onBlur={() => setFlipped(false)}
      >
        <motion.div
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={
            instant
              ? { duration: 0 }
              : { type: "spring", stiffness: 260, damping: 20 }
          }
        >
          {/* front: project cover */}
          <div
            className="absolute inset-0 overflow-hidden rounded-[9px] bg-surface shadow-[inset_0_0_0_0.5px_rgb(255_255_255/0.2),0_0_0_0.5px_var(--edge-strong),0_8px_24px_var(--shadow-strong)]"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.src}
              alt=""
              draggable={false}
              decoding="async"
              className="h-full w-full object-cover"
            />
            {/* specular edge, like a Liquid Glass tile */}
            <div className="absolute inset-0 rounded-[9px] bg-gradient-to-b from-white/20 via-transparent to-black/30 shadow-[inset_0_0.5px_0_rgb(255_255_255/0.5)]" />
          </div>

          {/* back: project label */}
          <div
            className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[9px] bg-surface-2/90 p-1.5 shadow-[inset_0_0.5px_0_rgb(255_255_255/0.45),inset_0_0_0_0.5px_rgb(255_255_255/0.12),0_0_0_0.5px_var(--edge-strong)] backdrop-blur-md"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <span className="block h-2 w-2 rounded-[2.5px] bg-accent" />
            <div>
              <p className="text-[4.5px] font-semibold leading-tight text-label-2">
                {card.category}
              </p>
              <p className="mt-0.5 font-display text-[8px] uppercase leading-[1.05] text-label">
                {card.title}
              </p>
            </div>
            <p className="flex items-center text-[5px] text-accent">
              Read case study <ChevronRight size={6} strokeWidth={2.5} />
            </p>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// --- Main ---
// Timeline the animation runs on, in virtual units.
const HOLD = 300; // circle sits still so the section title can be read
const MORPH_END = HOLD + 600; // circle fully morphed into the arc
const MAX_SCROLL = 1800; // end of the sweep, the page carries on after this
// Page-scroll distance (px) the stage stays pinned for. Half the timeline, so
// one flick of the wheel or thumb covers twice the motion it used to.
const SCROLL_DISTANCE = 900;

// Stage geometry per breakpoint. apex is the arc's high point as a fraction of
// stage height measured from the middle, so a small number sits it near centre.
const LAYOUT = {
  mobile: { radius: 1.05, apex: 0.02, spread: 104, sweepArc: 52, scale: 2, ring: 0.35, ringY: 0.16 },
  // A wide spread keeps cards entering from the right as others leave on the
  // left, so the sweep never empties one side of the screen.
  desktop: { radius: 1.1, apex: 0.12, spread: 150, sweepArc: 45, scale: 1.8, ring: 0.42, ringY: -0.05 },
};

// Tracks the wheel closely while still easing into place.
const SPRING = { stiffness: 90, damping: 24, restDelta: 0.0005 } as const;

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

// Deterministic pseudo-random so server and client render the same positions
const seeded = (n: number) => {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

export default function ScrollMorphHero({
  cards,
  allHref = "/projects",
}: {
  cards: MorphCard[];
  /** where the "View all projects" link goes */
  allHref?: string;
}) {
  const total = cards.length;
  const reduceMotion = useReducedMotion() ?? false;

  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // --- Intro plays the first time the section scrolls into view ---
  const inView = useInView(stageRef, { once: true, amount: 0.35 });
  const [timedPhase, setTimedPhase] = useState<AnimationPhase>("scatter");
  const introPhase: AnimationPhase = reduceMotion ? "circle" : timedPhase;

  useEffect(() => {
    if (reduceMotion || !inView) return;
    const timer1 = setTimeout(() => setTimedPhase("line"), 250);
    const timer2 = setTimeout(() => setTimedPhase("circle"), 1500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [inView, reduceMotion]);

  // --- Stage Size ---
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // --- Page scroll drives the animation while the stage is pinned ---
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const virtualScroll = useTransform(scrollYProgress, (p) =>
    reduceMotion ? MORPH_END : p * MAX_SCROLL
  );

  // 1. Morph: circle (0) to bottom arc (1)
  const morphProgress = useTransform(virtualScroll, [HOLD, MORPH_END], [0, 1]);
  const smoothMorph = useSpring(morphProgress, SPRING);

  // 2. Sweep along the arc after the morph
  const scrollRotate = useTransform(virtualScroll, [MORPH_END, MAX_SCROLL], [0, 1]);
  const smoothScrollRotate = useSpring(scrollRotate, SPRING);

  // --- Mouse Parallax ---
  const mouseX = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 20 });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reduceMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = stage.getBoundingClientRect();
      const normalizedX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseX.set(normalizedX * 100);
    };
    stage.addEventListener("mousemove", handleMouseMove);
    return () => stage.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, reduceMotion]);

  // --- Scatter Positions ---
  const scatterPositions = useMemo<Target[]>(
    () =>
      cards.map((_, i) => ({
        x: (seeded(i + 1) - 0.5) * 1500,
        y: (seeded(i + 101) - 0.5) * 1000,
        rotation: (seeded(i + 201) - 0.5) * 180,
        scale: 0.6,
        opacity: 0,
      })),
    [cards]
  );

  // --- Per-frame values for the morph math ---
  const [morphValue, setMorphValue] = useState(0);
  const [rotateValue, setRotateValue] = useState(0);
  const [parallaxValue, setParallaxValue] = useState(0);

  useEffect(() => {
    const unsubscribeMorph = smoothMorph.on("change", setMorphValue);
    const unsubscribeRotate = smoothScrollRotate.on("change", setRotateValue);
    const unsubscribeParallax = smoothMouseX.on("change", setParallaxValue);
    return () => {
      unsubscribeMorph();
      unsubscribeRotate();
      unsubscribeParallax();
    };
  }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

  // Reduced motion never animates the springs, so read the arc state directly
  const morph = reduceMotion ? 1 : morphValue;
  const sweep = reduceMotion ? 0 : rotateValue;

  // --- Content Opacity ---
  const contentOpacity = useTransform(smoothMorph, [0.8, 1], [0, 1]);
  const contentY = useTransform(smoothMorph, [0.8, 1], [20, 0]);

  const introVisible = introPhase === "circle" && morph < 0.5;

  // Which card sits on the apex: at rest the middle one, at the end of the sweep the last.
  const apexIndex = Math.min(
    total - 1,
    Math.max(0, Math.round(((total - 1) * (1 + Math.min(Math.max(sweep, 0), 1))) / 2)),
  );
  const apexCard = cards[apexIndex];

  // "View all projects" arrives with the arc, not before it
  const ctaOpacity = useTransform(smoothScrollRotate, [0.3, 0.65], [0, 1]);
  const ctaY = useTransform(smoothScrollRotate, [0.3, 0.65], [14, 0]);
  const [ctaReady, setCtaReady] = useState(reduceMotion);
  useEffect(() => {
    if (reduceMotion) return;
    return smoothScrollRotate.on("change", (v) => setCtaReady(v > 0.4));
  }, [smoothScrollRotate, reduceMotion]);

  return (
    <div
      ref={trackRef}
      className="relative"
      style={{ height: reduceMotion ? "100svh" : `calc(100svh + ${SCROLL_DISTANCE}px)` }}
    >
      <div
        ref={stageRef}
        className="sticky top-0 h-[100svh] min-h-[600px] w-full overflow-hidden"
      >
        {/* ambient light */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 45% 40% at 50% 50%, rgb(249 107 11 / 0.08), transparent 70%)",
          }}
        />

        <div className="flex h-full w-full flex-col items-center justify-center">
          {/* Intro text (fades out as the arc forms) */}
          <div className="pointer-events-none absolute inset-x-0 top-[13%] z-0 flex flex-col items-center justify-center px-6 text-center sm:top-[45%] sm:-translate-y-1/2">
            <motion.p
              initial={{ opacity: 0 }}
              animate={introVisible ? { opacity: 1 - morph * 2 } : { opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.8 }}
              className="eyebrow mb-2"
            >
              Selected work
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={
                introVisible
                  ? { opacity: 1 - morph * 2, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, filter: "blur(10px)" }
              }
              transition={{ duration: reduceMotion ? 0 : 1 }}
              className="large-title max-w-[34rem]"
            >
              Featured projects.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={introVisible ? { opacity: 0.8 - morph } : { opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 1, delay: 0.2 }}
              className="footnote mt-5 flex items-center gap-1.5"
            >
              Scroll to explore <ChevronDown size={14} />
            </motion.p>
          </div>

          {/* Arc content (fades in once the arc forms) */}
          <motion.div
            style={reduceMotion ? undefined : { opacity: contentOpacity, y: contentY }}
            className="pointer-events-none absolute inset-x-0 top-[11%] z-10 flex flex-col items-center justify-center px-6 text-center sm:top-[14%]"
          >
            <p className="eyebrow mb-2">The archive</p>
            <h3 className="section-title mb-3 sm:mb-4">
              Six builds. <span className="text-label-2">One archive.</span>
            </h3>
            <p className="lead max-w-lg !text-[0.9375rem] sm:!text-[1.0625rem]">
              <span className="sm:hidden">
                Keep scrolling to sweep the arc, then tap a card for its case study.
              </span>
              <span className="hidden sm:inline">
                Hover a card to flip it and click through to its case study. Keep
                scrolling to sweep the arc.
              </span>
            </p>
          </motion.div>

          {/* Cards */}
          <div className="relative flex h-full w-full items-center justify-center">
            {cards.map((card, i) => {
              let target: Target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

              if (introPhase === "scatter") {
                target = scatterPositions[i];
              } else if (introPhase === "line") {
                const lineSpacing = 70;
                const lineTotalWidth = total * lineSpacing;
                target = {
                  x: i * lineSpacing - lineTotalWidth / 2,
                  y: 0,
                  rotation: 0,
                  scale: 1,
                  opacity: 1,
                };
              } else {
                const isMobile = containerSize.width < 768;
                const layout = isMobile ? LAYOUT.mobile : LAYOUT.desktop;
                const minDimension = Math.min(containerSize.width, containerSize.height);

                // A. Circle position
                const circleRadius = Math.min(minDimension * layout.ring, 380);
                const circleAngle = (i / total) * 360;
                const circleRad = (circleAngle * Math.PI) / 180;
                const circlePos = {
                  x: Math.cos(circleRad) * circleRadius,
                  y:
                    Math.sin(circleRad) * circleRadius +
                    containerSize.height * layout.ringY,
                  rotation: circleAngle + 90,
                };

                // B. Bottom arc ("rainbow", convex up)
                const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5);
                const arcRadius = baseRadius * layout.radius;
                const arcApexY = containerSize.height * layout.apex;
                const arcCenterY = arcApexY + arcRadius;
                const spreadAngle = layout.spread;
                const startAngle = -90 - spreadAngle / 2;
                const step = spreadAngle / (total - 1);

                // Sweep. Stops short of the full spread so cards still occupy
                // both sides of the screen when the motion ends.
                const sweepProgress = Math.min(Math.max(sweep, 0), 1);
                const boundedRotation = -sweepProgress * layout.sweepArc;

                const currentArcAngle = startAngle + i * step + boundedRotation;
                const arcRad = (currentArcAngle * Math.PI) / 180;
                const arcPos = {
                  x: Math.cos(arcRad) * arcRadius + parallaxValue,
                  y: Math.sin(arcRad) * arcRadius + arcCenterY,
                  rotation: currentArcAngle + 90,
                  scale: layout.scale,
                };

                // C. Morph between the two
                target = {
                  x: lerp(circlePos.x, arcPos.x, morph),
                  y: lerp(circlePos.y, arcPos.y, morph),
                  rotation: lerp(circlePos.rotation, arcPos.rotation, morph),
                  scale: lerp(1, arcPos.scale, morph),
                  opacity: 1,
                };
              }

              return (
                <FlipCard
                  key={`${card.href}-${i}`}
                  card={card}
                  target={target}
                  instant={reduceMotion}
                />
              );
            })}
          </div>
        </div>

        {/* the apex card, named for touch where there is no hover to flip it */}
        <motion.div
          style={reduceMotion ? undefined : { opacity: contentOpacity }}
          className="pointer-events-none absolute inset-x-0 top-[68%] z-10 flex justify-center px-6 sm:hidden"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={apexCard.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: reduceMotion ? 0 : 0.28 }}
            >
              <Link
                href={apexCard.href}
                className="pointer-events-auto flex flex-col items-center gap-1.5 rounded-2xl px-4 py-2 text-center"
              >
                <span className="eyebrow">{apexCard.category}</span>
                <span className="font-display text-[1.5rem] uppercase leading-[1.05] text-label">
                  {apexCard.title}
                </span>
                <span className="flex items-center text-[0.8125rem] font-medium text-accent">
                  Read case study <ChevronRight size={14} strokeWidth={2.5} />
                </span>
              </Link>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* all projects, fading in once the sweep is well under way */}
        <motion.div
          style={reduceMotion ? undefined : { opacity: ctaOpacity, y: ctaY }}
          className="absolute inset-x-0 bottom-8 z-20 flex justify-center px-6 sm:bottom-10"
        >
          <Link
            href={allHref}
            tabIndex={ctaReady ? undefined : -1}
            aria-hidden={ctaReady ? undefined : true}
            className="btn-glass"
            style={{ pointerEvents: ctaReady ? "auto" : "none" }}
          >
            View all projects <ChevronRight size={16} className="-mr-1 text-label-2" />
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
