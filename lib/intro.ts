/** "play" while an intro runs, "skip" when it should not show, "done" after it ends. */
export type IntroState = "play" | "skip" | "done";
/** Which intro a visit gets: the handwritten hello or the rowboat voyage. */
export type IntroKind = "hello" | "voyage";

/**
 * Runs in <head> before first paint. Every load, a reload included, is dealt
 * one of the two intros at random (?intro=hello or ?intro=voyage picks one on
 * purpose). Visitors who prefer reduced motion never get one.
 */
export const introScript = `(function(){try{var d=document.documentElement;var q=new URLSearchParams(location.search).get("intro");d.setAttribute("data-intro-kind",q==="hello"||q==="voyage"?q:Math.random()<0.5?"hello":"voyage");if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)d.setAttribute("data-intro","skip")}catch(e){}})()`;
