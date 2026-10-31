"use client";

import { useEffect } from "react";

/** Things a right-click is still allowed on: links (open in a new tab, copy the address) and form fields. */
const ALLOW_MENU = "a[href], input, textarea, select, [contenteditable='true']";
/** Media that shouldn't be dragged out of the page. */
const NO_DRAG = "img, picture, video, canvas, svg";
/** Copies longer than this get a line saying where they came from. */
const CREDIT_AFTER = 160;

/**
 * Light deterrents against casual copying, in production only so development
 * keeps its tools. None of this stops a determined person (the page has to
 * reach the browser to be shown), and none of it gets in the way of reading:
 * text stays selectable and copyable, links keep their menu, keyboard
 * navigation, find, select-all and printing are untouched, and screen readers
 * see nothing different.
 */
export default function CopyGuard() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    const onMenu = (e: MouseEvent) => {
      const el = e.target as Element | null;
      if (el?.closest?.(ALLOW_MENU)) return;
      e.preventDefault();
    };

    // F12, the developer-tools chords on Windows/Linux (Ctrl+Shift+I/J/C) and
    // macOS (Cmd+Option+I/J/C), view source (Ctrl+U, Cmd+Option+U) and save page
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      const devtools = (mod && e.shiftKey && ["i", "j", "c"].includes(k)) || (e.metaKey && e.altKey && ["i", "j", "c", "u"].includes(k));
      const source = e.ctrlKey && !e.shiftKey && k === "u";
      const save = mod && !e.shiftKey && !e.altKey && k === "s";
      if (k === "f12" || devtools || source || save) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const onDrag = (e: DragEvent) => {
      if ((e.target as Element | null)?.closest?.(NO_DRAG)) e.preventDefault();
    };

    // a long copy keeps working, with a credit line and the page it came from
    const onCopy = (e: ClipboardEvent) => {
      const el = e.target as Element | null;
      if (el?.closest?.("input, textarea, [contenteditable='true']")) return;
      const text = window.getSelection()?.toString() ?? "";
      if (text.length < CREDIT_AFTER || !e.clipboardData) return;
      e.clipboardData.setData("text/plain", `${text}\n\nSource: Pooja Verma, ${location.origin}${location.pathname}`);
      e.preventDefault();
    };

    document.addEventListener("contextmenu", onMenu);
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("dragstart", onDrag);
    document.addEventListener("copy", onCopy);

    console.log(
      "%cPooja Verma%c\nThe code and content on this site are © Pooja Verma. Curious how something here was built? Ask me: pooja32verma@gmail.com",
      "font: 700 20px system-ui; color: #f96b0b",
      "font: 13px system-ui; color: inherit",
    );

    return () => {
      document.removeEventListener("contextmenu", onMenu);
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("dragstart", onDrag);
      document.removeEventListener("copy", onCopy);
    };
  }, []);

  return null;
}
