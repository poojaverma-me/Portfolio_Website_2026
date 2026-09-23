"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { profile } from "@/lib/profile";
import ShinyButton from "@/components/ui/shiny-button";

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/#experience", label: "Experience" },
  { href: "/#research", label: "Research" },
];

// Shiny "Get in touch" call to action, coloured by the accent. It scrolls to
// the contact card, where the address and the profile links live.
const getInTouch = {
  label: "Get in touch",
  fillColor: "#0b0806",
  labelColor: "#ffffff",
  accentColor: "var(--color-accent)",
  accentSoftColor: "var(--color-accent-hover)",
  cornerRadius: 999,
};

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/#")) return false;
  return pathname.startsWith(href);
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const pathname = usePathname();

  const highlighted = hovered ?? links.find((l) => isActive(pathname, l.href))?.href;
  // a bare hash scrolls in place; from another route it has to carry the path
  const contactHref = pathname === "/" ? "#contact" : "/#contact";

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3">
      {/* unified toolbar */}
      <nav className="glass mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 rounded-full pl-2 pr-2">
        <Link
          href="/"
          className="flex items-center rounded-full py-1 pl-4 pr-3"
          aria-label="Pooja Verma, home"
        >
          <span className="font-display text-[0.9375rem] uppercase tracking-wider">
            {profile.name}
          </span>
        </Link>

        <div
          className="hidden md:flex items-center"
          onMouseLeave={() => setHovered(null)}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onMouseEnter={() => setHovered(l.href)}
              className={`relative rounded-full px-3.5 py-1.5 text-[0.875rem] transition-colors ${
                isActive(pathname, l.href) ? "text-label" : "text-label-2 hover:text-label"
              }`}
            >
              {highlighted === l.href && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-fill-2"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{l.label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {/* wrapper owns visibility: the button's scoped styles set its display */}
          <span className="hidden sm:inline-flex">
            <ShinyButton {...getInTouch} href={contactHref} size="sm" />
          </span>
          <button
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-full text-label hover:bg-fill"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.18 }}
          className="glass md:hidden mx-auto mt-2 max-w-3xl rounded-[22px] p-2"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-[1.0625rem] text-label hover:bg-fill"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2">
            <ShinyButton
              {...getInTouch}
              href={contactHref}
              onClick={() => setOpen(false)}
              size="md"
              className="w-full"
            />
          </div>
        </motion.div>
      )}
    </header>
  );
}
