"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { INTRO_SESSION_KEY } from "@/lib/intro";
import { useIntro } from "@/lib/use-intro";

// One greeting per language, never repeated
const WORDS = [
  { text: "hello", lang: "en" },
  { text: "bonjour", lang: "fr" },
  { text: "こんにちは", lang: "ja" },
  { text: "hola", lang: "es" },
  { text: "ciao", lang: "it" },
  { text: "namaste", lang: "hi-Latn" },
];

const FIRST_HOLD = 1600; // ms the opening word is written and held
const STEP = 950; // ms per following word
const LAST_HOLD = 1200; // ms the closing "hello" stays before the reveal

const ease = [0.22, 1, 0.36, 1] as const;

export default function IntroHello() {
  const state = useIntro();
  const [index, setIndex] = useState(0);
  const timers = useRef<number[]>([]);

  const finish = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, "1");
    } catch {
      // storage blocked: the intro simply plays again next load
    }
    document.documentElement.dataset.intro = "done";
  }, []);

  useEffect(() => {
    if (state !== "play") return;

    let t = FIRST_HOLD;
    for (let i = 1; i < WORDS.length; i++) {
      timers.current.push(window.setTimeout(() => setIndex(i), t));
      t += STEP;
    }
    timers.current.push(window.setTimeout(finish, t - STEP + LAST_HOLD));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      window.removeEventListener("keydown", onKey);
    };
    // runs once for the initial state; finish() flips state to "done"
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const word = WORDS[index];

  return (
    <AnimatePresence>
      {state === "play" && (
        <motion.div
          key="intro"
          className="intro-overlay fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          exit={{ opacity: 0, filter: "blur(12px)", scale: 1.04 }}
          transition={{ duration: 0.9, ease }}
        >
          {/* drifting light behind the glass */}
          <div className="intro-light" aria-hidden>
            <span className="intro-blob intro-blob-a" />
            <span className="intro-blob intro-blob-b" />
            <span className="intro-blob intro-blob-c" />
          </div>

          <div className="relative grid place-items-center px-6" aria-hidden>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={index}
                lang={word.lang}
                className="col-start-1 row-start-1 block"
                // written on left to right, then dissolved as the next word starts
                initial={{ opacity: 0, clipPath: "inset(-30% 100% -30% -15%)", filter: "blur(4px)" }}
                animate={{
                  opacity: 1,
                  clipPath: "inset(-30% -15% -30% -15%)",
                  filter: "blur(0px)",
                  transition: { duration: 0.9, ease: [0.45, 0, 0.25, 1] },
                }}
                exit={{
                  opacity: 0,
                  filter: "blur(14px)",
                  scale: 1.04,
                  transition: { duration: 0.5, ease },
                }}
              >
                {/* stacked layers: edge light and shadow, then the see-through body */}
                <span className={`glass-text ${word.lang === "ja" ? "is-ja" : ""}`}>
                  <span className="glass-depth">{word.text}</span>
                  <span className="glass-body">{word.text}</span>
                </span>
              </motion.span>
            </AnimatePresence>
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
