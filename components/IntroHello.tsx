"use client";

import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { INTRO_SESSION_KEY } from "@/lib/intro";
import { useIntro } from "@/lib/use-intro";

const WRITE = 2.0; // seconds to write "hello"
const HOLD = 1.1; // seconds the finished word stays before the reveal
const LEAD_IN = 0.35; // seconds of quiet before the first stroke

const ease = [0.22, 1, 0.36, 1] as const;

export default function IntroHello() {
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
    const timer = window.setTimeout(finish, (LEAD_IN + WRITE + HOLD) * 1000);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
    // runs once for the initial state; finish() flips state to "done"
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {state === "play" && (
        <motion.div
          key="intro"
          className="intro-overlay fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          exit={{ opacity: 0, filter: "blur(12px)", scale: 1.04 }}
          transition={{ duration: 0.9, ease }}
        >
          {/* soft drifting light */}
          <div className="intro-light" aria-hidden>
            <span className="intro-blob intro-blob-a" />
            <span className="intro-blob intro-blob-b" />
            <span className="intro-blob intro-blob-c" />
          </div>

          <div className="relative px-6" aria-hidden>
            <motion.span
              className="hello-text"
              // ink appears behind a soft edge that travels left to right
              initial={{ "--reveal": "-12%" } as Record<string, string>}
              animate={{ "--reveal": "112%" } as Record<string, string>}
              transition={{ delay: LEAD_IN, duration: WRITE, ease: [0.33, 0.1, 0.45, 1] }}
            >
              hello
            </motion.span>
          </div>

          <p className="sr-only" role="status">
            Loading Pooja Verma&apos;s portfolio
          </p>

          <button
            type="button"
            onClick={finish}
            className="btn-glass btn-sm absolute bottom-6 right-6 !text-[0.8125rem]"
          >
            Skip intro
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
