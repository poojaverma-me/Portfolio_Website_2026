import { ArrowUpRight, Code, Mail } from "lucide-react";
import { profile } from "@/lib/profile";
import DottedSurface from "@/components/ui/dotted-surface-lazy";

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.53-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12v3.14c0 .3.21.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

const socials = [
  { href: profile.github, label: "GitHub", icon: <GithubIcon size={16} /> },
  { href: profile.linkedin, label: "LinkedIn", icon: <LinkedinIcon size={15} /> },
  { href: profile.leetcode, label: "LeetCode", icon: <Code size={16} /> },
];

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
              Open to internships, research collaborations, and anything that
              needs to ship.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a href={`mailto:${profile.email}`} className="btn-primary">
                <Mail size={17} /> {profile.email}
              </a>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-glass"
                >
                  {s.icon} {s.label}
                  <ArrowUpRight size={14} className="text-label-2" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t hairline py-6 text-[0.75rem] text-label-2">
          <p>Copyright © 2026 Pooja Verma.</p>
        </div>
      </div>
    </footer>
  );
}
