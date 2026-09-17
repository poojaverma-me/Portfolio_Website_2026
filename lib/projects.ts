export type ProjectSection = {
  id: string;
  label: string;
  title: string;
  body: string[];
  bullets?: string[];
  figures?: { caption: string; aspect?: "wide" | "tall" }[];
};

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  category: "AI / ML" | "Data" | "Security" | "Full-Stack";
  year: string;
  status: "Shipped" | "In Progress" | "Research";
  featured: boolean;
  stack: string[];
  metrics: { label: string; value: string }[];
  links: { github?: string; live?: string };
  sections: ProjectSection[];
};

export const projects: Project[] = [
  {
    slug: "rag-study-assistant",
    title: "RAG Study Assistant",
    tagline:
      "A Retrieval-Augmented Generation system answering student questions with context-aware, pedagogy-aligned responses.",
    category: "AI / ML",
    year: "2025",
    status: "Shipped",
    featured: true,
    stack: ["Python", "Transformers", "Semantic Search", "Vector DB", "React"],
    metrics: [
      { label: "Students served", value: "3,000+" },
      { label: "Relevance gain", value: "+40%" },
      { label: "Repetitive questions", value: "-35%" },
    ],
    links: { github: "https://github.com/poojaverma-me" },
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "Instructors answer the same questions over and over: assignment scope, deadline rules, concepts already covered in lecture. Built during my research assistantship at TRU, this system answers those questions automatically, and answers them the way an instructor would.",
          "It is a **Retrieval-Augmented Generation (RAG)** pipeline grounded in course material. Every response cites the source it retrieved from, and the tone follows the pedagogy of the course rather than generic chatbot phrasing.",
        ],
        figures: [{ caption: "FIG. 01 · Student query view with cited sources" }],
      },
      {
        id: "problem",
        label: "01 / Problem",
        title: "The Problem",
        body: [
          "Generic LLM chatbots fail in a classroom for two reasons: they hallucinate answers that contradict the course material, and they hand students full solutions when the instructor wants guided hints.",
          "The goal was a system that stays **grounded in the actual course content** and respects how instructors want students to learn.",
        ],
        bullets: [
          "Answers must come from course material, not model memory",
          "Responses follow pedagogy: hints and scaffolding before solutions",
          "Must scale to thousands of students without instructor babysitting",
        ],
      },
      {
        id: "architecture",
        label: "02 / Architecture",
        title: "Architecture",
        body: [
          "Course documents are chunked and embedded into a vector index. At query time, **semantic search** retrieves candidate passages, a transformer-based re-ranker orders them, and the generator composes a response constrained to the retrieved context.",
          "A pedagogy layer sits on top: prompts are templated per course policy, so a first-year programming course gives hints while a research seminar gives direct references.",
        ],
        figures: [
          {
            caption: "FIG. 02 · Pipeline: ingest, embed, retrieve, re-rank, generate",
            aspect: "wide",
          },
          { caption: "FIG. 03 · Pedagogy templates per course policy" },
        ],
      },
      {
        id: "evaluation",
        label: "03 / Evaluation",
        title: "Evaluation",
        body: [
          "Retrieval quality was measured against a hand-labeled set of real student questions. Integrating semantic search with transformer-based retrieval improved response relevance by **40%** over the keyword baseline.",
          "Instructor feedback loops flagged weak answers, and those flags fed directly back into chunking and re-ranking improvements.",
        ],
      },
      {
        id: "results",
        label: "04 / Results",
        title: "Results",
        body: [
          "The system scaled to **3,000+ students**, and repetitive instructor questions dropped by **35%**. Office hours shifted from restating logistics to actual teaching.",
        ],
        bullets: [
          "3,000+ students served across courses",
          "40% improvement in response relevance",
          "35% reduction in repetitive instructor questions",
        ],
      },
    ],
  },
  {
    slug: "retina-scan",
    title: "RetinaScan",
    tagline:
      "CNN models detecting diabetic retinopathy from fundus images, funded by a $6,000 UREAP research award.",
    category: "AI / ML",
    year: "2025",
    status: "Research",
    featured: true,
    stack: ["Python", "CNNs", "Transfer Learning", "NumPy", "Matplotlib"],
    metrics: [
      { label: "UREAP award", value: "$6,000" },
      { label: "Fundus images", value: "10k+" },
      { label: "Architectures tested", value: "7" },
    ],
    links: { github: "https://github.com/poojaverma-me" },
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "Diabetic retinopathy is a leading cause of preventable blindness, and early detection through fundus imaging is the difference-maker. For this project I was awarded a **$6,000 UREAP scholarship** at TRU to train CNN models that flag retinopathy automatically.",
          "The work covered the full research cycle: literature review, domain-specific preprocessing, model training, benchmarking, and documentation written for reproducibility.",
        ],
        figures: [
          { caption: "FIG. 01 · Fundus image samples across severity grades", aspect: "wide" },
        ],
      },
      {
        id: "method",
        label: "01 / Method",
        title: "Method",
        body: [
          "Fundus images need care before a model ever sees them: uneven illumination, lens artifacts, and class imbalance all skew training. The preprocessing pipeline applied **domain-specific normalization and augmentation** tuned to retinal imagery.",
          "On the modeling side, I applied **transfer learning and hybrid architectures**, benchmarking seven configurations against consistent evaluation criteria rather than chasing a single headline number.",
        ],
        bullets: [
          "Domain-specific preprocessing for retinal imagery",
          "Transfer learning from pretrained backbones",
          "Hybrid architectures benchmarked under one evaluation protocol",
        ],
      },
      {
        id: "experiments",
        label: "02 / Experiments",
        title: "Experiments",
        body: [
          "Every experiment was logged with its data split, preprocessing config, and metrics so results could be reproduced end to end. The benchmarking compared architectures on sensitivity and specificity, the numbers that matter clinically, not just raw accuracy.",
        ],
        figures: [
          { caption: "FIG. 02 · Benchmark comparison across architectures", aspect: "wide" },
          { caption: "FIG. 03 · Preprocessing stages on a sample fundus image" },
        ],
      },
      {
        id: "documentation",
        label: "03 / Documentation",
        title: "Documentation & Reproducibility",
        body: [
          "A core deliverable was **technical documentation ensuring data transparency and reproducibility**: dataset provenance, preprocessing decisions, and evaluation protocols are all written down so the next researcher can pick the work up without guessing.",
        ],
      },
      {
        id: "results",
        label: "04 / Results",
        title: "Results",
        body: [
          "The project delivered a benchmarked set of CNN approaches for retinopathy detection and a documented, reproducible pipeline. It also sharpened the analytical habits I now bring to every ML project: preprocess with domain knowledge, benchmark honestly, document everything.",
        ],
      },
    ],
  },
  {
    slug: "cryptosent",
    title: "CryptoSent",
    tagline:
      "A sentiment-driven market predictor connecting Twitter sentiment to stock price movements.",
    category: "Data",
    year: "2025",
    status: "Shipped",
    featured: true,
    stack: ["Python", "pandas", "NumPy", "SciPy", "SQL", "Snowflake", "Power BI"],
    metrics: [
      { label: "Tweets analyzed", value: "250k+" },
      { label: "Tickers tracked", value: "24" },
      { label: "Data pipeline", value: "Daily" },
    ],
    links: { github: "https://github.com/poojaverma-me" },
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "Markets move on mood as much as math. CryptoSent tests how far public sentiment can go as a predictive signal: it scores **Twitter sentiment with NLP techniques** and correlates it against stock price movements.",
        ],
        figures: [
          { caption: "FIG. 01 · Sentiment vs. price movement dashboard", aspect: "wide" },
        ],
      },
      {
        id: "pipeline",
        label: "01 / Pipeline",
        title: "Data Pipeline",
        body: [
          "Tweets are collected, cleaned, and scored in Python using **pandas, NumPy, and SciPy**. The scored data lands in **Snowflake**, where SQL handles the joining, grouping, and filtering that aligns sentiment windows with market data.",
          "Keeping the heavy lifting in SQL kept the Python layer simple: score, load, and analyze.",
        ],
        bullets: [
          "NLP sentiment scoring over 250k+ tweets",
          "Snowflake warehouse with SQL transformations",
          "Daily refresh aligning sentiment windows to trading days",
        ],
      },
      {
        id: "analysis",
        label: "02 / Analysis",
        title: "Analysis & Visualization",
        body: [
          "Statistical analysis in SciPy tested whether sentiment shifts lead price movements or just echo them. Findings were visualized in **Matplotlib and Power BI**, from correlation heatmaps down to per-ticker sentiment timelines.",
        ],
        figures: [
          { caption: "FIG. 02 · Correlation heatmap, sentiment vs. returns" },
          { caption: "FIG. 03 · Per-ticker sentiment timeline", aspect: "wide" },
        ],
      },
      {
        id: "results",
        label: "03 / Results",
        title: "Results",
        body: [
          "The strongest finding: sentiment spikes correlate with short-horizon volatility more reliably than with direction. The project became my template for data work: a clean warehouse, honest statistics, and visuals a non-technical reader can follow.",
        ],
      },
    ],
  },
  {
    slug: "quantum-safe-passwords",
    title: "Quantum Safe Password Manager",
    tagline:
      "A password generator and manager built on the Kyber algorithm, designed to survive quantum attacks.",
    category: "Security",
    year: "2025",
    status: "Shipped",
    featured: false,
    stack: ["Python", "CRYSTALS-Kyber", "Docker", "Cryptography"],
    metrics: [
      { label: "Encryption", value: "Post-quantum" },
      { label: "Key exchange", value: "Kyber" },
      { label: "Deployment", value: "Docker" },
    ],
    links: { github: "https://github.com/poojaverma-me" },
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "Most password managers rely on cryptography that a sufficiently powerful quantum computer could break. This project builds credential handling on the **Kyber algorithm**, a post-quantum key encapsulation mechanism, so stored secrets stay safe even against that future.",
        ],
        figures: [{ caption: "FIG. 01 · Vault interface and generator" }],
      },
      {
        id: "threat-model",
        label: "01 / Threat Model",
        title: "Threat Model",
        body: [
          "The design assumes an adversary who can record encrypted vaults today and decrypt them years later with quantum hardware, the harvest-now, decrypt-later attack. Defending against that means post-quantum primitives at the key-exchange layer, not just longer passwords.",
        ],
        bullets: [
          "Harvest-now, decrypt-later resistance",
          "Kyber-based key encapsulation for vault secrets",
          "No plaintext secrets ever touch disk",
        ],
      },
      {
        id: "architecture",
        label: "02 / Architecture",
        title: "Architecture",
        body: [
          "Encryption workflows and key management are **automated in Python**, wrapping Kyber key encapsulation around vault operations. The whole application is **containerised with Docker**, making deployment portable and keeping the crypto environment pinned and reproducible.",
        ],
        figures: [
          { caption: "FIG. 02 · Key encapsulation flow", aspect: "wide" },
        ],
      },
      {
        id: "results",
        label: "03 / Results",
        title: "Results",
        body: [
          "The result is a working, portable, quantum-resistant credential manager, and a deep dive into what it takes to design **cryptographically robust systems**: understanding the primitives, not just importing them.",
        ],
      },
    ],
  },
  {
    slug: "retail-licensing-automation",
    title: "Retail Licensing Automation",
    tagline:
      "Salesforce and Power Platform automation standardizing workflows for 4,000+ retailers across Canada.",
    category: "Full-Stack",
    year: "2024",
    status: "Shipped",
    featured: false,
    stack: ["Salesforce", "Apex", "LWC", "Power Apps", "Power BI"],
    metrics: [
      { label: "Retailers", value: "4,000+" },
      { label: "Manual tasks cut", value: "-30%" },
    ],
    links: {},
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "During my Programmer Analyst co-op at the British Columbia Lottery Corporation, I built **Salesforce solutions with Apex, LWC, and automation flows** serving 4,000+ retailers across Canada, standardizing how reporting and workflows happen at national scale.",
          "Details and screens here are representative: the real system is internal to BCLC.",
        ],
        figures: [{ caption: "FIG. 01 · Representative workflow console", aspect: "wide" }],
      },
      {
        id: "automation",
        label: "01 / Automation",
        title: "Licensing Automation",
        body: [
          "Licensing workflows that used to run on manual steps were rebuilt with **Power Apps and Power BI**, cutting manual tasks by **30%** and giving the business live visibility into pipeline state instead of end-of-week spreadsheets.",
        ],
        bullets: [
          "Apex and LWC components on the Salesforce platform",
          "Automation flows replacing manual handoffs",
          "Power BI dashboards for live workflow visibility",
        ],
      },
      {
        id: "results",
        label: "02 / Results",
        title: "Results",
        body: [
          "The work standardized reporting for 4,000+ retailers and became part of BCLC's broader digital transformation effort. It also taught me what enterprise-grade actually means: change management, permissions, and audits are features too.",
        ],
      },
    ],
  },
  {
    slug: "employee-check-in",
    title: "Employee Check-In System",
    tagline:
      "An internal check-in system built for 1,000+ BCLC employees, in collaboration with a fellow co-op.",
    category: "Full-Stack",
    year: "2024",
    status: "Shipped",
    featured: false,
    stack: ["Power Apps", "Power Automate", "SQL"],
    metrics: [
      { label: "Employees", value: "1,000+" },
      { label: "Built by", value: "2 co-ops" },
    ],
    links: {},
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "A two-person build with a fellow co-op at BCLC: an **employee check-in system for 1,000+ employees**. Simple on the surface, but reliability expectations are high when the whole building uses it daily.",
          "Screens shown here are representative placeholders: the production system is internal.",
        ],
        figures: [{ caption: "FIG. 01 · Check-in flow, representative screens" }],
      },
      {
        id: "build",
        label: "01 / Build",
        title: "The Build",
        body: [
          "We split the work cleanly: one of us owned the check-in flow and data model, the other owned notifications and reporting. Working as a pair taught me the collaboration habits, branch discipline, reviews, and shared documentation, that solo projects never force on you.",
        ],
        bullets: [
          "Check-in flow used by 1,000+ employees",
          "Automated notifications through Power Automate",
          "Reporting layer for facilities and admin teams",
        ],
      },
      {
        id: "results",
        label: "02 / Results",
        title: "Results",
        body: [
          "Adopted across the office and still in daily use after our co-op terms ended, which is the outcome I am proudest of: software that outlives its builders.",
        ],
      },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function featuredProjects(): Project[] {
  return projects.filter((p) => p.featured);
}
