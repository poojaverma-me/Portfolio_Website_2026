export const profile = {
  name: "Pooja Verma",
  role: "AI Developer and Researcher",
  school: "Thompson Rivers University",
  location: "Kamloops, BC",
  email: "pooja32verma@gmail.com",
  phone: "778-586-7091",
  github: "https://github.com/poojaverma-me",
  linkedin: "https://www.linkedin.com/in/poojav3rma/",
  x: "https://x.com/Poojav3rma",
  youtube: "https://www.youtube.com/@BeyondPromptOfficial",
  leetcode: "https://leetcode.com/sugaryeuphoria/",
  // the hero line: lead-in, the part set in the accent colour, then the rest
  headline: ["Delivering", "scalable, agentic AI solutions", "that plug into real workflows and drive measurable results."],
  intro:
    "AI developer and researcher building LLM systems, machine learning models and full-stack products, from wildfire-recovery research to tools used by 3,000+ students and 4,000+ retailers.",
  skills: [
    "RAG Systems",
    "RLHF",
    "LLM Evaluation",
    "Benchmark Design",
    "Gemini API",
    "Semantic Search",
    "Embeddings",
    "PyTorch",
    "scikit-learn",
    "XGBoost",
    "LightGBM",
    "SHAP",
    "Optuna",
    "CNNs",
    "Transfer Learning",
    "Python",
    "JavaScript",
    "TypeScript",
    "C#",
    "Java",
    "Apex",
    "SQL",
    "MATLAB",
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
    "Next.js",
    "Tailwind CSS",
    "Framer Motion",
    "Firebase",
    "Three.js",
    "React Three Fiber",
    "WebGL",
    "MapLibre",
    "Web Speech API",
    "PWAs",
    "Blender",
    "Vitest",
    "Vercel",
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
      "Built the PDF rendering engine at the core of a construction estimating platform, owning it end to end and shipping key features ahead of milestones.",
      "Integrated the Nutrient (PSPDFKit) SDK into the production JavaScript codebase, working directly with the vendor's engineers to diagnose defects and land fixes upstream.",
      "Automated the data pipelines and training scripts that deploy an AI model for take-off and stamp detection, streamlining how estimators process drawings.",
    ],
    tags: ["JavaScript", "PDF Rendering", "PSPDFKit", "Data Pipelines"],
  },
  {
    company: "Thompson Rivers University",
    role: "Undergraduate Student Researcher, Sustainability Research Grant",
    period: "Apr 2026 – Present",
    location: "Kamloops, BC (Remote)",
    points: [
      "Won a competitive $2,500 grant to predict how burned land in the Thompson-Okanagan recovers, and which native species to replant.",
      "Merged six environmental datasets into a 2,600-sample master set with 32 engineered features across six BEC zones.",
      "Benchmarked five classifiers with SMOTE and Optuna, selected LightGBM at 0.707 weighted F1, and used SHAP to show that burn severity drives recovery.",
      "Turned the study into After Fire, an interactive atlas, simulator and species recommender, and presented it at the TRU Sustainability Conference.",
    ],
    tags: ["LightGBM", "Optuna", "SHAP", "SMOTE", "Geospatial data"],
  },
  {
    company: "Outlier",
    role: "Generative AI Data Specialist",
    period: "Oct 2025 – Present",
    location: "San Francisco, CA (Remote)",
    points: [
      "Design coding benchmarks and multi-turn reasoning prompts used to fine-tune frontier LLMs through reinforcement learning from human feedback.",
      "Red-team model reasoning on advanced algorithmic problems, grading responses for hallucination, factual correctness and alignment.",
      "Write step-by-step code rationales and synthetic datasets in Python and JavaScript that feed supervised fine-tuning.",
    ],
    tags: ["RLHF", "LLM evaluation", "Python", "JavaScript"],
  },
  {
    company: "Sylvan Learning",
    role: "Mathematics Tutor",
    period: "May 2025 – Jun 2026",
    location: "Kamloops, BC",
    points: [
      "Taught algebra, geometry and calculus to 25+ students, each on a plan built from their own diagnostic assessment.",
      "Raised test scores and problem-solving confidence, tracking every student's progress and reporting it to academic directors and parents.",
    ],
    tags: ["Mathematics", "Assessment design", "Mentoring"],
  },
  {
    company: "Thompson Rivers University",
    role: "Research Coach",
    period: "Jan 2026 – May 2026",
    location: "Kamloops, BC (Hybrid)",
    points: [
      "Coached undergraduate researchers across STEM on methodology, data pipelines and literature reviews.",
      "Guided grant-funded projects on experimental design, statistical validation and reproducibility.",
      "Ran technical writing workshops and presentation rehearsals that prepared cohorts for conferences and grant competitions.",
    ],
    tags: ["Research methods", "Mentoring", "Technical writing"],
  },
  {
    company: "Thompson Rivers University",
    role: "Undergraduate Teaching Assistant",
    period: "Jan 2024 – Apr 2026, three terms",
    location: "Kamloops, BC",
    points: [
      "Mentored 150+ students in Python, Java, data structures and web development, with a focus on algorithmic thinking and clean design.",
      "Ran weekly labs and code reviews that made Git, testing and documentation everyday habits.",
      "Graded assignments and midterms with feedback specific enough to act on.",
    ],
    tags: ["Teaching", "Python", "Java", "Data structures"],
  },
  {
    company: "Thompson Rivers University",
    role: "Undergraduate Student Researcher, UREAP Scholarship",
    period: "Apr 2025 – Nov 2025",
    location: "Kamloops, BC (Hybrid)",
    points: [
      "Won a $6,000 UREAP award to detect diabetic retinopathy in retinal fundus images with deep learning.",
      "Fused CNN (AlexNet) and Swin Transformer features to reach 98.2% accuracy on APTOS 2019, published as first author in the Inspire Health Journal (2026).",
      "Kept every experiment reproducible with tracked logs, technical documentation and versioned repositories.",
    ],
    tags: ["CNNs", "Vision Transformers", "PyTorch", "Medical imaging"],
  },
  {
    company: "Outlier",
    role: "Tier-3 Programmer Analyst, freelance",
    period: "Nov 2024 – Oct 2025",
    location: "San Francisco, CA (Remote)",
    points: [
      "Debugged and benchmarked 100+ code submissions, isolating edge-case failures, runtime bugs and inefficient algorithms.",
      "Wrote test suites, reference solutions and corrective feedback that trained generative models to meet strict execution standards.",
      "Tracked model accuracy, precision and F1 to surface regressions across training runs.",
    ],
    tags: ["Debugging", "Test suites", "Model evaluation"],
  },
  {
    company: "Thompson Rivers University",
    role: "Undergraduate Research Assistant, RAG Systems",
    period: "May 2025 – Jul 2025",
    location: "Kamloops, BC (Hybrid)",
    points: [
      "Built an end-to-end retrieval-augmented generation assistant for course questions, raising answer relevance by 40% with semantic search and transformer-based retrieval.",
      "Rolled it out to 3,000+ students, where it answered 35% of the repetitive questions instructors had been handling by hand.",
      "Benchmarked embeddings and chunking strategies to cut retrieval latency while keeping answers aligned with the curriculum.",
    ],
    tags: ["RAG", "Semantic search", "Transformers", "Vector DB"],
  },
  {
    company: "British Columbia Lottery Corporation",
    role: "Software Engineering Co-op, Programmer Analyst",
    period: "May 2024 – Jan 2025",
    location: "Kamloops, BC (Hybrid)",
    points: [
      "Developed Salesforce solutions in Apex, SOQL, Lightning Web Components and automated flows for BCLC's network of 4,000+ lottery retailers.",
      "Automated licensing and operational reporting with Power Apps and Power BI, cutting manual processing by 30%.",
      "Co-built and launched an internal employee check-in platform with fellow co-op engineers, built for 1,000+ staff.",
    ],
    tags: ["Salesforce", "Apex", "SOQL", "LWC", "Power Apps", "Power BI"],
  },
  {
    company: "Shivam Echotech India",
    role: "Administrative Assistant and Customer Care Representative",
    period: "Aug 2018 – Dec 2023",
    location: "India",
    points: [
      "Resolved 50+ customer inquiries a day, closing most of them on first contact.",
      "Kept digital records and databases accurate, which made information faster to find.",
      "Coordinated between clients and operations teams to resolve service escalations.",
    ],
    tags: ["Customer service", "Data entry", "Coordination"],
  },
];

export type ResearchKind = "Paper" | "Presentation" | "Research project" | "Technical work";

export type ResearchItem = {
  title: string;
  /** what form the work took; an item can be several, e.g. a project that was also presented */
  kinds: ResearchKind[];
  /** funding, course, supervisor or venue, as one line */
  venue: string;
  year: string;
  status: "Published" | "Presented" | "In progress" | "Completed" | "Deployed";
  /** the question that started it, told first */
  hook: string;
  summary: string;
  links?: { label: string; href: string }[];
  /** the card's cover photo */
  cover: { src: string; alt: string };
  /** a screen of the work, layered over the cover */
  screen?: string;
};

// Unsplash photos, cropped to the card's 4:3 cover by Unsplash's image CDN
const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1100&h=825&fit=crop&q=70&auto=format`;

/**
 * Research, published work first, then newest first. Papers and presentations
 * go here too: add an item with kinds ["Paper"] and a link to the PDF or DOI
 * when one is published.
 */
export const research: ResearchItem[] = [
  {
    title:
      "Optimized Deep Learning Framework for Diabetic Retinopathy Detection and Classification Using Fundus Imaging",
    kinds: ["Paper", "Research project"],
    venue:
      "Inspire Health Journal 1(1), 42\u201362 · First author, with Ghazanfar Latif, Jaspreet Kaur and Mohsin Butt · UREAP Research Award ($6,000)",
    year: "2026",
    status: "Published",
    hook: "Can one photograph of the eye flag diabetic retinopathy before it costs someone their sight?",
    summary:
      "CNNs catch the small lesions; vision transformers see the whole retina. I fused features from both, AlexNet and a Swin Transformer, and a Random Forest trained on them reached 98.2% accuracy on the public APTOS 2019 dataset, ahead of every single-model baseline. Funded by a $6,000 UREAP award and published as first author.",
    links: [{ label: "Paper", href: "https://doi.org/10.65718/inspireHealth.2026.2005" }],
    cover: { src: unsplash("1617339860632-f53c5b5dce4d"), alt: "Close-up of a human eye with an amber iris" },
  },
  {
    title: "AI-Driven Post-Wildfire Ecosystem Recovery",
    kinds: ["Research project", "Presentation"],
    venue:
      "TRU Student Sustainability Research Grant ($2,500) · Supervised by Dr. Ghazanfar Latif · TRU Sustainability Conference",
    year: "2026",
    status: "In progress",
    hook: "Which burned land comes back on its own, and what should we plant where it doesn't?",
    summary:
      "After Canada's worst fire season on record, I merged six environmental datasets and trained gradient-boosted models to predict three-year recovery across the Thompson-Okanagan. SHAP showed that burn severity tells most of the story, and in the dry Okanagan, moisture tells the rest. The answer became a public atlas with a native-species planting guide.",
    links: [{ label: "Case study", href: "/projects/after-fire" }],
    cover: { src: unsplash("1556591800-e6056f222197"), alt: "A burned forest of bare trunks beside a gravel road" },
    screen: "/projects/after-fire/home.webp",
  },
  {
    title:
      "Simulating Human Keystroke Dynamics: Can LLM-Generated Text Be Made Indistinguishable from Human Typing?",
    kinds: ["Paper"],
    venue: "COMP 4980 Behavioural Biometrics · Thompson Rivers University",
    year: "2026",
    status: "Completed",
    hook: "If a language model can write like us, can it type like us too?",
    summary:
      "I modelled the rhythm of 99 real typists, key pair by key pair, built a simulator from it and set three detectors loose on the result. The strongest still caught most of the fakes, and the paper examines where the illusion breaks.",
    links: [
      { label: "Case study", href: "/projects/keystroke-dynamics" },
      { label: "Code", href: "https://github.com/poojaverma-me/BehaviouralBiometrics_ResearchPaper" },
    ],
    cover: { src: unsplash("1560457079-9a6532ccb118"), alt: "Backlit keys of a black keyboard" },
    screen: "/projects/keystroke-dynamics/demo-run.webp",
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
