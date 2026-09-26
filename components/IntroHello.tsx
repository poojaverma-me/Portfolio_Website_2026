"use client";

import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useIntro } from "@/lib/use-intro";

const WRITE = 2.6; // seconds to write "hello"
const HOLD = 1.1; // seconds the finished word stays before the reveal
const LEAD_IN = 0.35; // seconds of quiet before the first stroke

const ease = [0.22, 1, 0.36, 1] as const;

// "hello" as one continuous pen stroke, written the way Apple's Mac greeting is:
// lead-in, h loop and hump, e, two l loops, o, and a closing flick.
const HELLO_PATH = [
  "M22 190",
  "C60 178 112 120 124 70",
  "C132 38 124 16 108 20",
  "C94 24 90 60 90 100",
  "L86 198",
  "C94 160 114 124 140 124",
  "C166 124 168 152 166 176",
  "C165 192 172 200 188 196",
  "C210 190 238 170 247 150",
  "C254 134 246 120 230 122",
  "C210 125 203 152 208 176",
  "C214 198 242 202 264 190",
  "C290 174 318 110 320 62",
  "C322 30 306 20 296 36",
  "C286 52 285 120 289 170",
  "C292 196 308 202 324 194",
  "C350 178 376 110 378 62",
  "C380 30 364 20 354 36",
  "C344 52 343 120 347 170",
  "C350 196 366 202 382 194",
  "C396 186 404 134 440 130",
  "C474 127 478 196 442 200",
  "C406 204 402 150 432 134",
  "C448 126 470 132 492 126",
].join(" ");

export default function IntroHello() {
  const state = useIntro();

  const finish = useCallback(() => {
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

          <svg className="hello-stroke relative" viewBox="0 0 520 240" aria-hidden>
            <motion.path
              d={HELLO_PATH}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                delay: LEAD_IN,
                pathLength: { delay: LEAD_IN, duration: WRITE, ease: [0.45, 0.05, 0.4, 1] },
                opacity: { delay: LEAD_IN, duration: 0.05 },
              }}
            />
          </svg>

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
