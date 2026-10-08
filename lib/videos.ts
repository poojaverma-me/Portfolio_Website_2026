/**
 * The YouTube section: one tab per channel. Titles and descriptions are
 * written for this site from each video's content. Add a video with its
 * 11-character id from the watch URL; `project` links a demo to its case study.
 */
export type Video = {
  id: string;
  title: string;
  description: string;
  date?: string;
  /** m:ss */
  duration?: string;
  /** slug of the case study this video demos */
  project?: string;
  /** upload time as ISO 8601, for the case study's VideoObject schema */
  published?: string;
};

export type Channel = {
  id: string;
  name: string;
  handle: string;
  url: string;
  /** one line on what the channel covers, shown under the tabs */
  about: string;
  videos: Video[];
};

export const CHANNELS: Channel[] = [
  {
    id: "beyond-prompt",
    name: "Beyond Prompt",
    handle: "@BeyondPromptOfficial",
    url: "https://www.youtube.com/@BeyondPromptOfficial",
    about: "The week's AI launches, checked against independent benchmarks.",
    videos: [
      {
        id: "GldlKv7MivU",
        title: "Claude Haiku 5.5: 75% cheaper, but read the fine print",
        description:
          "Ten cents per million input tokens and a 43 on the independent Artificial Analysis index, ahead of GPT-6 Luna. The catches: prompts over 100K tokens cost 5x more, it burns about 3x the tokens, and it over-refuses.",
        date: "Oct 7, 2026",
        duration: "9:51",
      },
      {
        id: "SQl7NdD-r9g",
        title: "Mistral Large 4, \u201cLe Chonk\u201d: is Europe back?",
        description:
          "A 1-trillion-parameter open-weight model that jumps from 9 to 38 on the Artificial Analysis index and shines at legal and security work, yet sits about 20 points behind the frontier and trails Kimi K3 and GLM-5.3 at coding.",
        date: "Oct 7, 2026",
        duration: "11:03",
      },
      {
        id: "mhaVKSvmkbc",
        title: "AI this week: a superintelligence accord, a leaked IPO filing and an FTC probe",
        description:
          "The week's AI news, sorted by what actually matters: a White House accord with no penalties, Anthropic's leaked prospectus, OpenAI's cancelled model and the FTC's new investigation.",
        date: "Oct 4, 2026",
        duration: "7:41",
      },
      {
        id: "GRPMYykBpg4",
        title: "Gemini 4 Argon: is Google back on top?",
        description:
          "Google's launch chart checked against independent benchmarks from Artificial Analysis, Vals and Arena, the launch pricing, and the vending-machine test where Argon lied to a supplier.",
        date: "Sep 30, 2026",
        duration: "8:36",
      },
      {
        id: "f0O6ozHy82w",
        title: "OpenAI DevDay 2026: the three launches that matter",
        description:
          "Twenty-plus announcements, three that change things: always-on Dots agents, GPT-6.1 Sol and Ultrafast, plus the pricing twist and an independent Sol versus Claude test.",
        date: "Sep 29, 2026",
        duration: "5:39",
      },
    ],
  },
  {
    id: "pooja-verma",
    name: "Pooja Verma",
    handle: "@Poojav3rma",
    url: "https://www.youtube.com/@Poojav3rma",
    about: "Short demos of the products I build, each in under two minutes.",
    videos: [
      {
        id: "sVMqjLIyO-A",
        title: "ReelMind: movie picks that explain themselves",
        description:
          "No chatbot: Jev answers a few yes-or-no questions about your taste, ordinary code ranks the films, and every pick names the favourite it grew out of. About half a second per pick.",
        date: "Oct 6, 2026",
        duration: "1:32",
        project: "reelmind",
        published: "2026-10-06T23:49:31-07:00",
      },
      {
        id: "mdBU6JgDBqE",
        title: "Tidal: a support queue that sorts itself",
        description:
          "Each ticket is read once for owner, urgency and security risk. A queue of 92 is sorted in about a second, unclear tickets go to a person, and a team merge moves 25 tickets in under a second.",
        date: "Oct 6, 2026",
        duration: "1:32",
        project: "tidal",
        published: "2026-10-06T23:49:24-07:00",
      },
      {
        id: "Hk1UXgKxqXs",
        title: "Tadka: what should we cook tonight?",
        description:
          "Describe the mood in plain words and one request scores the whole recipe collection in under half a second. Heat with no onions lands on shorshe ilish as an 85% fit.",
        date: "Oct 6, 2026",
        duration: "1:21",
        project: "tadka",
        published: "2026-10-06T23:49:16-07:00",
      },
      {
        id: "l7Bf90jcf1E",
        title: "Shortlist: criteria-based resume screening",
        description:
          "Every hiring criterion is a typed question. Add a new requirement and 40 resumes are re-scored on it in about a second, and every score explains itself.",
        date: "Oct 6, 2026",
        duration: "1:34",
        project: "shortlist",
        published: "2026-10-06T23:49:09-07:00",
      },
      {
        id: "gLBxkaLHmRk",
        title: "Wildwood: a survival game you play by voice",
        description:
          "Say “use a bandage” or “make it night and grab my flashlight” and the game does it. Spoken sentences become game actions for healing, gear and weather.",
        date: "Oct 6, 2026",
        duration: "1:45",
        project: "wildwood",
        published: "2026-10-06T23:49:04-07:00",
      },
      {
        id: "vEMaqBD_p0E",
        title: "Pulse: live coaching for sales calls",
        description:
          "After every sentence Pulse reads the deal, the buyer's mood and the objection, then suggests the next move. A price objection drops the close chance to 31%; the suggested ROI pitch brings it back to 82%.",
        date: "Oct 6, 2026",
        duration: "1:49",
        project: "pulse",
        published: "2026-10-06T23:48:47-07:00",
      },
    ],
  },
];

/** The demo video for a case study, if one has been posted. */
export function projectVideo(slug: string): Video | undefined {
  return CHANNELS.flatMap((c) => c.videos).find((v) => v.project === slug);
}

/** "1:32" as an ISO 8601 duration, "PT1M32S". */
export function isoDuration(d: string): string {
  const [m, s] = d.split(":").map(Number);
  return `PT${m}M${s}S`;
}
