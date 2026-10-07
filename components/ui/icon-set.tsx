"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

/** One tile in the grid. */
export interface IconGridItem {
  id: string;
  /** an SVG component or image */
  icon: React.ReactNode;
  /** the service's name, used for accessibility */
  name: string;
  /** where the tile goes; without it the tile is not a link */
  href?: string;
  /** a short label under the icon, such as a username */
  label?: string;
}

export interface IconGridProps {
  items: IconGridItem[];
  className?: string;
}

// the container staggers its children in
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

/** Lets a handle wrap between words: before capitals and after hyphens. */
function breakable(label: string) {
  return label.split(/(?<=-)|(?=[A-Z])/).map((part, i) => (
    <React.Fragment key={i}>
      {i > 0 && <wbr />}
      {part}
    </React.Fragment>
  ));
}

// each tile rises in on a spring
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 12 } },
};

/**
 * A grid of icon tiles that animate in, one after another, the first time
 * the grid scrolls into view. Adapted from a shadcn-style component to this
 * site's tokens: graphite glass tiles, label colours and the ember accent on
 * hover. Tiles with an href are links that open in a new tab.
 */
const IconGrid = React.forwardRef<HTMLDivElement, IconGridProps>(({ items, className }, ref) => {
  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className={cn("grid grid-cols-3 gap-y-4 text-center sm:flex sm:flex-wrap sm:gap-x-2", className)}
    >
      {items.map((item) => {
        const tile = (
          <>
            <div className="glass-card flex h-12 w-12 items-center justify-center !rounded-[14px] transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.3),inset_0_0_0_1px_rgb(249_107_11/0.45),0_10px_24px_var(--shadow)]">
              {item.icon}
            </div>
            {item.label && (
              <span className="mt-1.5 block max-w-full font-mono text-[0.625rem] [overflow-wrap:anywhere] sm:text-[0.6875rem] leading-snug text-label-2 transition-colors group-hover:text-label">
                {breakable(item.label)}
              </span>
            )}
          </>
        );
        return (
          <motion.div key={item.id} variants={itemVariants} className="group relative flex min-w-0 flex-col items-center sm:w-[104px]">
            {item.href ? (
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.label ? `${item.name}: ${item.label}` : item.name}
                className="flex w-full flex-col items-center rounded-[14px]"
              >
                {tile}
              </a>
            ) : (
              <div aria-label={item.name} className="flex w-full flex-col items-center">
                {tile}
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
});

IconGrid.displayName = "IconGrid";

export { IconGrid };
