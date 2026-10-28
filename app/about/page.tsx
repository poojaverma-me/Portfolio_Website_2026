import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Award, Mail } from "lucide-react";
import Reveal from "@/components/Reveal";
import { profile } from "@/lib/profile";
import { projects } from "@/lib/projects";
import { SITE_SUMMARY, SITE_URL, breadcrumbs } from "@/lib/site";
import { socials } from "@/lib/socials";
import { CHANNELS } from "@/lib/videos";
import { issues } from "@/lib/newsletter";

const title = "About Pooja Verma · AI Developer in Kamloops, BC, Canada";
const description =
  "Award-winning AI developer in Kamloops, BC: a Best Paper Award, UREAP and Mitacs funding, frontier LLM training at Outlier and AI used by thousands of people.";

export const metadata: Metadata = {
  // absolute: the name is already in it, so skip the layout's " · Pooja Verma"
  title: { absolute: title },
  description,
  alternates: { canonical: "/about" },
  openGraph: { type: "profile", title, description, url: "/about", firstName: "Pooja", lastName: "Verma" },
  twitter: { card: "summary_large_image", title, description },
};

const PAPER = "https://doi.org/10.65718/inspireHealth.2026.2005";

/** Awards and competitive funding, most recent recognition first. */
const RECOGNITION: { name: string; detail: string; href?: string }[] = [
  {
    name: "Best Paper Award",
    detail:
      "For my first-author paper on detecting diabetic retinopathy in retinal photographs, which reached 98.2% accuracy and was published in the Inspire Health Journal (2026).",
    href: PAPER,
  },
  {
    name: "Mitacs Business Strategy Internship",
    detail:
      "An eight-month, Mitacs-funded research internship at PataBid (2026), where I owned the PDF engine at the core of a construction estimating platform and automated its AI pipelines.",
  },
  {
    name: "UREAP Research Award, $6,000",
    detail:
      "Thompson Rivers University's Undergraduate Research Experience Award (2025), which funded the retinopathy research behind the paper.",
  },
  {
    name: "TRU Student Sustainability Research Grant, $2,500",
    detail:
      "For AI-driven wildfire recovery research in BC's Thompson-Okanagan (2026), presented at the TRU Sustainability Conference and published as the After Fire atlas.",
  },
];

/** Facts at a glance: each one is on the site and in the resume. */
const FACTS: [string, React.ReactNode][] = [
  ["Based in", "Kamloops, British Columbia, Canada. Works across BC and Canada, in person or remotely, and open to relocation"],
  ["Focus", "AI products, retrieval-augmented generation (RAG), LLM evaluation and fine-tuning data, machine learning models, AI workflow automation"],
  ["Recognition", "Best Paper Award · UREAP Research Award ($6,000) · Mitacs Business Strategy Internship · TRU Student Sustainability Research Grant ($2,500)"],
  [
    "Publication",
    <>
      First author, &ldquo;Optimized Deep Learning Framework for Diabetic Retinopathy Detection and
      Classification Using Fundus Imaging&rdquo;, Inspire Health Journal, 2026 (
      <a className="link-accent" href={PAPER} target="_blank" rel="noreferrer">
        DOI
      </a>
      )
    </>,
  ],
  ["LLM training", "Outlier (Scale AI), since November 2024: coding benchmarks, RLHF and fine-tuning data, model evaluation and red-teaming"],
  ["Experience", "Outlier, PataBid (Mitacs), BC Lottery Corporation (software co-op), Thompson Rivers University (research, RAG systems, teaching)"],
  ["Reach", "Systems used by 3,000+ students, 1,000+ staff and 4,000+ lottery retailers; 150+ students taught"],
  ["Education", "Bachelor of Computing Science, Thompson Rivers University (TRU), Kamloops, expected December 2026"],
  ["Teaching AI", "Beyond Prompt on YouTube and the Benchmarked newsletter: AI launches checked against independent benchmarks"],
];

/** Questions people (and search engines) ask, answered from the facts above. */
const FAQ: [string, string][] = [
  [
    "Who is Pooja Verma?",
    "Pooja Verma is an AI developer and machine learning researcher based in Kamloops, British Columbia, Canada. She builds AI products, retrieval-augmented generation (RAG) assistants, machine learning models and AI workflow automation, has trained frontier large language models at Outlier (Scale AI) since 2024, and won a Best Paper Award for her first-author research on diabetic retinopathy detection.",
  ],
  [
    "What awards and funding has Pooja Verma received?",
    "A Best Paper Award for her diabetic retinopathy detection paper, a $6,000 UREAP Research Award from Thompson Rivers University, a Mitacs-funded Business Strategy Internship, and a $2,500 TRU Student Sustainability Research Grant.",
  ],
  [
    "Is there an AI developer in Kamloops, BC who builds custom AI solutions?",
    "Yes. Pooja Verma is based in Kamloops and builds custom AI solutions for teams in Kamloops, across British Columbia and across Canada, in person or remotely: RAG assistants and AI search, LLM-powered product features, machine learning models and automated AI workflows.",
  ],
  [
    "What has Pooja Verma built that people use?",
    "A RAG study assistant used by 3,000+ Thompson Rivers University students, Salesforce tools for BC Lottery Corporation's network of 4,000+ retailers, an employee check-in platform for 1,000+ staff, the PDF engine at the core of a construction estimating platform, and " +
      `${projects.length} documented projects, from LLM products to an educational 3D game.`,
  ],
  [
    "How do I hire Pooja Verma for an AI project?",
    `Email ${profile.email} with the problem, the data you have and your timeline. She is open to full-time roles and to AI projects.`,
  ],
];

export default function AboutPage() {
  const jev = projects.filter((p) => ["reelmind", "pulse", "tidal", "shortlist", "wildwood", "tadka"].includes(p.slug));
  const beyond = CHANNELS.find((c) => c.id === "beyond-prompt");
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
        dateModified: new Date().toISOString(),
        mainEntity: { "@id": `${SITE_URL}/#person` },
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/about#faq`,
        mainEntity: FAQ.map(([q, a]) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
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
          Award-winning AI developer <span className="text-label-2">in Kamloops, British Columbia.</span>
        </h1>
        <p className="lead mt-6 max-w-3xl">
          I&apos;m Pooja Verma. I build AI that people actually use: products in production every day,
          research that has won a Best Paper Award, and the training data behind frontier language
          models. I don&apos;t build demos for their own sake. I build systems that change how people
          work, and I get teams from an idea to a working product fast.
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <h2 className="headline mt-14 !text-[1.375rem]">Recognition</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {RECOGNITION.map((r) => (
            <li key={r.name} className="glass-card flex gap-4 p-5">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-fill-2 text-accent" aria-hidden>
                <Award size={18} />
              </span>
              <div>
                <h3 className="headline !text-[1.0625rem]">
                  {r.href ? (
                    <a className="hover:text-accent" href={r.href} target="_blank" rel="noreferrer">
                      {r.name}
                    </a>
                  ) : (
                    r.name
                  )}
                </h3>
                <p className="mt-1.5 text-[0.9375rem] leading-[1.55] text-label-2">{r.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="docs-prose mt-16 space-y-5">
          <h2 className="headline !text-[1.375rem] text-label">AI that ships, and gets used every day</h2>
          <p>
            Most of what I build is in daily use. At Thompson Rivers University I built a
            retrieval-augmented generation (RAG) study assistant grounded in course material: it serves
            3,000+ students, raised answer relevance by 40% and took 35% of the repeat questions off
            instructors&apos; desks. At the British Columbia Lottery Corporation I built Salesforce and
            Power Platform tools for a network of 4,000+ lottery retailers, cutting manual licensing
            work by 30%, and co-built an employee check-in platform for 1,000+ staff.
          </p>
          <p>
            As a Mitacs-funded research intern at PataBid, I owned the PDF rendering engine at the
            core of a construction estimating platform and automated the data and training pipelines
            behind its AI stamp and take-off detection. Beyond these roles, I&apos;ve built AI pipelines
            and automated workflows for about a dozen companies, so their people spend less time on
            repetitive work and reach a working MVP sooner.
          </p>
          <p>
            On my own I&apos;ve shipped six AI products on TypeSafe&apos;s Jev decision model, each with
            its latency, cost and accuracy measured:{" "}
            {jev.map((p, i) => (
              <span key={p.slug}>
                <Link className="link-accent" href={`/projects/${p.slug}`}>
                  {p.title}
                </Link>
                {i < jev.length - 2 ? ", " : i === jev.length - 2 ? " and " : "."}
              </span>
            ))}{" "}
            I also build{" "}
            <Link className="link-accent" href="/projects/living-city">
              interactive 3D learning worlds
            </Link>{" "}
            and a{" "}
            <Link className="link-accent" href="/projects/voice-receptionist">
              real-time voice receptionist
            </Link>{" "}
            that books clinic appointments through function calling.
          </p>

          <h2 className="headline !text-[1.375rem] pt-6 text-label">I know LLMs from the inside</h2>
          <p>
            Since November 2024 I&apos;ve trained frontier large language models at Outlier, Scale
            AI&apos;s platform for AI training data. I design coding benchmarks and multi-turn reasoning
            prompts used to fine-tune models through reinforcement learning from human feedback (RLHF),
            write the annotated rationales and synthetic datasets that feed supervised fine-tuning,
            and red-team model reasoning for hallucinations. Along the way I&apos;ve benchmarked 100+
            code submissions to find exactly where models break.
          </p>
          <p>
            That work is why my AI products hold up: I know where language models fail, how they are
            evaluated, and how to make them reliable, fast and affordable enough to run on every
            request.
          </p>

          <h2 className="headline !text-[1.375rem] pt-6 text-label">Award-winning research</h2>
          <p>
            My first-author paper detects diabetic retinopathy, a leading cause of preventable
            blindness, from a single retinal photograph. It fuses features from a convolutional network
            (AlexNet) and a vision transformer (Swin), reaches 98.2% accuracy on the public APTOS 2019
            dataset, and won a <strong>Best Paper Award</strong>. The research was funded by a $6,000
            UREAP Research Award and{" "}
            <a className="link-accent" href={PAPER} target="_blank" rel="noreferrer">
              published in the Inspire Health Journal
            </a>{" "}
            (2026).
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

          <h2 className="headline !text-[1.375rem] pt-6 text-label">Teaching AI in public</h2>
          <p>
            On my YouTube channel,{" "}
            <a className="link-accent" href={beyond?.url} target="_blank" rel="noreferrer">
              Beyond Prompt
            </a>
            , I break down every major AI launch: what&apos;s actually new, live demos, what independent
            benchmarks and the developer community say, and my own verdict as someone who trains and
            ships these models. The{" "}
            <Link className="link-accent" href="/newsletter">
              Benchmarked newsletter
            </Link>{" "}
            ({issues.length} issues so far) does the same in writing, labelling every number by who
            reported it. Before that I taught 150+ students Python, Java and data structures as a
            teaching assistant, and coached undergraduate researchers at TRU.
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
        <h2 className="headline mt-16 !text-[1.375rem]">Questions</h2>
        <div className="mt-4 divide-y divide-[var(--color-separator)] border-y hairline">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[1.0625rem] font-semibold text-label">
                {q}
                <span aria-hidden className="text-accent transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 max-w-3xl text-[0.9375rem] leading-[1.6] text-label-2">{a}</p>
            </details>
          ))}
        </div>
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
