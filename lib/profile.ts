export const profile = {
  name: "Pooja Verma",
  role: "Computing Science Student",
  school: "Thompson Rivers University",
  location: "Kamloops, BC",
  email: "pooja32verma@gmail.com",
  phone: "778-586-7091",
  github: "https://github.com/poojaverma-me",
  linkedin: "https://www.linkedin.com/in/poojav3rma",
  leetcode: "https://leetcode.com/sugaryeuphoria/",
  headline: ["I don't just write code.", "I ship experiences."],
  intro:
    "Computing science student at Thompson Rivers University working across full-stack development, applied AI, and data. I shipped a PDF rendering engine for a construction estimating platform, trained models for post-wildfire recovery research, and built systems that serve 3,000+ students and 4,000+ retailers.",
  skills: [
    "Python",
    "JavaScript",
    "TypeScript",
    "C#",
    "Java",
    "Apex",
    "SQL",
    "MATLAB",
    "PyTorch",
    "scikit-learn",
    "XGBoost",
    "LightGBM",
    "SHAP",
    "Optuna",
    "RAG Systems",
    "RLHF",
    "pandas",
    "NumPy",
    "SciPy",
    "React",
    "Node.js",
    "LWC",
    "REST APIs",
    "Salesforce",
    "SOQL",
    "Power Apps",
    "Power BI",
    "Snowflake",
    "Oracle",
    "Matillion",
    "Git",
    "GitHub Actions",
    "LaTeX",
  ],
};

export type Experience = {
  company: string;
  role: string;
  period: string;
  location: string;
  /** Some roles speak for themselves; those carry no bullets. */
  points?: string[];
  tags: string[];
};

export const experience: Experience[] = [
  {
    company: "PataBid",
    role: "Junior Research Intern, Mitacs BSI",
    period: "Jan 2026 – Sep 2026",
    location: "Remote",
    points: [
      "Spearheaded end to end development of a high-performance PDF rendering engine for the core construction estimating platform, shipping key features ahead of target milestones.",
      "Integrated the Nutrient (PSPDFKit) SDK into the enterprise JavaScript codebase, working directly with external vendor engineers to diagnose defects and land upstream fixes.",
      "Built automated data pipelines and training scripts to deploy an AI-driven takeoff and stamp detection model, streamlining estimation workflows for platform users.",
    ],
    tags: ["JavaScript", "PDF Rendering", "PSPDFKit", "Data Pipelines"],
  },
  {
    company: "Thompson Rivers University",
    role: "Undergraduate Student Researcher, Sustainability Research Grant",
    period: "Apr 2026 – Present",
    location: "Kamloops, BC (Remote)",
    points: [
      "Won a competitive $2,500 grant to develop AI-Driven Post-Wildfire Ecosystem Recovery, a machine learning framework predicting vegetation regrowth and optimizing reforestation planning.",
      "Harmonized six environmental datasets into a 2,600 sample master dataset with 32 engineered features across six BEC zones.",
      "Benchmarked five classifiers with SMOTE and Optuna tuning, landing on LightGBM at 0.707 weighted F1 with SHAP interpretability, then engineered a native species recommender and authored the LaTeX paper.",
    ],
    tags: ["LightGBM", "Optuna", "SHAP", "SMOTE", "Geospatial data"],
  },
  {
    company: "Outlier",
    role: "Generative AI Data Specialist",
    period: "Oct 2025 – Present",
    location: "San Francisco, CA (Remote)",
    points: [
      "Designed complex coding benchmarks and multi-turn reasoning prompts to fine-tune frontier LLMs through reinforcement learning from human feedback.",
      "Red-teamed model reasoning chains across advanced algorithmic problems, judging responses on hallucination resistance, factual correctness and alignment.",
      "Curated synthetic datasets and step by step code rationales in Python and JavaScript to sharpen supervised fine-tuning workflows.",
    ],
    tags: ["RLHF", "LLM evaluation", "Python", "JavaScript"],
  },
  {
    company: "Sylvan Learning",
    role: "Mathematics Tutor",
    period: "May 2025 – Jun 2026",
    location: "Kamloops, BC",
    points: [
      "Delivered individualized mathematics instruction to 25+ students across algebra, geometry and calculus.",
      "Designed diagnostic assessments and personalized learning plans, yielding measurable gains in test scores and problem-solving confidence.",
      "Tracked progress and reported milestones and growth areas directly to academic directors and parents.",
    ],
    tags: ["Mathematics", "Assessment design", "Mentoring"],
  },
  {
    company: "Thompson Rivers University",
    role: "Research Coach",
    period: "Jan 2026 – May 2026",
    location: "Kamloops, BC (Hybrid)",
    points: [
      "Mentored undergraduate researchers on scientific methodology, data preparation pipelines and literature reviews across STEM disciplines.",
      "Guided students on experimental design, statistical validation and reproducibility standards for grant-funded institutional projects.",
      "Ran technical writing workshops and presentation rehearsals to prepare cohorts for academic conferences and grant competitions.",
    ],
    tags: ["Research methods", "Mentoring", "Technical writing"],
  },
  {
    company: "Thompson Rivers University",
    role: "Undergraduate Teaching Assistant",
    period: "Jan 2024 – Apr 2026, three terms",
    location: "Kamloops, BC",
    points: [
      "Mentored 150+ undergraduate students across core computing science coursework in Python, Java, data structures and web development, focusing on algorithmic logic and clean architecture.",
      "Ran weekly lab sessions and code reviews that enforced Git version control, test-driven logic and documentation practice.",
      "Marked weekly programming assignments and midterms, giving feedback specific enough to act on.",
    ],
    tags: ["Teaching", "Python", "Java", "Data structures"],
  },
  {
    company: "Thompson Rivers University",
    role: "Undergraduate Student Researcher, UREAP Scholarship",
    period: "Apr 2025 – Nov 2025",
    location: "Kamloops, BC (Hybrid)",
    points: [
      "Won a $6,000 UREAP scholarship to develop CNN architectures for automated diabetic retinopathy detection from fundus imagery.",
      "Implemented domain-specific image preprocessing, contrast normalization and transfer learning architectures to lift multi-class classification accuracy.",
      "Authored the technical documentation, experiment tracking logs and reproducible repositories that keep the results checkable.",
    ],
    tags: ["CNNs", "PyTorch", "Transfer learning", "Medical imaging"],
  },
  {
    company: "Outlier",
    role: "Tier-3 Programmer Analyst, freelance",
    period: "Nov 2024 – Oct 2025",
    location: "San Francisco, CA (Remote)",
    points: [
      "Benchmarked and debugged 100+ code submissions, isolating edge-case failures, runtime bugs and algorithmic inefficiencies across diverse language tasks.",
      "Authored test suites, reference implementations and corrective feedback to train generative models on strict execution standards.",
      "Evaluated model outputs on accuracy, precision and F1 to surface systemic training regressions.",
    ],
    tags: ["Debugging", "Test suites", "Model evaluation"],
  },
  {
    company: "Thompson Rivers University",
    role: "Undergraduate Research Assistant, RAG Systems",
    period: "May 2025 – Jul 2025",
    location: "Kamloops, BC (Hybrid)",
    points: [
      "Engineered an end to end Retrieval-Augmented Generation system using semantic search and transformer-based retrieval, increasing response relevance by 40%.",
      "Scaled the deployment to 3,000+ university students, deflecting 35% of repetitive instructor questions through context-aware answers.",
      "Benchmarked vector embeddings and chunking strategies to cut retrieval latency while keeping answers aligned to the course curriculum.",
    ],
    tags: ["RAG", "Semantic search", "Transformers", "Vector DB"],
  },
  {
    company: "British Columbia Lottery Corporation",
    role: "Software Engineering Co-op, Programmer Analyst",
    period: "May 2024 – Jan 2025",
    location: "Kamloops, BC (Hybrid)",
    points: [
      "Developed scalable enterprise solutions using Apex, SOQL, Lightning Web Components and automated flows for 4,000+ lottery retailers across Canada.",
      "Automated licensing and operational reporting workflows with Power Apps and Power BI, cutting manual processing overhead by 30%.",
      "Co-engineered and launched an internal employee check-in platform with fellow co-op engineers, supporting 1,000+ staff.",
    ],
    tags: ["Salesforce", "Apex", "SOQL", "LWC", "Power Apps", "Power BI"],
  },
  {
    company: "Shivam Echotech India",
    role: "Administrative Assistant and Customer Care Representative",
    period: "Aug 2018 – Dec 2023",
    location: "India",
    points: [
      "Handled customer inquiries and account service requests across 50+ daily client interactions, resolving most on first contact.",
      "Maintained digital record-keeping systems and database entries with strict data integrity, speeding up record retrieval.",
      "Coordinated between clients and operational teams to resolve service escalations.",
    ],
    tags: ["Customer service", "Data entry", "Coordination"],
  },
];

export type ResearchItem = {
  title: string;
  venue: string;
  year: string;
  status: string;
  summary: string;
};

export const research: ResearchItem[] = [
  {
    title: "AI-Driven Post-Wildfire Ecosystem Recovery",
    venue:
      "TRU Student Sustainability Research Grant ($2,500) · Supervised by Dr. Ghazanfar Latif",
    year: "2026",
    status: "In progress",
    summary:
      "Won a competitive $2,500 grant to build a machine learning framework for vegetation recovery and reforestation planning across the Thompson-Okanagan. Merged six environmental datasets into a reproducible 2,600 record master set with 32 engineered features over six BEC zones, benchmarked five classifiers with SMOTE oversampling and Optuna tuning, and landed on LightGBM at 0.707 weighted F1. SHAP named burn severity the dominant predictor. Shipped a native species recommender, wrote the paper in LaTeX, and presented it at the TRU Sustainability Conference.",
  },
  {
    title:
      "Automated Diabetic Retinopathy Detection from Fundus Images using CNNs",
    venue: "UREAP Research Award ($6,000) · Thompson Rivers University",
    year: "2025",
    status: "Completed",
    summary:
      "Won a $6,000 UREAP scholarship to develop CNN architectures that flag diabetic retinopathy in fundus imagery. Applied domain-specific preprocessing and contrast normalization, benchmarked transfer learning architectures, and kept experiment logs and repositories reproducible.",
  },
  {
    title: "Pedagogy-Aligned RAG for Student Support at Scale",
    venue: "Thompson Rivers University",
    year: "2025",
    status: "Deployed",
    summary:
      "A Retrieval-Augmented Generation system combining semantic search with transformer-based retrieval. Improved response relevance by 40% and cut repetitive instructor questions by 35% across 3,000+ students.",
  },
];

export type VolunteerItem = {
  role: string;
  org: string;
  period: string;
  /** The cause each one sits under, in LinkedIn's own words */
  cause: string;
  /** Only the club gets a line of its own; the rest read as a list */
  detail?: string;
  featured?: boolean;
};

export const volunteering: VolunteerItem[] = [
  {
    role: "Co-Founder and Vice-President",
    org: "TRUSU Combat Robotics Club",
    period: "Jan 2024 – Present",
    cause: "Science and Technology",
    detail:
      "Co-founded TRU's first combat robotics club and stepped into the lead when it hit leadership gaps, guiding the technical projects and keeping members building and competing.",
    featured: true,
  },
  {
    role: "Registration and demographics",
    org: "TRU IDAYS · Thompson Rivers University",
    period: "2023 – 2025",
    cause: "Arts and Culture",
  },
  {
    role: "Registration",
    org: "Indigenous Vendor Showcase · BCLC",
    period: "Nov 2024",
    cause: "Economic Empowerment",
  },
  {
    role: "Registration",
    org: "ICICET25 · Canadian Association for AI and Future Studies",
    period: "Aug 2025",
    cause: "Science and Technology",
  },
  {
    role: "Registration",
    org: "5K Foam Fest · 365 Sports",
    period: "Jun 2025",
    cause: "Economic Empowerment",
  },
  {
    role: "Web design",
    org: "Child Help Foundation",
    period: "Volunteer",
    cause: "Social Services",
  },
];
