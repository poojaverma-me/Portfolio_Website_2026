import { Code, Mail } from "lucide-react";
import { profile } from "@/lib/profile";
import { socials, type Social } from "@/lib/socials";
import DottedSurface from "@/components/ui/dotted-surface-lazy";
import { IconGrid, type IconGridItem } from "@/components/ui/icon-set";
import { GithubIcon, LinkedinIcon, XIcon, YoutubeIcon } from "@/components/BrandIcons";

const ICON_CLASS = "h-[18px] w-[18px] text-label-2 transition-all duration-300 group-hover:scale-110 group-hover:text-label";

const ICONS: Record<Social["id"], React.ReactNode> = {
  linkedin: <LinkedinIcon className={ICON_CLASS} />,
  github: <GithubIcon className={ICON_CLASS} />,
  x: <XIcon className={ICON_CLASS} />,
  "youtube-beyond-prompt": <YoutubeIcon className={ICON_CLASS} />,
  youtube: <YoutubeIcon className={ICON_CLASS} />,
  leetcode: <Code className={ICON_CLASS} strokeWidth={2} />,
};

const socialTiles: IconGridItem[] = socials.map((s) => ({
  id: s.id,
  icon: ICONS[s.id],
  name: s.name,
  href: s.href,
  label: s.handle,
}));

export default function Footer() {
  return (
    <footer className="mt-40">
      <div className="mx-auto max-w-6xl px-6">
        <div
          id="contact"
          className="glass-card scroll-mt-28 overflow-hidden px-8 py-14 sm:px-14 sm:py-20"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 90% at 100% 100%, rgb(249 107 11 / 0.1), transparent 70%)",
            }}
          />
          {/* animated dot wave rising from the bottom of the card */}
          <DottedSurface
            size={7}
            opacity={0.75}
            className="[mask-image:linear-gradient(to_bottom,transparent_15%,black_70%)]"
          />
          <div className="relative">
            <p className="eyebrow">Get in touch</p>
            <h2 className="section-title mt-2">
              Let&apos;s build <span className="text-accent">something real.</span>
            </h2>
            <p className="lead mt-4 max-w-xl">
              Open to full-time roles and projects across AI development, machine learning
              research, LLM systems and full-stack engineering. Remote, hybrid or on-site, and
              happy to relocate.
            </p>
            <div className="mt-9">
              <a href={`mailto:${profile.email}`} className="btn-primary">
                <Mail size={17} /> {profile.email}
              </a>
            </div>
            <IconGrid items={socialTiles} className="mt-7" />
          </div>
        </div>

        <div className="mt-12 border-t hairline py-6 text-[0.75rem] text-label-2">
          <p>Copyright © 2026 Pooja Verma.</p>
        </div>
      </div>
    </footer>
  );
}
