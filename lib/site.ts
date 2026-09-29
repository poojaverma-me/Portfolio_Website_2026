import { profile } from "@/lib/profile";

/**
 * The canonical origin, with no trailing slash. Canonical links, the sitemap,
 * robots.txt, the social card and the structured data all read it.
 * NEXT_PUBLIC_SITE_URL overrides it (for a preview deployment, say); local
 * development falls back to localhost so links work on your machine.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production" ? "https://www.poojaverma.ca" : "http://localhost:3000")
).replace(/\/$/, "");

export const SITE_NAME = `${profile.name} · Portfolio`;

/** Under 60 characters, so a search result shows all of it. */
export const SITE_TITLE = `${profile.name} · AI Developer and Researcher in Kamloops, BC`;

/** Under 160 characters, so it survives as a search snippet and a link preview. */
export const SITE_DESCRIPTION =
  "AI developer and machine learning researcher in Kamloops, British Columbia, building RAG systems, LLM evaluation and full-stack products at TRU.";

/**
 * The longer, factual summary that structured data and AI assistants use.
 * Every claim here is on the page and in Pooja's resume.
 */
export const SITE_SUMMARY =
  "Pooja Verma is an AI developer and machine learning researcher in Kamloops, British Columbia, and a computing science student at Thompson Rivers University. She builds retrieval-augmented generation (RAG) systems, evaluates and fine-tunes large language models, and ships full-stack and data products. Mitacs research intern at PataBid; holder of a UREAP Research Award and a TRU Student Sustainability Research Grant; her systems serve 3,000+ students and 4,000+ retailers. She is open to AI development projects, applied ML research, grant-funded work and collaborations across BC and Canada.";

/**
 * What the site is about, for the assistants that still read the keywords tag
 * as a summary. Search engines mostly ignore it; the page copy does the work.
 */
export const KEYWORDS = [
  "Pooja Verma",
  "AI developer Kamloops",
  "AI developer British Columbia",
  "AI developer Canada",
  "machine learning researcher British Columbia",
  "machine learning developer Kamloops",
  "Thompson Rivers University AI research",
  "TRU computing science",
  "applied AI",
  "large language models",
  "LLM evaluation",
  "RLHF",
  "retrieval augmented generation",
  "RAG systems",
  "computer vision",
  "CNN research",
  "Mitacs research intern",
  "UREAP research award",
  "full-stack developer",
  "Python",
  "TypeScript",
  "React",
  "Next.js",
  "data engineering",
  "Salesforce Apex LWC",
];

const TRU = {
  "@type": "CollegeOrUniversity",
  "@id": "https://www.tru.ca/#organization",
  name: "Thompson Rivers University",
  url: "https://www.tru.ca",
  sameAs: "https://en.wikipedia.org/wiki/Thompson_Rivers_University",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kamloops",
    addressRegion: "BC",
    addressCountry: "CA",
  },
};

const KAMLOOPS = {
  "@type": "Place",
  name: "Kamloops, British Columbia, Canada",
  sameAs: "https://en.wikipedia.org/wiki/Kamloops",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kamloops",
    addressRegion: "BC",
    addressCountry: "CA",
  },
};

/** Topics, each tied to the concept it names, so machines can't mistake them. */
const TOPICS = [
  ["Artificial intelligence", "Artificial_intelligence"],
  ["Machine learning", "Machine_learning"],
  ["Large language models", "Large_language_model"],
  ["Retrieval-augmented generation", "Retrieval-augmented_generation"],
  ["Reinforcement learning from human feedback", "Reinforcement_learning_from_human_feedback"],
  ["Computer vision", "Computer_vision"],
  ["Convolutional neural networks", "Convolutional_neural_network"],
  ["Gradient boosting", "Gradient_boosting"],
  ["Data engineering", "Data_engineering"],
  ["Web development", "Web_development"],
  ["Salesforce", "Salesforce"],
].map(([name, wiki]) => ({ "@type": "Thing", name, sameAs: `https://en.wikipedia.org/wiki/${wiki}` }));

/** Schema.org graph: who this is, what she does, what she has won and built. */
export function personSchema() {
  const person = `${SITE_URL}/#person`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": person,
        name: profile.name,
        url: SITE_URL,
        image: `${SITE_URL}/hero-portrait.webp`,
        email: `mailto:${profile.email}`,
        telephone: profile.phone,
        jobTitle: "AI Developer and Machine Learning Researcher",
        description: SITE_SUMMARY,
        hasOccupation: {
          "@type": "Occupation",
          name: "AI developer and machine learning researcher",
          occupationLocation: { "@type": "AdministrativeArea", name: "British Columbia, Canada" },
          skills: profile.skills.join(", "),
        },
        homeLocation: KAMLOOPS,
        address: KAMLOOPS.address,
        affiliation: TRU,
        alumniOf: TRU,
        worksFor: [
          { "@type": "Organization", name: "PataBid", description: "Mitacs Business Strategy Internship, junior research intern" },
          { "@type": "Organization", name: "Outlier", description: "Generative AI data specialist" },
        ],
        award: [
          "UREAP Research Award, Thompson Rivers University ($6,000), for automated diabetic retinopathy detection with CNNs",
          "TRU Student Sustainability Research Grant ($2,500), for AI-driven post-wildfire ecosystem recovery research",
        ],
        knowsAbout: TOPICS,
        knowsLanguage: "en",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "AI projects, research collaborations and grant-funded work",
          email: profile.email,
          areaServed: ["CA-BC", "CA"],
          availableLanguage: "en",
        },
        makesOffer: {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "AI development and applied machine learning",
            description:
              "RAG systems, LLM evaluation, machine learning models and full-stack AI products, for projects, research and grants in British Columbia and across Canada.",
            areaServed: [
              { "@type": "AdministrativeArea", name: "British Columbia" },
              { "@type": "Country", name: "Canada" },
            ],
            provider: { "@id": person },
          },
        },
        sameAs: [profile.github, profile.linkedin, profile.leetcode],
      },
      {
        "@type": "ResearchProject",
        "@id": `${SITE_URL}/#research-wildfire`,
        name: "AI-Driven Post-Wildfire Ecosystem Recovery",
        description:
          "LightGBM models over six merged environmental datasets (0.707 weighted F1) to predict ecosystem recovery after wildfire; presented at the TRU Sustainability Conference.",
        funder: { "@type": "Organization", name: "TRU Student Sustainability Research Grant" },
        parentOrganization: TRU,
        member: { "@id": person },
      },
      {
        "@type": "ResearchProject",
        "@id": `${SITE_URL}/#research-retinopathy`,
        name: "Automated Diabetic Retinopathy Detection",
        description: "Convolutional neural networks that grade diabetic retinopathy from fundus images.",
        funder: { "@type": "Organization", name: "UREAP Research Award, Thompson Rivers University" },
        parentOrganization: TRU,
        member: { "@id": person },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "en-CA",
        publisher: { "@id": person },
      },
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#profilepage`,
        url: SITE_URL,
        name: SITE_TITLE,
        description: SITE_SUMMARY,
        inLanguage: "en-CA",
        dateModified: new Date().toISOString(),
        mainEntity: { "@id": person },
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
    ],
  };
}
