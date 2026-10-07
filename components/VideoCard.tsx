import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import type { Video } from "@/lib/videos";

/** A video in the YouTube section: the click-to-play player, then its write-up. */
export default function VideoCard({ v }: { v: Video }) {
  return (
    <article className="glass-card group flex h-full flex-col overflow-hidden">
      <VideoPlayer id={v.id} title={v.title} duration={v.duration} />
      <div className="flex flex-1 flex-col p-5">
        {v.date && <p className="footnote">{v.date}</p>}
        <h3 className="headline mt-1 !text-[1.0625rem]">{v.title}</h3>
        <p className="mt-1.5 flex-1 text-[0.9375rem] leading-[1.5] text-label-2">{v.description}</p>
        {v.project && (
          <Link href={`/projects/${v.project}`} className="link-accent mt-3 self-start text-[0.875rem]">
            Read the case study <ArrowUpRight size={14} />
          </Link>
        )}
      </div>
    </article>
  );
}
