"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useIntro } from "@/lib/use-intro";
import Boat from "./Boat";
import { startVoyage } from "./engine";
import { seeded } from "./geometry";

const ease = [0.22, 1, 0.36, 1] as const;
/** seconds for the torn halves to clear the screen */
const TEAR_S = 1.15;

/**
 * Opening scene: a rower crosses the screen from the bottom left corner and
 * rows out of the top right, the sea opening up behind the boat. The camera
 * then dives into the dark body of the whale in the middle, and that black is
 * torn in two to reveal the page. Plays on every load, and never for visitors
 * who prefer reduced motion (see lib/intro.ts).
 */
export default function IntroVoyage({ onUnsupported }: { onUnsupported?: () => void }) {
  const state = useIntro();
  const [torn, setTorn] = useState(false);

  const finish = useCallback(() => {
    document.documentElement.dataset.intro = "done";
  }, []);
  const onBlack = useCallback(() => setTorn(true), []);

  // the halves go up first, then the page starts its entrance underneath them
  useEffect(() => {
    if (!torn) return;
    const id = window.setTimeout(finish, 40);
    return () => clearTimeout(id);
  }, [torn, finish]);

  useEffect(() => {
    if (state !== "play") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // bound once for the initial state; finish() flips it to "done"
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {state === "play" && (
        <motion.div
          key="intro"
          className="intro-overlay fixed inset-0 z-[100] overflow-hidden"
          style={torn ? { background: "transparent" } : undefined}
          exit={
            torn
              ? { opacity: 0, transition: { duration: 0.2, delay: TEAR_S } }
              : { opacity: 0, scale: 1.03, filter: "blur(10px)", transition: { duration: 0.7, ease } }
          }
        >
          {torn ? (
            <Tear />
          ) : (
            <Scene onDone={finish} onBlack={onBlack} onUnsupported={onUnsupported} />
          )}

          <p className="sr-only" role="status">
            Loading Pooja Verma&apos;s portfolio
          </p>

          {!torn && (
            <button
              type="button"
              onClick={finish}
              className="btn-glass btn-sm absolute bottom-6 right-6 z-10 !text-[0.8125rem]"
            >
              Skip intro
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Owns the canvas, so the render loop stops when the scene unmounts. */
function Scene({
  onDone,
  onBlack,
  onUnsupported,
}: {
  onDone: () => void;
  onBlack: () => void;
  onUnsupported?: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const boat = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!host.current || !boat.current) return;
    let freezeAt: number | null = null;
    if (process.env.NODE_ENV !== "production") {
      const t = new URLSearchParams(window.location.search).get("intro-t");
      if (t !== null && !Number.isNaN(Number(t))) freezeAt = Number(t);
    }
    return startVoyage({ host: host.current, boat: boat.current, onDone, onBlack, onUnsupported, freezeAt });
  }, [onDone, onBlack, onUnsupported]);

  return (
    <div ref={host} className="absolute inset-0" aria-hidden>
      <div
        ref={boat}
        className="pointer-events-none absolute left-0 top-0 will-change-transform"
        style={{ transform: "translate3d(-200vw, 0, 0)" }}
      >
        <Boat />
      </div>
    </div>
  );
}

/**
 * One ragged rip from top to bottom, leaning a little like a real tear: a
 * wandering line with fine jagged fibres on it. Both halves are cut from the
 * same line, so they fit exactly until they part.
 */
function tearLine(shift: number) {
  const rand = seeded(47);
  const n = 36;
  let drift = 0;
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    drift = (drift + (rand() - 0.5) * 1.8) * 0.82;
    const fibre = (rand() - 0.5) * 1.1;
    const x = 53.5 - 7 * (i / n) + drift + fibre + shift;
    const y = i === 0 ? -2 : i === n ? 102 : (i / n) * 100;
    pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
  }
  return pts.join(", ");
}

function half(side: "left" | "right", shift: number) {
  const line = tearLine(shift);
  return side === "left"
    ? `polygon(-10% -10%, ${line}, -10% 110%)`
    : `polygon(110% -10%, ${line}, 110% 110%)`;
}

const HALVES = {
  left: { body: half("left", 0), edge: half("left", 0.35) },
  right: { body: half("right", 0), edge: half("right", -0.35) },
};

/**
 * The black the camera dived into, torn in two. The halves strain apart for a
 * beat, showing a sliver of the page along the rip, then pull away and swing
 * off the edges. The torn edge catches the ember light.
 */
function Tear() {
  return (
    <div className="absolute inset-0" aria-hidden>
      {(["left", "right"] as const).map((side) => {
        const left = side === "left";
        return (
          <motion.div
            key={side}
            className="absolute inset-0"
            style={{
              transformOrigin: left ? "0% 100%" : "100% 0%",
              filter: "drop-shadow(0 0 16px rgb(249 107 11 / 0.35))",
              willChange: "transform",
            }}
            initial={{ x: "0vw", rotate: 0 }}
            animate={{
              x: left ? ["0vw", "-0.8vw", "-80vw"] : ["0vw", "0.8vw", "80vw"],
              rotate: left ? [0, -0.5, -8] : [0, 0.5, 8],
            }}
            transition={{ duration: TEAR_S, times: [0, 0.16, 1], ease: [0.6, 0, 0.3, 1] }}
          >
            <div
              className="absolute inset-0"
              style={{ background: "rgb(249 107 11 / 0.6)", clipPath: HALVES[side].edge }}
            />
            <div
              className="absolute inset-0"
              style={{ background: "var(--color-base)", clipPath: HALVES[side].body }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
