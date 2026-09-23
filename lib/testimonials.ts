export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  /** How this person knows Pooja */
  context: string;
  /** When the recommendation was written */
  date: string;
};

/**
 * Real LinkedIn recommendations, quoted verbatim. Where a recommendation was
 * longer than a card, whole sentences were dropped from the end or the middle;
 * nothing was reworded.
 */
export const testimonials: Testimonial[] = [
  {
    quote:
      "I had an amazing time working with Pooja almost daily at BCLC during my co-op. Pooja has exceptional programming, analytical and problem-solving skills. She is reliable and a quick learner. Pooja learnt Power Automate in a short amount of time and made huge contributions to a very demanding Power Automate check-in project.",
    name: "Angel Masano",
    role: "Technical Analyst, CS grad at TRU",
    context: "Worked on the same team",
    date: "April 2025",
  },
  {
    quote:
      "I have had the pleasure of working with Pooja in a mentor and scrum master capacity. What sets her apart is that she knows herself well enough to ask questions to get clarity without prompting. This ensured that when she dove into the tasks she was prepared and had room to innovate and think about solutions with a good foundation of understanding.",
    name: "Richard Tang",
    role: "Mentor and scrum master",
    context: "Mentored Pooja",
    date: "December 2024",
  },
  {
    quote:
      "I recommend Pooja Verma, who completed my Python course with exceptional skills and a profound understanding of programming fundamentals. Beyond mastering the curriculum, she displays enthusiasm for tackling new challenges and has a proactive approach to learning. Her creativity in assignments, punctuality, and regular attendance highlights her reliability.",
    name: "Dr. Jaspreet Kaur",
    role: "Assistant Teaching Professor, Thompson Rivers University",
    context: "Taught Pooja",
    date: "January 2024",
  },
];
