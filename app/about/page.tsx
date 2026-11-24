import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Award, Mail } from "lucide-react";
import Reveal from "@/components/Reveal";
import { profile } from "@/lib/profile";
import { projects } from "@/lib/projects";
import { SITE_URL, breadcrumbs } from "@/lib/site";
import { socials } from "@/lib/socials";
import { CHANNELS } from "@/lib/videos";
import { issues } from "@/lib/newsletter";

const title = "About Pooja Verma · AI Developer in Kamloops, BC, Canada";
const description =
  "Meet Pooja Verma, a Kamloops AI developer. Explore her award-winning research and funded projects, or get in touch about a commercial build or collaboration.";

export const metadata: Metadata = {
  // absolute: the name is already in it, so skip the layout's " · Pooja Verma"
  title: { absolute: title },
  description,
  alternates: { canonical: "/about" },
  openGraph: { type: "profile", title, description, url: "/about", firstName: "Pooja", lastName: "Verma" },
  twitter: { card: "summary_large_image", title, description },
};

const PAPER = "https://doi.org/10.65718/inspireHealth.2026.2005";

/** Selected awards and funded work. */
const RECOGNITION: { name: string; detail: string; href?: string }[] = [
  {
    name: "AI Hackathon winner",
    detail: "In November 2026, I won the AI Hackathon hosted by the TRUSU AI Club.",
  },
  {
    name: "ICICET 2025 Best Paper Award",
    detail:
      "I presented my work on detecting diabetic retinopathy from retinal photographs at ICICET in 2025 and won Best Paper. The journal paper followed in 2026.",
    href: "https://poojaverma.trubox.ca/sample-page/",
  },
  {
    name: "Mitacs Business Strategy Internship",
    detail:
      "An eight-month, Mitacs-funded research internship at PataBid (2026), where I owned the PDF engine at the core of a construction estimating platform and automated its AI pipelines.",
  },
  {
    name: "UREAP Research Award, $6,000",
    detail:
      "Thompson Rivers University's Undergraduate Research Experience Award supported my retinal imaging study in 2025, from comparing models to presenting the findings.",
    href: "https://airl.ca/people/",
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
  ["Recognition", "TRUSU AI Club AI Hackathon winner (November 2026) · ICICET 2025 Best Paper Award · UREAP Research Award ($6,000) · Mitacs Business Strategy Internship · TRU Student Sustainability Research Grant ($2,500)"],
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
    "Pooja won the TRUSU AI Club’s November 2026 AI Hackathon and the ICICET 2025 Best Paper Award for her retinal imaging research. Her funded work includes a $6,000 UREAP Research Award, a Mitacs Business Strategy Internship and a $2,500 TRU Student Sustainability Research Grant.",
  ],
  [
    "How do I choose the best AI developer in Kamloops for my project?",
    "Look for someone who has solved a similar problem and can show how they tested the result. If you need search across your own documents, Pooja built a study assistant that helps 3,000+ TRU students find answers in course material. For grant-funded machine learning, her After Fire case study shows how she compared five models across 2,600 burned sites and where their predictions fell short.",
  ],
  [
    "What has Pooja Verma built that people use?",
    "A RAG study assistant used by 3,000+ Thompson Rivers University students, Salesforce tools for BC Lottery Corporation's network of 4,000+ retailers, an employee check-in platform for 1,000+ staff, the PDF engine at the core of a construction estimating platform, and " +
      `${projects.length} documented projects, from LLM products to an educational 3D game.`,
  ],
  [
    "How do I hire Pooja Verma for an AI project?",
    `Email ${profile.email} with the problem you want to solve. Pooja can help scope an idea, join an existing team or build the product end to end. She takes on commercial AI projects and grant-funded research collaborations.`,
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
        description,
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
          Pooja Verma, AI developer <span className="text-label-2">in Kamloops, British Columbia.</span>
        </h1>
        <p className="lead mt-6 max-w-3xl">
          I like sitting down with the people who know a problem firsthand. At Thompson Rivers
          University, that meant helping students find answers in their course material. At PataBid,
          it meant helping construction estimators work with the drawings they use to prepare a bid.
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <h2 className="headline mt-14 !text-[1.375rem]">Have an AI project in mind?</h2>
        <p className="mt-4 max-w-[66ch] text-base leading-relaxed text-label-2">
          I work with businesses and research teams in Kamloops and across Canada. If you&apos;re
          exploring an idea, I can help you decide what&apos;s worth testing. If you already have
          a team, I can take on a specific piece, like evaluating a model on your data. I also
          build custom AI products from the first prototype through launch.
        </p>
        <p className="mt-4 max-w-[66ch] text-base leading-relaxed text-label-2">
          Commercial projects and grant-funded collaborations are both welcome. Tell me who the
          work is for and what you&apos;d like them to be able to do. A few lines are enough
          to start a conversation.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={`mailto:${profile.email}`} className="btn-primary">
            <Mail size={16} aria-hidden /> Email me about your project
          </a>
          <Link href="/work-with-me" className="btn-glass">Explore my AI development services</Link>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <h2 id="funding-and-awards" className="headline mt-14 scroll-mt-24 !text-[1.375rem]">
          Research funding, scholarships and competition results
        </h2>
        <p className="mt-4 max-w-[66ch] text-base leading-relaxed text-label-2">
          Over four years of my Bachelor of Computing Science at Thompson Rivers University,
          I received <strong className="text-label">at least $30,000</strong> in combined project funding, grants and
          scholarships. I&apos;ve also entered competitions, been shortlisted and won awards.
          My wildfire recovery atlas and retinal imaging paper show what came out of two of
          those research grants.
        </p>
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
          <h2 className="headline !text-[1.375rem] text-label">AI and software for universities and businesses</h2>
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

          <h2 className="headline !text-[1.375rem] pt-6 text-label">Training and evaluating large language models</h2>
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

          <h2 className="headline !text-[1.375rem] pt-6 text-label">Grant-funded machine learning research</h2>
          <h3 className="headline !text-[1.125rem] text-label">Detecting diabetic retinopathy in retinal images</h3>
          <p>
            For my first-author paper, I combined features from a convolutional network
            (AlexNet) and a vision transformer (Swin) to detect diabetic retinopathy in retinal
            photographs. The model reached 98.2% accuracy on the public APTOS 2019
            dataset. The research was funded by a $6,000
            UREAP Research Award and{" "}
            <a className="link-accent" href={PAPER} target="_blank" rel="noreferrer">
              published in the Inspire Health Journal
            </a>{" "}
            (2026).
          </p>
          <h3 className="headline !text-[1.125rem] text-label">Predicting vegetation recovery after wildfire in BC</h3>
          <p>
            Which burned sites recover on their own, and where might replanting help? I combined
            six open datasets covering 2,600 burned sites and compared five models of vegetation
            recovery three years after a fire. Burn severity was the strongest predictor overall.
            In the Thompson-Okanagan, moisture deficit was the next most important. I built{" "}
            <Link className="link-accent" href="/projects/after-fire">
              After Fire
            </Link>
            {" "}so people can explore those results by site, see which native species might suit
            the conditions and check where the models struggle. I presented the work at the TRU
            Sustainability Conference.
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
