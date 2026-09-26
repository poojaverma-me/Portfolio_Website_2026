"use client";

import { useSyncExternalStore } from "react";
import type { IntroKind, IntroState } from "@/lib/intro";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-intro"],
  });
  return () => observer.disconnect();
}

function read(): IntroState {
  const value = document.documentElement.dataset.intro;
  return value === "skip" || value === "done" ? value : "play";
}

/** Current intro state; the server renders as "play". */
export function useIntro(): IntroState {
  return useSyncExternalStore(subscribe, read, () => "play" as IntroState);
}

/** True once the page underneath should run its own entrance animations. */
export function useIntroFinished() {
  return useIntro() !== "play";
}

function subscribeKind(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-intro-kind"],
  });
  return () => observer.disconnect();
}

function readKind(): IntroKind {
  return document.documentElement.dataset.introKind === "voyage" ? "voyage" : "hello";
}

/** Which intro this visit was dealt; null on the server, before the page knows. */
export function useIntroKind(): IntroKind | null {
  return useSyncExternalStore(subscribeKind, readKind, () => null);
}
