"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import dynamic from "next/dynamic";
import type DottedSurface from "@/components/ui/dotted-surface";

/**
 * three.js is the heaviest dependency on the site and it only draws the wave in
 * the footer, so it is fetched when the footer comes within a screen of the
 * viewport rather than in the bundle that loads the page.
 */
const Surface = dynamic(() => import("@/components/ui/dotted-surface"), {
  ssr: false,
});

export default function DottedSurfaceLazy(
  props: ComponentProps<typeof DottedSurface>,
) {
  const mark = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = mark.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (near) return <Surface {...props} />;
  return <div ref={mark} aria-hidden className="absolute inset-0" />;
}
