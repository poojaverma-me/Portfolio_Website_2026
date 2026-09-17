export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  /** How this person knows Pooja */
  context: string;
};

// PLACEHOLDER testimonials. Replace every entry with real, approved quotes
// before publishing the site.
export const testimonials: Testimonial[] = [
  {
    quote:
      "Pooja took a rough idea for a course assistant and turned it into a system thousands of students actually rely on. She asks the right questions early and documents everything.",
    name: "Dr. Alex Morgan",
    role: "Faculty Supervisor",
    context: "Research assistantship",
  },
  {
    quote:
      "She shipped Salesforce work that our retail team still uses daily. Calm under deadlines, clear in stand-ups, and never afraid to say when something needed a rethink.",
    name: "Jordan Lee",
    role: "Senior Developer",
    context: "Co-op mentor",
  },
  {
    quote:
      "As a TA, Pooja explained data structures in a way that finally clicked for half our lab. Patient, precise, and genuinely invested in how students learn.",
    name: "Priya Nair",
    role: "Computing Science Student",
    context: "Teaching assistant",
  },
  {
    quote:
      "Her UREAP project was one of the most reproducible pieces of student research I have reviewed. The write-up alone set a new bar for the cohort.",
    name: "Dr. Sam Patel",
    role: "Research Reviewer",
    context: "UREAP scholarship",
  },
  {
    quote:
      "Pooja co-founded our robotics club from nothing. She handles sponsors, recruits members, and still finds time to debug the drive train at midnight.",
    name: "Marcus Chen",
    role: "Club President",
    context: "TRUSU Combat Robotics",
  },
  {
    quote:
      "Fast learner, thoughtful reviewer. Her feedback on model outputs was consistently specific enough that we could act on it immediately.",
    name: "Taylor Brooks",
    role: "Project Lead",
    context: "LLM training",
  },
];
