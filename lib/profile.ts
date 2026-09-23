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
    "TypeScript",
    "JavaScript",
    "React",
    "C#",
    "SQL",
    "Snowflake",
    "Oracle",
    "Matillion",
    "Machine Learning",
    "scikit-learn",
    "XGBoost",
    "LightGBM",
    "SHAP",
    "pandas",
    "NumPy",
    "SciPy",
    "Matplotlib",
    "MATLAB",
    "Tableau",
    "Power BI",
    "Power Apps",
    "Salesforce",
    "Git",
    "GitHub Actions",
    "REST APIs",
  ],
};

export type Experience = {
  company: string;
  role: string;
  period: string;
  location: string;
  points: string[];
  tags: string[];
};

export const experience: Experience[] = [
  {
    company: "PataBid",
    role: "Junior Research Intern, Mitacs BSI",
    period: "Jan 2026 – Sep 2026",
    location: "Okotoks, AB",
    points: [
      "Owned end to end development of a new PDF rendering engine for the company's construction estimating platform, delivering every milestone of the 8-month Mitacs-funded placement ahead of schedule.",
      "Integrated the Nutrient (PSPDFKit) SDK into an existing JavaScript codebase and worked directly with the vendor to diagnose defects and drive fixes.",
      "Authored the scripts and data pipelines that trained an AI model behind automated stamp and take-off detection inside the estimating workflow.",
      "Reported progress to the CTO, maintained the technical documentation, and resolved merge conflicts and regressions so new work shipped without breaking what already ran.",
    ],
    tags: ["JavaScript", "PDF Rendering", "PSPDFKit", "Data Pipelines"],
  },
  {
    company: "Outlier.AI",
    role: "LLM Model Trainer (Freelance)",
    period: "Nov 2025 – Present",
    location: "San Francisco, CA (Remote)",
    points: [
      "Trained and evaluated 100+ LLMs for accuracy, precision, fluency, correctness, and F1 score across diverse tasks.",
      "Delivered corrective feedback on 100+ code issues, raising model performance on the tasks I reviewed.",
    ],
    tags: ["LLMs", "Model Evaluation", "Python"],
  },
  {
    company: "Thompson Rivers University",
    role: "Undergraduate Research Assistant",
    period: "May – Jul 2025",
    location: "Kamloops, BC",
    points: [
      "Developed a Retrieval-Augmented Generation (RAG) system delivering context-aware, pedagogy-aligned responses to student queries.",
      "Integrated semantic search and transformer-based retrieval, improving response relevance by 40%.",
      "Scaled the system to 3,000+ students, reducing repetitive instructor questions by 35%.",
    ],
    tags: ["RAG", "Semantic Search", "Transformers"],
  },
  {
    company: "British Columbia Lottery Corporation",
    role: "Programmer Analyst Co-op",
    period: "May 2024 – Jan 2025",
    location: "Kamloops, BC",
    points: [
      "Built scalable Salesforce solutions with Apex, LWC, and automation flows for 4,000+ retailers across Canada, standardizing reporting and workflows.",
      "Automated licensing workflows with Power Apps and Power BI, cutting manual tasks by 30% and supporting digital transformation.",
      "Built an employee check-in system now used by 1,000+ employees, pairing with another co-op student through the build.",
    ],
    tags: ["Salesforce", "Apex", "LWC", "Power Apps", "Power BI"],
  },
  {
    company: "Thompson Rivers University",
    role: "Undergraduate Teaching Assistant",
    period: "Jan – May 2024 · Feb – Apr 2025",
    location: "Kamloops, BC",
    points: [
      "Taught lab sections in HTML, CSS, JavaScript, Java, Python, and data structures, holding students to clean code and clear logic.",
      "Coached students on documentation and version control so their work stayed readable and maintainable.",
    ],
    tags: ["Teaching", "JavaScript", "Python", "Java"],
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
      "Won a $6,000 UREAP scholarship to train CNN models that flag diabetic retinopathy in fundus images. Applied domain-specific preprocessing, reviewed the literature, benchmarked transfer learning against hybrid architectures, and documented the work so another student could reproduce it.",
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
