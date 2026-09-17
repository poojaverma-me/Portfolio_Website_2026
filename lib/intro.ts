/** "play" while the hello intro runs, "skip" when it should not show, "done" after it ends. */
export type IntroState = "play" | "skip" | "done";
export const INTRO_SESSION_KEY = "intro-seen";

/**
 * Runs in <head> before first paint. The intro shows once per browser session
 * and never for visitors who prefer reduced motion.
 */
export const introScript = `(function(){try{var d=document.documentElement;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||sessionStorage.getItem("${INTRO_SESSION_KEY}"))d.setAttribute("data-intro","skip")}catch(e){}})()`;
