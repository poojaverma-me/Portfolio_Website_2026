"use client";

import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { INTRO_SESSION_KEY } from "@/lib/intro";
import { useIntro } from "@/lib/use-intro";
import Boat from "./Boat";
import { startVoyage } from "./engine";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Opening scene: a rower crosses the screen from the bottom left corner to the
 * top right, and the sea opens up behind the boat, whales and all. Plays once
 * per session, and never for visitors who prefer reduced motion (see
 * lib/intro.ts).
 */
export default function IntroVoyage() {
  const state = useIntro();

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, "1");
    } catch {
      // storage blocked: the intro simply plays again next load
    }
    document.documentElement.dataset.intro = "done";
  }, []);

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
          exit={{ opacity: 0, scale: 1.03, filter: "blur(10px)" }}
          transition={{ duration: 0.9, ease }}
        >
          <Scene onDone={finish} />

          <p className="sr-only" role="status">
            Loading Pooja Verma&apos;s portfolio
          </p>

          <button
            type="button"
            onClick={finish}
            className="btn-glass btn-sm absolute bottom-6 right-6 z-10 !text-[0.8125rem]"
          >
            Skip intro
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Owns the canvases, so the render loop stops when the overlay unmounts. */
function Scene({ onDone }: { onDone: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const boat = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!host.current || !boat.current) return;
    let freezeAt: number | null = null;
    if (process.env.NODE_ENV !== "production") {
      const t = new URLSearchParams(window.location.search).get("intro-t");
      if (t !== null && !Number.isNaN(Number(t))) freezeAt = Number(t);
    }
    return startVoyage({ host: host.current, boat: boat.current, onDone, freezeAt });
  }, [onDone]);

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
