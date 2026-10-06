import Image from "next/image";
import { imageSize } from "@/lib/projectImages";

/**
 * A real screenshot in the same window chrome the placeholders used, so case
 * studies keep their macOS look. Clicking opens the full-resolution image.
 * Phone screenshots sit in a slim device frame instead of a window.
 */
export default function Screenshot({
  src,
  alt,
  caption,
  device,
  priority = false,
}: {
  src: string;
  alt: string;
  caption: string;
  device?: "phone";
  priority?: boolean;
}) {
  const [width, height] = imageSize[src] ?? [1600, 1000];

  if (device === "phone") {
    return (
      <figure className="mx-auto w-full max-w-[260px]">
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="block overflow-hidden rounded-[30px] bg-surface p-[7px] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1),0_0_0_1px_var(--edge-strong),0_18px_44px_var(--shadow)]"
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes="260px"
            priority={priority}
            className="h-auto w-full rounded-[24px]"
          />
        </a>
        <figcaption className="footnote mt-3 text-center">{caption}</figcaption>
      </figure>
    );
  }

  return (
    <figure className="overflow-hidden rounded-[14px] bg-surface shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08),0_0_0_1px_var(--edge-strong),0_14px_40px_var(--shadow)]">
      {/* window title bar */}
      <div className="relative flex h-9 items-center border-b hairline bg-surface-2/60 px-3">
        <div className="traffic-lights [&>span]:!h-2.5 [&>span]:!w-2.5" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <figcaption className="absolute inset-x-20 truncate text-center text-[0.75rem] font-medium text-label-2">
          {caption}
        </figcaption>
      </div>
      <a href={src} target="_blank" rel="noreferrer" className="block" aria-label={`${caption}, full size`}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="(max-width: 1024px) 100vw, 860px"
          priority={priority}
          className="h-auto w-full"
        />
      </a>
    </figure>
  );
}
