import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Mail } from "lucide-react";
import Reveal from "@/components/Reveal";
import { profile } from "@/lib/profile";
import { projects } from "@/lib/projects";
import { SITE_SUMMARY, SITE_URL, breadcrumbs } from "@/lib/site";
import { socials } from "@/lib/socials";

const title = "About Pooja Verma · AI Developer in British Columbia, Canada";
const description =
  `Pooja Verma is an AI developer and machine learning researcher in British Columbia, Canada: RAG assistants, LLM products, published deep learning research and ${projects.length} case studies.`;

export const metadata: Metadata = {
  // absolute: the name is already in it, so skip the layout's " · Pooja Verma"
  title: { absolute: title },
  description,
  alternates: { canonical: "/about" },
  openGraph: { type: "profile", title, description, url: "/about", firstName: "Pooja", lastName: "Verma" },
  twitter: { card: "summary_large_image", title, description },
};

/** Facts at a glance: each one is on the site and in the resume. */
const FACTS: [string, React.ReactNode][] = [
  ["Based in", "Kamloops, British Columbia, Canada. Works across Canada in person or remotely, and open to relocation"],
  ["Focus", "Retrieval-augmented generation (RAG), LLM products and evaluation, machine learning models, full-stack development"],
  ["Education", "Bachelor of Computing Science, Thompson Rivers University (TRU), expected December 2026"],
  [
    "Publication",
    <>
      First author, &ldquo;Optimized Deep Learning Framework for Diabetic Retinopathy Detection and
      Classification Using Fundus Imaging&rdquo;, Inspire Health Journal, 2026 (
      <a className="link-accent" href="https://doi.org/10.65718/inspireHealth.2026.2005" target="_blank" rel="noreferrer">
        DOI
      </a>
      )
    </>,
  ],
  ["Awards", "UREAP Undergraduate Research Award ($6,000), TRU Student Sustainability Research Grant ($2,500)"],
  ["Experience", "Outlier (generative AI data), PataBid (Mitacs research internship), BC Lottery Corporation (software co-op), TRU (research and teaching)"],
  ["Reach", "Systems used by 3,000+ students, 4,000+ lottery retailers and 1,000+ staff; 150+ students taught"],
  ["Writing and video", "Beyond Prompt on YouTube and the Benchmarked newsletter, both fact-checking AI launches"],
];

export default function AboutPage() {
  const jev = projects.filter((p) => ["reelmind", "pulse", "tidal", "shortlist", "wildwood", "tadka"].includes(p.slug));
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/about#page`,
        url: `${SITE_URL}/about`,
        name: title,
        description: SITE_SUMMARY,
        inLanguage: "en-CA",
        mainEntity: { "@id": `${SITE_URL}/#person` },
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      breadcrumbs([
        ["Home", "/"],
        ["About", "/about"],
      ]),
    ],
  };

  return (
    <article className="mx-auto max-w-4xl px-6 pb-8 pt-36">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Reveal>
        <p className="eyebrow">About</p>
        <h1 className="section-title mt-2 max-w-3xl">
          AI developer and researcher <span className="text-label-2">in British Columbia, Canada.</span>
        </h1>
        <p className="lead mt-6 max-w-3xl">
          I&apos;m Pooja Verma. I build AI systems that hold up outside the demo: retrieval-augmented
          generation (RAG) assistants, LLM-powered products, machine learning models for research,
          and the full-stack software around them. I&apos;m based in Kamloops, British Columbia, work
          with teams across Canada in person or remotely, and I&apos;m open to relocating.
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="docs-prose mt-14 space-y-5">
          <h2 className="headline !text-[1.375rem] text-label">What I&apos;ve built</h2>
          <p>
            At Thompson Rivers University I built a RAG study assistant grounded in course material.
            It reached 3,000+ students, raised answer relevance by 40%, and took 35% of the repeat
            questions off instructors&apos; desks.
          </p>
          <p>
            At Outlier I design coding benchmarks and multi-turn reasoning prompts used to fine-tune
            frontier large language models through reinforcement learning from human feedback (RLHF),
            and red-team model reasoning for hallucinations. Before that, as a Mitacs research intern
            at PataBid, I owned the PDF rendering engine at the core of a construction estimating
            platform and automated the pipelines behind its AI stamp and take-off detection.
          </p>
          <p>
            As a software engineering co-op at the British Columbia Lottery Corporation I built
            Salesforce and Power Platform tools for a network of 4,000+ lottery retailers, cutting
            manual licensing work by 30%, and co-built an employee check-in platform for 1,000+ staff.
          </p>
          <p>
            On my own I&apos;ve built six AI products on TypeSafe&apos;s Jev decision model, each with
            its latency, cost and accuracy measured:{" "}
            {jev.map((p, i) => (
              <span key={p.slug}>
                <Link className="link-accent" href={`/projects/${p.slug}`}>
                  {p.title}
                </Link>
                {i < jev.length - 2 ? ", " : i === jev.length - 2 ? " and " : "."}
              </span>
            ))}
          </p>

          <p>
            I also build interactive 3D worlds for the browser.{" "}
            <Link className="link-accent" href="/projects/living-city">
              The Living City
            </Link>{" "}
            turns an animal cell into a miniature city that biology students can walk through, with 11
            organelle districts, a hands-on activity in each and a voiced scientist guide.
          </p>
          <h2 className="headline !text-[1.375rem] pt-6 text-label">Research</h2>
          <p>
            My first-author paper in the Inspire Health Journal (2026) detects diabetic retinopathy in
            retinal photographs by fusing features from a convolutional network (AlexNet) and a vision
            transformer (Swin), reaching 98.2% accuracy on the public APTOS 2019 dataset. The work was
            funded by a $6,000 UREAP Research Award.
          </p>
          <p>
            With a TRU Student Sustainability Research Grant I&apos;m studying which burned land in
            BC&apos;s Thompson-Okanagan recovers on its own after wildfire. The models became{" "}
            <Link className="link-accent" href="/projects/after-fire">
              After Fire
            </Link>
            , a public atlas, recovery simulator and native-species planting guide, presented at the
            TRU Sustainability Conference.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <h2 className="headline mt-16 !text-[1.375rem]">At a glance</h2>
        <dl className="mt-6 divide-y divide-[var(--color-separator)] border-y hairline">
          {FACTS.map(([k, v]) => (
            <div key={k} className="grid gap-1 py-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6">
              <dt className="eyebrow !text-label-2">{k}</dt>
              <dd className="text-[1rem] leading-[1.55] text-label">{v}</dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal delay={0.05}>
        <h2 className="headline mt-16 !text-[1.375rem]">Skills</h2>
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {profile.skills.map((s) => (
            <li key={s} className="token">
              {s}
            </li>
          ))}
        </ul>

        <h2 className="headline mt-16 !text-[1.375rem]">Elsewhere</h2>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {socials.map((s) => (
            <li key={s.id}>
              <a className="link-accent" href={s.href} target="_blank" rel="noreferrer me">
                {s.name} <span className="text-label-2">{s.handle}</span> <ArrowUpRight size={14} />
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-16 flex flex-wrap gap-3">
          <Link href="/work-with-me" className="btn-primary">
            Work with me <ArrowRight size={16} />
          </Link>
          <a href={`mailto:${profile.email}`} className="btn-glass">
            <Mail size={16} /> {profile.email}
          </a>
        </div>
      </Reveal>
    </article>
  );
}
