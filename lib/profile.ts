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
    "Computing science student at Thompson Rivers University working across full-stack development, applied AI, and data. My work has served 3,000+ students, 4,000+ retailers, and 1,000+ employees, and it is built to keep working after I hand it off.",
  skills: [
    "Python",
    "TypeScript",
    "JavaScript",
    "React",
    "C#",
    "SQL",
    "Snowflake",
    "Machine Learning",
    "pandas",
    "NumPy",
    "MATLAB",
    "Tableau",
    "Power BI",
    "Power Apps",
    "Salesforce",
    "Docker",
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
    company: "Outlier.AI",
    role: "LLM Model Trainer (Freelance)",
    period: "Nov 2025 – Present",
    location: "San Francisco, CA (Remote)",
    points: [
      "Trained and evaluated 100+ LLMs for accuracy, precision, fluency, correctness, and F1 score across diverse tasks.",
      "Delivered corrective feedback on 100+ code issues to improve model performance.",
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
      "Built an employee check-in system for 1,000+ employees in collaboration with another co-op.",
    ],
    tags: ["Salesforce", "Apex", "LWC", "Power Apps", "Power BI"],
  },
  {
    company: "Thompson Rivers University",
    role: "Undergraduate Teaching Assistant",
    period: "Jan – May 2024 · Feb – Apr 2025",
    location: "Kamloops, BC",
    points: [
      "Supported instruction in HTML, CSS, JavaScript, Java, Python, and data structures, emphasizing clean code and logic.",
      "Promoted best practices in documentation and version control for maintainable work.",
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
    title:
      "Automated Diabetic Retinopathy Detection from Fundus Images using CNNs",
    venue: "UREAP Research Award ($6,000) · Thompson Rivers University",
    year: "2025",
    status: "Completed",
    summary:
      "Awarded a $6,000 UREAP scholarship to train CNN models on fundus images with domain-specific preprocessing, transfer learning, and hybrid architectures. Authored technical documentation ensuring data transparency and reproducibility.",
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

export type LeadershipItem = {
  role: string;
  org: string;
  period: string;
  detail: string;
};

export const leadership: LeadershipItem[] = [
  {
    role: "Co-Founder, Vice-President & Main Spokesperson",
    org: "TRUSU Combat Robotics Club",
    period: "2024 – Present",
    detail:
      "Co-founded the club and serve as its public voice: growing membership, running build nights, and representing the club at campus events.",
  },
  {
    role: "Member",
    org: "TRUSU Computing Science Club",
    period: "2023 – Present",
    detail:
      "Active member of the campus computing community through talks, socials, and peer learning.",
  },
];

export type VolunteerItem = {
  role: string;
  org: string;
  period: string;
};

export const volunteering: VolunteerItem[] = [
  {
    role: "Event Registration Volunteer",
    org: "TRU IDAYS · Thompson Rivers University",
    period: "2023 – 2025",
  },
  {
    role: "Event Registration Volunteer",
    org: "BCLC Vendor Showcase",
    period: "Nov 2024",
  },
  {
    role: "Event Registration Volunteer",
    org: "365 Sports 5K Foam Fest · Kamloops",
    period: "Jun 2025",
  },
];
