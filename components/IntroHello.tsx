"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { INTRO_SESSION_KEY } from "@/lib/intro";
import { useIntro } from "@/lib/use-intro";
import { createPencilSound, type PencilSound } from "@/lib/pencil-sound";

const WRITE = 2.0; // seconds to write "hello", the pencil sound runs for the same time
const HOLD = 1.1; // seconds the finished word stays before the reveal
const LEAD_IN = 0.35; // seconds of quiet before the pencil touches the paper

const ease = [0.22, 1, 0.36, 1] as const;

export default function IntroHello() {
  const state = useIntro();
  // bumping the take restarts the writing (used when sound is unlocked by a tap)
  const [take, setTake] = useState(0);
  const [soundBlocked, setSoundBlocked] = useState(false);
  const sound = useRef<PencilSound | null>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const finish = useCallback(() => {
    clearTimers();
    sound.current?.close();
    sound.current = null;
    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, "1");
    } catch {
      // storage blocked: the intro simply plays again next load
    }
    document.documentElement.dataset.intro = "done";
  }, []);

  /** Write "hello" from the start, with the pencil sound if audio is allowed. */
  const write = useCallback(
    (withSound: boolean) => {
      clearTimers();
      setTake((n) => n + 1);
      if (withSound) {
        timers.current.push(
          window.setTimeout(() => sound.current?.play(WRITE), LEAD_IN * 1000),
        );
      }
      timers.current.push(window.setTimeout(finish, (LEAD_IN + WRITE + HOLD) * 1000));
    },
    [finish],
  );

  useEffect(() => {
    if (state !== "play") return;

    sound.current = createPencilSound();
    let cancelled = false;
    (async () => {
      const allowed = (await sound.current?.unlock()) ?? false;
      if (cancelled) return;
      if (!allowed && sound.current) setSoundBlocked(true);
      write(allowed);
    })();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelled = true;
      clearTimers();
      window.removeEventListener("keydown", onKey);
    };
    // runs once for the initial state; finish() flips state to "done"
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enableSound = async () => {
    if (!(await sound.current?.unlock())) return;
    setSoundBlocked(false);
    write(true); // replay from the first stroke so sound and ink stay in sync
  };

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
            {take > 0 && (
              <motion.span
                key={take}
                className="hello-text"
                // ink appears behind a soft edge that travels left to right
                initial={{ "--reveal": "-12%" } as Record<string, string>}
                animate={{ "--reveal": "112%" } as Record<string, string>}
                transition={{ delay: LEAD_IN, duration: WRITE, ease: [0.33, 0.1, 0.45, 1] }}
              >
                hello
              </motion.span>
            )}
          </div>

          <p className="sr-only" role="status">
            Loading Pooja Verma&apos;s portfolio
          </p>

          {soundBlocked && (
            <button
              type="button"
              onClick={enableSound}
              className="btn-glass btn-sm absolute bottom-6 left-6 !text-[0.8125rem]"
            >
              <Volume2 size={14} /> Tap for sound
            </button>
          )}
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
