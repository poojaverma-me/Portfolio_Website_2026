import { Images } from "lucide-react";

export default function ScreenshotPlaceholder({
  caption,
  aspect = "video",
  className = "",
}: {
  caption?: string;
  aspect?: "video" | "wide" | "tall";
  className?: string;
}) {
  const ratio =
    aspect === "wide"
      ? "aspect-[21/9]"
      : aspect === "tall"
        ? "aspect-[3/4]"
        : "aspect-video";

  return (
    <figure
      className={`overflow-hidden rounded-[14px] bg-surface shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08),0_0_0_1px_var(--edge-strong),0_14px_40px_var(--shadow)] ${
        aspect === "tall" ? "max-w-sm" : ""
      } ${className}`}
    >
      {/* window title bar */}
      <div className="relative flex h-9 items-center border-b hairline bg-surface-2/60 px-3">
        <div className="traffic-lights [&>span]:!h-2.5 [&>span]:!w-2.5" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        {caption && (
          <figcaption className="absolute inset-x-20 truncate text-center text-[0.75rem] font-medium text-label-2">
            {caption}
          </figcaption>
        )}
      </div>
      <div
        className={`${ratio} cover-placeholder flex w-full flex-col items-center justify-center gap-2.5`}
      >
        <Images size={26} strokeWidth={1.5} className="text-label-3" />
        <span className="footnote">Screenshot coming soon</span>
      </div>
    </figure>
  );
}
