"use client";

import { useEffect, useRef } from "react";
import { profile } from "@/lib/profile";

/**
 * Apple-style opening title. The whole sequence is CSS (see .intro in
 * globals.css) so it starts on first paint; this component only handles
 * skipping and cleanup.
 */
export default function Intro() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const overlay = ref.current;
    if (!overlay || root.dataset.intro === "skip") return;

    const finish = () => {
      root.dataset.intro = "done";
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    const onEnd = (e: AnimationEvent) => {
      if (e.target === overlay && e.animationName === "intro-stage-out") finish();
    };

    overlay.addEventListener("click", finish);
    overlay.addEventListener("animationend", onEnd);
    window.addEventListener("keydown", onKey);
    return () => {
      overlay.removeEventListener("click", finish);
      overlay.removeEventListener("animationend", onEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const name = profile.name.toUpperCase();

  return (
    <div ref={ref} className="intro" aria-hidden>
      <div className="intro-glow" />
      <div className="intro-stage">
        <p className="intro-name">
          {Array.from(name).map((ch, i) =>
            ch === " " ? (
              <span key={i} className="intro-space" />
            ) : (
              <span key={i} className="intro-char" style={{ ["--i" as string]: i }}>
                {ch}
              </span>
            ),
          )}
        </p>
        <span className="intro-line" />
        <p className="intro-sub">
          <span>Computing Science</span>
          <span className="intro-sep"> · </span>
          <span>{profile.school}</span>
        </p>
      </div>
    </div>
  );
}
