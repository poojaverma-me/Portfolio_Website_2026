"use client";

import IntroHello from "@/components/IntroHello";
import IntroVoyage from "@/components/voyage/IntroVoyage";
import { useIntro, useIntroKind } from "@/lib/use-intro";

/** Hands the page to a device that can't run the voyage: it gets the hello instead. */
function fallBackToHello() {
  document.documentElement.dataset.introKind = "hello";
}

/**
 * Plays whichever intro this visit was dealt (see lib/intro.ts). Until the
 * page knows, a plain black cover keeps the site hidden, so neither intro
 * starts with a flash of the page behind it.
 */
export default function IntroPicker() {
  const kind = useIntroKind();
  const state = useIntro();
  if (kind === null) {
    return state === "play" ? <div className="intro-overlay fixed inset-0 z-[100]" aria-hidden /> : null;
  }
  return kind === "voyage" ? <IntroVoyage onUnsupported={fallBackToHello} /> : <IntroHello />;
}
