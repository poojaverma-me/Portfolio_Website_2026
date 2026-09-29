"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Award, ChevronRight, Code, FlaskConical } from "lucide-react";
import { profile } from "@/lib/profile";
import { useIntroFinished } from "@/lib/use-intro";

// Apple's standard ease for UI motion
const ease = [0.25, 0.1, 0.25, 1] as const;

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.7, ease },
  }),
};

const highlights = [
  { icon: Code, text: "Full-stack development" },
  { icon: FlaskConical, text: "AI and ML research" },
  { icon: Award, text: "UREAP research scholar" },
];

export default function Hero() {
  // hold the entrance until the hello intro has revealed the page
  const introFinished = useIntroFinished();

  // scroll-out parallax: copy lifts away faster than the portrait
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const portraitY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 140]);
  const portraitScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1.06]);
  const copyY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -90]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.75], reduce ? [1, 1] : [1, 0]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden pt-36 pb-20 lg:min-h-[760px]">
      {/* portrait: full-bleed to the right edge, desktop only */}
      <motion.div
        style={{ y: portraitY, scale: portraitScale }}
        className="hidden lg:flex absolute inset-y-0 right-0 w-[52vw] max-w-[860px] items-center justify-end pointer-events-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={introFinished ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
          transition={{ delay: 0.25, duration: 1, ease }}
          className="relative w-full aspect-[1371/1148]"
        >
          <div
            aria-hidden
            className="absolute -top-[6%] -left-[10%] -right-[10%] bottom-[24%]"
            style={{
              background:
                "radial-gradient(ellipse 60% 56% at 58% 38%, rgb(249 107 11 / 0.14), transparent 72%)",
              filter: "blur(30px)",
            }}
          />
          <Image
            src="/hero-image.png"
            alt="Pooja Verma, circled by an orange light trail"
            fill
            priority
            sizes="(max-width: 1024px) 0px, 52vw"
            quality={82}
            className="hero-fade object-contain object-right"
          />
        </motion.div>
      </motion.div>

      <div className="mx-auto max-w-6xl px-6 relative">
        <motion.div style={{ y: copyY, opacity: copyOpacity }} className="lg:max-w-[560px]">
          {/* The eyebrow is part of the heading, so the page's one h1 says who this
              is, what she does and where, in text that is on screen. */}
          <h1>
            <motion.span
              variants={rise}
              initial="hidden"
              animate={introFinished ? "show" : "hidden"}
              custom={0}
              className="eyebrow block"
            >
              {profile.name} · {profile.role} · {profile.location}
            </motion.span>
            <motion.span
              variants={rise}
              initial="hidden"
              animate={introFinished ? "show" : "hidden"}
              custom={1}
              className="large-title mt-4 block"
            >
              <span className="block">{profile.headline[0]}</span>
              <span className="block text-accent">{profile.headline[1]}</span>
            </motion.span>
          </h1>

          <motion.p
            variants={rise}
            initial="hidden"
            animate={introFinished ? "show" : "hidden"}
            custom={2}
            className="lead mt-6 max-w-[34rem]"
          >
            {profile.intro}
          </motion.p>

          <motion.div
            variants={rise}
            initial="hidden"
            animate={introFinished ? "show" : "hidden"}
            custom={3}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Link href="/projects" className="btn-primary">
              View my work
            </Link>
            <Link href="/#experience" className="btn-glass">
              Experience
            </Link>
            <a href="#contact" className="link-accent ml-2 text-[1.0625rem]">
              Get in touch <ChevronRight size={17} strokeWidth={2.25} />
            </a>
          </motion.div>

          <motion.ul
            variants={rise}
            initial="hidden"
            animate={introFinished ? "show" : "hidden"}
            custom={4}
            className="mt-12 flex flex-wrap gap-2.5"
          >
            {highlights.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="btn-glass btn-sm !cursor-default !gap-2 !pl-1.5 !font-normal"
              >
                <span className="app-icon is-sm !h-6 !w-6 !rounded-full">
                  <Icon size={13} strokeWidth={2.25} />
                </span>
                {text}
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
}
