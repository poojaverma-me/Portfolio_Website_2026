import { profile } from "@/lib/profile";
import { projects } from "@/lib/projects";
import { socials } from "@/lib/socials";

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
export const SITE_TITLE = `${profile.name} · AI Developer in Kamloops, BC, Canada`;

/** Under 160 characters, so it survives as a search snippet and a link preview. */
export const SITE_DESCRIPTION =
  `Award-winning AI developer in Kamloops, BC: RAG assistants, LLM products, ML models and AI automation, with a Best Paper Award and ${projects.length} case studies.`;

/**
 * The longer, factual summary that structured data and AI assistants use.
 * Every claim here is on the page and in Pooja's resume.
 */
export const SITE_SUMMARY =
  `Pooja Verma is an AI developer and machine learning researcher based in Kamloops, British Columbia, Canada, completing a Bachelor of Computing Science at Thompson Rivers University (December 2026). She builds retrieval-augmented generation (RAG) assistants, LLM-powered products, machine learning models and the full-stack software around them. She is first author of a peer-reviewed deep learning paper on diabetic retinopathy detection (98.2% accuracy on APTOS 2019) that won a Best Paper Award, holds a UREAP Research Award and a TRU Student Sustainability Research Grant, and was a Mitacs-funded research intern at PataBid. Since 2024 she has trained frontier large language models at Outlier (Scale AI), designing coding benchmarks, RLHF and fine-tuning data. She explains AI launches on her YouTube channel, Beyond Prompt, and in the Benchmarked newsletter. Her systems have served 3,000+ students and 4,000+ retailers, and her portfolio documents ${projects.length} projects with measured results. She works with teams in Kamloops, across British Columbia and across Canada, in person or remotely, is open to relocation, and is available for full-time roles and AI projects.`;

/**
 * What the site is about, for the assistants that still read the keywords tag
 * as a summary. Search engines mostly ignore it; the page copy does the work.
 */
export const KEYWORDS = [
  "Pooja Verma",
  "AI developer British Columbia",
  "AI developer Canada",
  "AI developer BC",
  "hire an AI developer in Canada",
  "AI developer Kamloops",
  "AI developer in Kamloops BC",
  "Kamloops AI developer",
  "AI consultant Kamloops",
  "AI solutions Kamloops",
  "machine learning engineer Kamloops",
  "award-winning AI developer",
  "Best Paper Award diabetic retinopathy",
  "AI workflow automation",
  "AI pipelines",
  "LLM fine-tuning",
  "Outlier AI",
  "Scale AI",
  "Beyond Prompt YouTube",
  "machine learning engineer British Columbia",
  "LLM developer Canada",
  "RAG developer Canada",
  "generative AI developer",
  "AI researcher British Columbia",
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
  "Mitacs Business Strategy Internship",
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
  ["Generative artificial intelligence", "Generative_artificial_intelligence"],
  ["Retrieval-augmented generation", "Retrieval-augmented_generation"],
  ["Natural language processing", "Natural_language_processing"],
  ["Semantic search", "Semantic_search"],
  ["Reinforcement learning from human feedback", "Reinforcement_learning_from_human_feedback"],
  ["Fine-tuning", "Fine-tuning_(deep_learning)"],
  ["AI agents", "Intelligent_agent"],
  ["Medical image computing", "Medical_image_computing"],
  ["Diabetic retinopathy", "Diabetic_retinopathy"],
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
        disambiguatingDescription: "AI developer and machine learning researcher in Kamloops, British Columbia, Canada",
        description: SITE_SUMMARY,
        hasOccupation: {
          "@type": "Occupation",
          name: "AI developer and machine learning researcher",
          occupationLocation: [
            { "@type": "City", name: "Kamloops, British Columbia" },
            { "@type": "AdministrativeArea", name: "British Columbia, Canada" },
          ],
          skills: profile.skills.join(", "),
        },
        homeLocation: KAMLOOPS,
        address: KAMLOOPS.address,
        // a current student, so TRU is an affiliation, not alma mater
        affiliation: TRU,
        memberOf: TRU,
        worksFor: [
          {
            "@type": "Organization",
            name: "Outlier",
            url: "https://outlier.ai",
            parentOrganization: { "@type": "Organization", name: "Scale AI", url: "https://scale.com" },
            description: "Generative AI data specialist: coding benchmarks, RLHF and fine-tuning data for frontier LLMs",
          },
        ],
        award: [
          "Best Paper Award, for \"Optimized Deep Learning Framework for Diabetic Retinopathy Detection and Classification Using Fundus Imaging\" (2026)",
          "Mitacs Business Strategy Internship (2026), research internship at PataBid",
          "UREAP Research Award, Thompson Rivers University ($6,000), for automated diabetic retinopathy detection, published in the Inspire Health Journal (2026)",
          "TRU Student Sustainability Research Grant ($2,500), for AI-driven post-wildfire ecosystem recovery research",
        ],
        knowsAbout: TOPICS,
        knowsLanguage: "en",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "AI projects, research collaborations and grant-funded work",
          email: profile.email,
          areaServed: ["Kamloops", "CA-BC", "CA"],
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
              { "@type": "City", name: "Kamloops" },
              { "@type": "AdministrativeArea", name: "British Columbia" },
              { "@type": "Country", name: "Canada" },
            ],
            provider: { "@id": person },
          },
        },
        sameAs: socials.map((s) => s.href),
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
        description:
          "Fused CNN (AlexNet) and Swin Transformer features that detect diabetic retinopathy in fundus images, 98.2% accuracy on APTOS 2019.",
        funder: { "@type": "Organization", name: "UREAP Research Award, Thompson Rivers University" },
        parentOrganization: TRU,
        member: { "@id": person },
        subjectOf: { "@id": `${SITE_URL}/#paper-retinopathy` },
      },
      {
        "@type": "ScholarlyArticle",
        "@id": `${SITE_URL}/#paper-retinopathy`,
        headline:
          "Optimized Deep Learning Framework for Diabetic Retinopathy Detection and Classification Using Fundus Imaging",
        author: [
          { "@id": person },
          { "@type": "Person", name: "Ghazanfar Latif" },
          { "@type": "Person", name: "Jaspreet Kaur" },
          { "@type": "Person", name: "Mohsin Butt" },
        ],
        datePublished: "2026-01-05",
        isPartOf: { "@type": "PublicationIssue", issueNumber: "1", isPartOf: { "@type": "PublicationVolume", volumeNumber: "1", isPartOf: { "@type": "Periodical", name: "Inspire Health Journal" } } },
        pagination: "42-62",
        publisher: { "@type": "Organization", name: "Inspire Academic Press Inc." },
        award: "Best Paper Award",
        sameAs: "https://doi.org/10.65718/inspireHealth.2026.2005",
        url: "https://doi.org/10.65718/inspireHealth.2026.2005",
        identifier: { "@type": "PropertyValue", propertyID: "DOI", value: "10.65718/inspireHealth.2026.2005" },
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

/** BreadcrumbList for a page: [name, path] pairs from the home page down. */
export function breadcrumbs(trail: [string, string][]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${SITE_URL}${path}`,
    })),
  };
}
