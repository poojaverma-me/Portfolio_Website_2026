import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import DriftBand from "@/components/DriftBand";
import Reveal from "@/components/Reveal";
import { capabilities, type Capability } from "@/lib/capabilities";

function Card({ c, hidden }: { c: Capability; hidden?: boolean }) {
  return (
    <article
      className="glass-card is-interactive group flex w-[300px] shrink-0 flex-col p-6 sm:w-[340px]"
      aria-hidden={hidden || undefined}
    >
      {/* the icon is a small sculpture rendered in Blender; it lifts on hover */}
      <div className="relative -ml-3 -mt-3 h-[108px] w-[108px]">
        <div
          aria-hidden
          className="absolute inset-3 rounded-full bg-accent/0 blur-xl transition-colors duration-500 group-hover:bg-accent/20"
        />
        <Image
          src={`/icons/capabilities/${c.icon}.webp`}
          alt=""
          width={108}
          height={108}
          sizes="108px"
          // the row moves by transform, which lazy loading doesn't notice; the icons are tiny
          loading="eager"
          className="relative transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 group-hover:rotate-[-4deg] group-hover:scale-[1.04]"
        />
      </div>
      <h3 className="headline mt-4">{c.title}</h3>
      <p className="mt-2 flex-1 text-[0.9375rem] leading-[1.5] text-label-2">{c.body}</p>
      <div className="mt-5 border-t hairline pt-4">
        <ul className="flex flex-wrap gap-1.5">
          {c.proof.map((p) => (
            <li key={p.label}>
              <Link
                href={p.href}
                tabIndex={hidden ? -1 : undefined}
                className="token inline-flex items-center gap-1 transition-colors hover:!text-label"
              >
                {p.label}
                {p.href.startsWith("/projects/") && <ArrowUpRight size={11} aria-hidden />}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

/**
 * What I do: the problems the work is aimed at, as cards that drift past on
 * their own. Hovering or tabbing into the row pauses it; with reduced motion
 * it becomes a row you scroll yourself.
 */
export default function WhatIDo() {
  return (
    <section id="what-i-do" className="relative scroll-mt-24 overflow-hidden pt-20 pb-4 sm:pt-24">
      <DriftBand text="Build · Ship · Research · Build · Ship" className="top-12" />
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="eyebrow">What I do</p>
          <h2 className="section-title mt-2 max-w-3xl">
            Systems built for problems <span className="text-label-2">with real stakes.</span>
          </h2>
          <p className="lead mt-4 max-w-2xl">
            Wildfire recovery, medical imaging, education, hiring and the daily operations of large
            organizations: problems where a system has to be accurate, explainable and fast enough
            to use.
          </p>
        </Reveal>
      </div>
      <Reveal delay={0.05}>
        <div className="cap-viewport mt-12">
          <div className="cap-track">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-stretch gap-4 pr-4">
                {capabilities.map((c) => (
                  <Card key={`${copy}-${c.title}`} c={c} hidden={copy === 1} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
