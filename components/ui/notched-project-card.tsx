"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * NotchedProjectCard
 *
 * A card whose cover has a rounded notch bitten out of its bottom-right
 * corner, with the "open" arrow nested inside it. The cut is concentric with
 * the arrow disc, and filleted where it meets the cover's edges, so the cover
 * curves into it instead of ending on a point.
 *
 * The notch is drawn by three layers painted in the colour of the surface
 * BEHIND the card (`surface`, the page's black by default). Put the card on a
 * different background and pass that colour, or the notch shows.
 *
 * Adapted from a shadcn-style component to this site's tokens: graphite
 * surfaces, label colours, mono tokens and the ember accent. Without an
 * `href` the card is not a link, and the disc shows `icon` instead of the
 * arrow.
 *
 * Optional extras:
 * - `screen`: a product screen layered over the cover photo. The photo holds
 *   still and the screen grows on hover, so the card gains depth instead of
 *   just zooming.
 * - `monochrome`: the cover sits in black and white and takes its colours
 *   back on hover or keyboard focus.
 */

export interface NotchedProjectCardProps {
  href?: string;
  title: string;
  description?: string;
  /** cover photograph */
  image: string;
  imageAlt?: string;
  /** a pill at the top of the cover, e.g. the year */
  badge?: string;
  tags?: string[];
  /** a product screen over the photo */
  screen?: { src: string; alt: string; className?: string };
  /** a dark wash between the photo and the screen, 0 to 1 */
  dim?: number;
  monochrome?: boolean;
  /** the colour behind the card; the notch is painted in it */
  surface?: string;
  /** what the disc shows when the card isn't a link */
  icon?: React.ReactNode;
  /** small print under the tags, e.g. the formal title and venue */
  footnote?: React.ReactNode;
  /** smaller type and notch, for three cards to a row */
  compact?: boolean;
  /** the heading level for the title */
  as?: "h2" | "h3";
  className?: string;
}

// the arrow disc, the notch block around it (radius = BLOCK - DISC / 2) and
// the fillet where the cut meets the cover's edges, px
const SIZES = {
  regular: { DISC: 64, BLOCK: 80, FILLET: 28 },
  compact: { DISC: 52, BLOCK: 66, FILLET: 22 },
};

export function NotchedProjectCard({
  href,
  title,
  description,
  image,
  imageAlt = "",
  badge,
  tags = [],
  screen,
  dim = screen ? 0.45 : 0,
  monochrome = false,
  surface = "var(--color-base)",
  icon,
  footnote,
  compact = false,
  as: Heading = "h3",
  className,
}: NotchedProjectCardProps) {
  const { DISC, BLOCK, FILLET } = SIZES[compact ? "compact" : "regular"];
  const tone = monochrome
    ? "grayscale transition-[filter,scale] duration-500 group-hover:grayscale-0 group-focus-visible:grayscale-0"
    : "transition-[scale] duration-500";

  const body = (
    <>
      <div className="relative">
        {/* the cover */}
        <div className={cn("relative aspect-[4/3] overflow-hidden bg-surface", compact ? "rounded-[22px]" : "rounded-[28px]")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={screen ? "" : imageAlt}
            loading="lazy"
            decoding="async"
            className={cn(
              "absolute inset-0 h-full w-full object-cover",
              tone,
              !screen && "group-hover:scale-[1.04]",
            )}
          />
          {dim > 0 && (
            <div aria-hidden className="absolute inset-0" style={{ backgroundColor: `rgb(0 0 0 / ${dim})` }} />
          )}
          {screen && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={screen.src}
              alt={screen.alt}
              loading="lazy"
              decoding="async"
              className={cn(
                "absolute bottom-0 right-0 w-[82%] origin-bottom-right drop-shadow-[0_18px_40px_rgba(0,0,0,0.5)] group-hover:scale-[1.07]",
                tone,
                screen.className,
              )}
            />
          )}
          {badge && (
            <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center pt-4">
              <span className="rounded-full border border-white/40 bg-black/30 px-2.5 py-1 font-mono text-[11px] font-medium text-white backdrop-blur-md">
                {badge}
              </span>
            </div>
          )}
        </div>

        {/* the notch: a block with a concave corner, and a fillet at each
            end where the cut meets the cover's right and bottom edges */}
        <div
          aria-hidden
          className="absolute bottom-0 right-0"
          style={{ width: BLOCK, height: BLOCK, borderTopLeftRadius: BLOCK - DISC / 2, background: surface }}
        />
        {[
          { bottom: BLOCK, right: 0 },
          { bottom: 0, right: BLOCK },
        ].map((pos, i) => (
          <div
            key={i}
            aria-hidden
            className="absolute"
            style={{
              ...pos,
              width: FILLET,
              height: FILLET,
              background: `radial-gradient(circle at top left, transparent ${FILLET - 0.5}px, ${surface} ${FILLET}px)`,
            }}
          />
        ))}

        {/* the arrow (or icon), nested in the notch */}
        <span
          aria-hidden
          className={cn(
            "absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-surface-2 text-label shadow-[inset_0_1px_0_rgb(255_255_255/0.14)] transition-[background-color,color,scale] duration-300",
            href && "group-hover:scale-105 group-hover:bg-accent group-hover:text-[var(--on-accent)]",
          )}
          style={{ width: DISC, height: DISC }}
        >
          {href ? (
            <ArrowUpRight className="size-[18px] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          ) : (
            icon
          )}
        </span>
      </div>

      <Heading
        className={cn(
          "font-semibold leading-snug tracking-[-0.01em] text-label transition-colors group-hover:text-white",
          compact ? "mt-4 text-[1.125rem]" : "mt-5 text-[clamp(1.25rem,2vw,1.5rem)]",
        )}
      >
        {title}
      </Heading>
      {description && (
        <p className={cn("mt-2 self-start leading-[1.6] text-label-2", compact ? "text-[0.875rem]" : "text-[0.9375rem]")}>
          {description}
        </p>
      )}
      {tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap content-start gap-1.5">
          {tags.map((t, i) => (
            <li key={`${t}-${i}`} className="token">
              {t}
            </li>
          ))}
        </ul>
      )}
      {footnote}
    </>
  );

  const shell = cn(
    "group flex flex-col rounded-[28px] outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-base",
    className,
  );

  if (!href) return <div className={shell}>{body}</div>;
  const external = href.startsWith("http");
  return (
    <Link
      href={href}
      className={shell}
      {...(external && { target: "_blank", rel: "noreferrer" })}
    >
      {body}
    </Link>
  );
}

export default NotchedProjectCard;
