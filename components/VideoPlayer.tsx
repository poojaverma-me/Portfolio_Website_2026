"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/**
 * A YouTube video as a thumbnail until it's clicked; only then does the
 * player load (from the privacy-enhanced domain), so the page stays light.
 * `hd` asks for the 1280px thumbnail, for players shown large.
 */
export default function VideoPlayer({
  id,
  title,
  duration,
  hd,
  className = "",
}: {
  id: string;
  title: string;
  duration?: string;
  hd?: boolean;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className={`group/player relative aspect-video w-full bg-surface ${className}`}>
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="absolute inset-0 h-full w-full overflow-hidden"
          aria-label={`Play: ${title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${id}/${hd ? "maxresdefault" : "hqdefault"}.jpg`}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover/player:scale-[1.03]"
          />
          {duration && (
            <span className="absolute bottom-2.5 right-2.5 z-10 rounded-md bg-black/75 px-1.5 py-0.5 font-mono text-[0.6875rem] text-white tabular-nums">
              {duration}
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover/player:bg-black/10">
            <span
              className={`flex items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform duration-300 group-hover/player:scale-105 ${
                hd ? "h-16 w-16 sm:h-20 sm:w-20" : "h-14 w-14"
              }`}
            >
              <Play size={hd ? 26 : 22} fill="currentColor" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
