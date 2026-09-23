"use client";

import { useEffect, useRef, useState } from "react";

const INTERACTIVE = 'a[href], button, [role="button"], input, textarea, select, summary';

/**
 * The pointer, rebuilt: a soft ember, a thin reticle and a crosshair that
 * locks on when you are over something you can use. Position is written
 * straight from the pointermove event, so it never trails the cursor.
 * Mouse and trackpad only.
 */
export default function CursorGlow() {
  const root = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const sync = () => setEnabled(fine.matches);
    sync();
    fine.addEventListener("change", sync);
    return () => fine.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = root.current;
    if (!el) return;
    document.documentElement.classList.add("has-custom-cursor");

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      el.style.opacity = "1";
      const target = e.target as Element | null;
      el.classList.toggle("is-locked", !!target?.closest?.(INTERACTIVE));
    };
    const hide = () => {
      el.style.opacity = "0";
    };
    const press = (down: boolean) => () => el.classList.toggle("is-down", down);
    const onDown = press(true);
    const onUp = press(false);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);
    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={root} aria-hidden className="cursor-fx">
      <span className="cursor-glow" />
      <span className="cursor-ring" />
      <span className="cursor-tick cursor-tick-n" />
      <span className="cursor-tick cursor-tick-s" />
      <span className="cursor-tick cursor-tick-w" />
      <span className="cursor-tick cursor-tick-e" />
      <span className="cursor-dot" />
    </div>
  );
}
