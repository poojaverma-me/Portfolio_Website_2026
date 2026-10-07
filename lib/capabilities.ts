/**
 * "What I do": the problems Pooja works on, each backed by work on this
 * site. Icons are rendered in Blender (scripts/blender/capability_icons.py).
 */
export type Capability = {
  icon: string;
  title: string;
  body: string;
  /** where the visitor can see it done */
  proof: { label: string; href: string }[];
};

export const capabilities: Capability[] = [
  {
    icon: "research",
    title: "Science that leaves the lab",
    body: "Canada's 2023 wildfire season burned about 18 million hectares. My grant-funded model predicts which burned land recovers and what to replant, and it ships as a public atlas, not just a paper.",
    proof: [
      { label: "After Fire", href: "/projects/after-fire" },
      { label: "Research", href: "/#research" },
    ],
  },
  {
    icon: "ai-products",
    title: "Knowledge that answers back",
    body: "Students wait days for answers that already sit in their course material. My retrieval system answers from that material directly, with 40% more relevant responses, for 3,000+ students.",
    proof: [
      { label: "RAG assistant", href: "/#experience" },
      { label: "ReelMind", href: "/projects/reelmind" },
      { label: "Tadka", href: "/projects/tadka" },
    ],
  },
  {
    icon: "limits",
    title: "Decisions people can trust",
    body: "When AI routes a ticket or screens a résumé, a wrong call costs someone. My systems return probabilities, act only when confident and hand everything else to a person.",
    proof: [
      { label: "Tidal", href: "/projects/tidal" },
      { label: "Shortlist", href: "/projects/shortlist" },
      { label: "Pulse", href: "/projects/pulse" },
    ],
  },
  {
    icon: "evaluation",
    title: "Models held to evidence",
    body: "Frontier models still hallucinate when reasoning gets hard. I write the coding benchmarks and red-team the reasoning used to fine-tune them, and I audit my own results just as hard.",
    proof: [
      { label: "RLHF at Outlier", href: "/#experience" },
      { label: "Keystroke Dynamics", href: "/projects/keystroke-dynamics" },
      { label: "Calorie study audit", href: "/projects/workout-calories-ml" },
    ],
  },
  {
    icon: "full-stack",
    title: "Software that holds up in production",
    body: "From the PDF engine at the core of a construction estimating platform to real-time scheduling and 3D worlds in the browser, I build products that keep working once real users arrive.",
    proof: [
      { label: "PataBid", href: "/#experience" },
      { label: "Schedulo", href: "/projects/schedulo" },
      { label: "Wildwood", href: "/projects/wildwood" },
    ],
  },
  {
    icon: "workflows",
    title: "Operations without the busywork",
    body: "Manual processes quietly drain an organization's time. My Salesforce and Power Platform automation for 4,000+ lottery retailers cut manual processing by 30%.",
    proof: [
      { label: "BCLC", href: "/#experience" },
      { label: "Sprint Ticket Master", href: "/projects/sprint-ticket-master" },
    ],
  },
];
