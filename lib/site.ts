import { profile } from "@/lib/profile";

/**
 * The canonical origin, with no trailing slash. Set NEXT_PUBLIC_SITE_URL in the
 * host's environment before deploying: canonical links, the sitemap, robots.txt
 * and the social card all read it, and a wrong value points them at the wrong
 * place. The fallback only keeps local builds working.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const SITE_NAME = `${profile.name} · Portfolio`;

/**
 * Terms a person would actually type when looking for someone like Pooja.
 * Search engines mostly ignore the keywords tag, but assistants that read the
 * page still use it as a summary of what this site is about.
 */
export const KEYWORDS = [
  "Pooja Verma",
  "Pooja Verma portfolio",
  "computing science student",
  "Thompson Rivers University",
  "Kamloops BC developer",
  "software developer portfolio",
  "full-stack developer",
  "React developer",
  "TypeScript",
  "Next.js",
  "Python developer",
  "machine learning",
  "applied AI",
  "retrieval augmented generation",
  "RAG systems",
  "LLM evaluation",
  "CNN research",
  "data analytics",
  "SQL",
  "Snowflake",
  "Salesforce Apex LWC",
  "Power Apps",
  "Power BI",
  "Mitacs intern",
  "undergraduate research assistant",
  "co-op student developer",
  "software engineering internship 2026",
];

/** One sentence that has to work as a search result, a link preview and an answer. */
export const SITE_DESCRIPTION =
  "Pooja Verma is a computing science student at Thompson Rivers University in Kamloops, BC, building full-stack products, applied AI and data systems. Mitacs research intern at PataBid, UREAP and TRU sustainability research award winner, with work serving 3,000+ students and 4,000+ retailers.";

/** Schema.org graph: who this is, what the site is, and what she has done. */
export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: profile.name,
        url: SITE_URL,
        email: `mailto:${profile.email}`,
        telephone: profile.phone,
        jobTitle: "Computing Science Student and Software Developer",
        description: SITE_DESCRIPTION,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Kamloops",
          addressRegion: "BC",
          addressCountry: "CA",
        },
        alumniOf: {
          "@type": "CollegeOrUniversity",
          name: profile.school,
        },
        knowsAbout: [
          "Full-stack development",
          "Applied machine learning",
          "Retrieval-augmented generation",
          "Data engineering",
          "Salesforce platform development",
        ],
        knowsLanguage: "en",
        sameAs: [profile.github, profile.linkedin, profile.leetcode],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#person` },
      },
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#profilepage`,
        url: SITE_URL,
        name: SITE_NAME,
        about: { "@id": `${SITE_URL}/#person` },
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
    ],
  };
}
