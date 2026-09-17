export type Theme = "dark" | "light";
export const THEME_STORAGE_KEY = "theme";

/**
 * Runs in <head> before first paint so a saved choice never flashes the
 * default theme. Dark is the default when nothing is saved.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
