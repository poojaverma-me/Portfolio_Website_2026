/** "play" while an intro runs, "skip" when it should not show, "done" after it ends. */
export type IntroState = "play" | "skip" | "done";
/** Which intro a visit gets: the handwritten hello or the rowboat voyage. */
export type IntroKind = "hello" | "voyage";
export const INTRO_SESSION_KEY = "intro-seen";

/**
 * Runs in <head> before first paint. Each visit is dealt one of the two
 * intros at random (?intro=hello or ?intro=voyage picks one on purpose). The
 * intro shows once per browser session and never for visitors who prefer
 * reduced motion.
 */
export const introScript = `(function(){try{var d=document.documentElement;var q=new URLSearchParams(location.search).get("intro");d.setAttribute("data-intro-kind",q==="hello"||q==="voyage"?q:Math.random()<0.5?"hello":"voyage");if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||sessionStorage.getItem("${INTRO_SESSION_KEY}"))d.setAttribute("data-intro","skip")}catch(e){}})()`;
