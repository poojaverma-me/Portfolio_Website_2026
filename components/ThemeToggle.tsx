"use client";

import { Moon, Sun } from "lucide-react";
import type { Theme } from "@/lib/theme";
import { useTheme } from "@/lib/use-theme";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full text-label transition-colors hover:bg-fill ${className}`}
    >
      <Sun
        size={18}
        className={`absolute transition-all duration-300 ${
          theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"
        }`}
      />
      <Moon
        size={17}
        className={`absolute transition-all duration-300 ${
          theme === "light" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-50 opacity-0"
        }`}
      />
    </button>
  );
}
