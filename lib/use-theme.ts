"use client";

import { useCallback, useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/**
 * Same shape as next-themes' useTheme, backed by the site's own
 * data-theme attribute (set before paint by themeScript in lib/theme.ts).
 */
export function useTheme() {
  // server snapshot is the default; React swaps in the real value after hydration
  const theme = useSyncExternalStore(subscribe, readTheme, () => "dark" as Theme);

  const setTheme = useCallback((next: Theme) => {
    const apply = () => {
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // storage blocked: the switch still works for this visit
      }
    };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // crossfade the whole page where the browser supports view transitions
    if (!reduceMotion && "startViewTransition" in document) {
      // a skipped transition (hidden tab, rapid clicks) still applies the theme;
      // swallow its rejected promises so they don't surface as console errors
      const transition = document.startViewTransition(apply);
      transition.ready.catch(() => {});
      transition.updateCallbackDone.catch(() => {});
    } else {
      apply();
    }
  }, []);

  return { theme, setTheme };
}
