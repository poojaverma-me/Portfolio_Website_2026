"use client";

import { useEffect, useRef, useState } from "react";

const INTERACTIVE = 'a[href], button, [role="button"], [role="tab"], select, summary, label';

/**
 * The soft ember light that follows the pointer. The pointer itself is the
 * system cursor, redrawn as an ember arrow in globals.css, so it never lags;
 * this only adds the glow, which brightens over things you can use.
 * Position is written straight from pointermove. Mouse and trackpad only.
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

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      el.style.opacity = "1";
      el.classList.toggle("is-locked", !!(e.target as Element | null)?.closest?.(INTERACTIVE));
    };
    const hide = () => {
      el.style.opacity = "0";
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={root} aria-hidden className="cursor-fx">
      <span className="cursor-glow" />
    </div>
  );
}
