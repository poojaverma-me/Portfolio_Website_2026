import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import Reveal from "@/components/Reveal";
import { profile } from "@/lib/profile";
import { SITE_URL, breadcrumbs } from "@/lib/site";

const title = "Hire an AI Developer in British Columbia, Canada";
const description =
  "Hire Pooja Verma, an AI developer in British Columbia, Canada, for RAG assistants, LLM products, machine learning models, LLM evaluation and full-stack apps, with measured results.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/work-with-me" },
  openGraph: { type: "website", title, description, url: "/work-with-me" },
  twitter: { card: "summary_large_image", title, description },
};

type Service = { name: string; body: string; proof: { label: string; href: string }[] };

/** What Pooja builds, each tied to work that shows it. */
const SERVICES: Service[] = [
  {
    name: "RAG assistants and AI search",
    body: "Chat and search over your own documents, grounded in your sources and measured for answer relevance, so people get answers that already exist without asking a person.",
    proof: [
      { label: "RAG study assistant: 3,000+ students, +40% relevance", href: "/#experience" },
    ],
  },
  {
    name: "LLM-powered products",
    body: "AI features that make a decision, score something or route work, built to be fast and cheap enough to run on every request, with the latency, cost and accuracy measured before launch.",
    proof: [
      { label: "Tidal: 96.9% routing accuracy", href: "/projects/tidal" },
      { label: "Pulse: live coaching at 230 ms", href: "/projects/pulse" },
      { label: "ReelMind", href: "/projects/reelmind" },
      { label: "Clinic voice receptionist", href: "/projects/voice-receptionist" },
    ],
  },
  {
    name: "LLM evaluation, benchmarks and RLHF data",
    body: "Benchmarks, multi-turn prompts and graded datasets that show where a model fails, written by someone who does this for frontier models.",
    proof: [{ label: "Generative AI data specialist at Outlier", href: "/#experience" }],
  },
  {
    name: "Machine learning models you can explain",
    body: "Classification and prediction models with honest evaluation and SHAP explanations, from tabular data to medical images.",
    proof: [
      { label: "After Fire: wildfire recovery", href: "/projects/after-fire" },
      { label: "Retinopathy paper: 98.2% accuracy", href: "https://doi.org/10.65718/inspireHealth.2026.2005" },
    ],
  },
  {
    name: "Full-stack web apps",
    body: "The product around the model: Next.js and React front ends, APIs, real-time data and dashboards that hold up once real users arrive.",
    proof: [
      { label: "PDF engine for a construction platform", href: "/#experience" },
      { label: "Schedulo", href: "/projects/schedulo" },
      { label: "After Fire atlas", href: "/projects/after-fire" },
    ],
  },
  {
    name: "Interactive 3D and learning experiences",
    body: "Explorable 3D worlds in the browser with Three.js, from science education to voice-controlled games, tuned with quality tiers so they run on ordinary laptops.",
    proof: [
      { label: "The Living City: walk inside a cell", href: "/projects/living-city" },
      { label: "Wildwood", href: "/projects/wildwood" },
    ],
  },
  {
    name: "Workflow automation",
    body: "Salesforce (Apex, Lightning Web Components) and Power Platform automation that takes manual work off people's desks.",
    proof: [{ label: "BCLC: 30% less manual licensing work", href: "/#experience" }],
  },
];

const STEPS = [
  ["Start from the decision", "What does someone need to decide or find, and what data already exists? The problem sets the tools, not the other way round."],
  ["Prototype and measure", "A working version early, tested on real examples, with accuracy, latency and cost per request written down."],
  ["Ship with evidence", "Launch with the numbers, the failure cases and a plain write-up of what the system can and can't do."],
  ["Hand over cleanly", "Tests, documentation and versioned code, so your team can run it without me."],
];

const FAQ: [string, string][] = [
  [
    "What kinds of AI projects does Pooja take on?",
    "Retrieval-augmented generation (RAG) assistants and AI search, LLM-powered product features, machine learning models with explanations, LLM evaluation and benchmark design, full-stack web apps, interactive 3D and learning experiences, and Salesforce or Power Platform automation. Every one of these is backed by shipped work documented on this site.",
  ],
  [
    "Does she work with companies outside British Columbia?",
    "Yes. Pooja is based in Kamloops, British Columbia, works with teams in Kamloops and across BC, and with teams across Canada in person or remotely. She is also open to relocating for a full-time role.",
  ],
  [
    "Is she available for full-time roles?",
    "Yes. She is open to full-time roles in AI development, machine learning, LLM systems and full-stack engineering, and is completing a Bachelor of Computing Science at Thompson Rivers University in December 2026.",
  ],
  [
    "Can she help with research or grant-funded work?",
    "Yes. She has led funded research (a $6,000 UREAP Research Award and a TRU Student Sustainability Research Grant), completed a Mitacs-funded research internship, and published as first author in the Inspire Health Journal, a paper that won a Best Paper Award.",
  ],
  [
    "How does she show that an AI feature works?",
    "With measurements on real examples: accuracy against labelled data, median latency and cost per request. Tidal, for example, routed 96 labelled support tickets with 96.9% team accuracy at a 176 ms median, and Pulse answers 12 questions about a sales call after every sentence at a 230 ms median.",
  ],
  [
    "How do I start a project with her?",
    `Email ${profile.email} with a short description of the problem, the data you have and your timeline.`,
  ],
];

export default function WorkWithMePage() {
  const person = { "@id": `${SITE_URL}/#person` };
  const areas = [
    { "@type": "AdministrativeArea", name: "British Columbia" },
    { "@type": "Country", name: "Canada" },
  ];
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/work-with-me#page`,
        url: `${SITE_URL}/work-with-me`,
        name: title,
        description,
        inLanguage: "en-CA",
        about: person,
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      ...SERVICES.map((s) => ({
        "@type": "Service",
        name: s.name,
        description: s.body,
        serviceType: s.name,
        provider: person,
        areaServed: areas,
        url: `${SITE_URL}/work-with-me`,
      })),
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/work-with-me#faq`,
        mainEntity: FAQ.map(([q, a]) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
      breadcrumbs([
        ["Home", "/"],
        ["Work with me", "/work-with-me"],
      ]),
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-6 pb-8 pt-36">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Reveal>
        <p className="eyebrow">Work with me</p>
        <h1 className="section-title mt-2 max-w-4xl">
          AI development for teams <span className="text-label-2">in British Columbia and across Canada.</span>
        </h1>
        <p className="lead mt-6 max-w-3xl">
          I design and build AI systems end to end, from the data and the model to the product people
          use, and I measure them before calling them done. I&apos;m based in Kamloops, BC, available
          to teams anywhere in British Columbia (from the Okanagan to Vancouver and Victoria) and
          across Canada, in person or remotely, and open to full-time roles as well as projects.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={`mailto:${profile.email}`} className="btn-primary">
            <Mail size={16} /> {profile.email}
          </a>
          <Link href="/projects" className="btn-glass">
            See the case studies
          </Link>
        </div>
      </Reveal>

      <section className="mt-20" aria-labelledby="services">
        <Reveal>
          <h2 id="services" className="headline !text-[1.5rem]">
            What I build
          </h2>
        </Reveal>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.name} delay={(i % 3) * 0.05} className="h-full">
              <article className="glass-card flex h-full flex-col p-6">
                <h3 className="headline">{s.name}</h3>
                <p className="mt-2 flex-1 text-[0.9375rem] leading-[1.55] text-label-2">{s.body}</p>
                <ul className="mt-5 flex flex-wrap gap-1.5 border-t hairline pt-4">
                  {s.proof.map((p) => (
                    <li key={p.label}>
                      {p.href.startsWith("http") ? (
                        <a href={p.href} target="_blank" rel="noreferrer" className="token inline-flex items-center gap-1 hover:!text-label">
                          {p.label} <ArrowUpRight size={11} aria-hidden />
                        </a>
                      ) : (
                        <Link href={p.href} className="token inline-flex items-center gap-1 hover:!text-label">
                          {p.label} <ArrowUpRight size={11} aria-hidden />
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-20" aria-labelledby="how">
        <Reveal>
          <h2 id="how" className="headline !text-[1.5rem]">
            How I work
          </h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([name, body], i) => (
              <li key={name} className="border-l-2 border-accent pl-4">
                <p className="display-num text-[1.75rem] leading-none text-label-3">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="headline mt-3 !text-[1.0625rem]">{name}</h3>
                <p className="mt-1.5 text-[0.9375rem] leading-[1.55] text-label-2">{body}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <section className="mt-20 max-w-4xl" aria-labelledby="faq">
        <Reveal>
          <h2 id="faq" className="headline !text-[1.5rem]">
            Questions
          </h2>
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
      </section>
    </div>
  );
}
