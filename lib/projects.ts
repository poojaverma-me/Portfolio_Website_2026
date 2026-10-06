export type Figure = {
  caption: string;
  /** a screenshot or chart under /public; without one a placeholder frame shows */
  src?: string;
  alt?: string;
  /** phone screenshots get a device frame and sit two to a row */
  device?: "phone";
  aspect?: "wide" | "tall";
};

export type ProjectSection = {
  id: string;
  label: string;
  title: string;
  body: string[];
  bullets?: string[];
  figures?: Figure[];
};

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  category: "AI / ML" | "Data" | "Security" | "Full-Stack";
  year: string;
  status: "Shipped" | "In Progress" | "Research" | "Course project" | "Prototype";
  /** shown in the case study meta grid */
  timeline: string;
  role: string;
  team: string;
  featured: boolean;
  stack: string[];
  /** the field and sector the project serves, shown on its card */
  domains: string[];
  metrics: { label: string; value: string }[];
  links: { github?: string; live?: string };
  /** the card image on /projects */
  cover?: string;
  /** small portrait crops for the homepage card arc */
  thumbs?: string[];
  sections: ProjectSection[];
};

/**
 * Every write-up below was checked against its repository: the code was run
 * locally, the screenshots are of the running app (or the project's own
 * charts), and each number traces to a file in the repo. While this is false,
 * case-study pages stay out of search and the sitemap.
 */
export const CASE_STUDIES_PUBLISHED = true;

const img = (slug: string, name: string) => `/projects/${slug}/${name}.webp`;
const thumbs = (slug: string, names: string[]) => names.map((n) => `/projects/${slug}/thumbs/${n}.webp`);

export const projects: Project[] = [
  {
    slug: "after-fire",
    title: "After Fire",
    tagline:
      "An interactive atlas of post-wildfire recovery in BC's Thompson-Okanagan, turning a machine-learning study into a map, a recovery simulator and a native-species planting guide.",
    category: "AI / ML",
    year: "2026",
    status: "Research",
    timeline: "2026, alongside the research grant",
    role: "Research, modelling and front end",
    team: "Solo, supervised by Dr. Ghazanfar Latif",
    featured: true,
    stack: ["Next.js 16", "React Three Fiber", "MapLibre GL", "XGBoost", "SHAP", "Python", "GSAP", "Vitest"],
    domains: ["Environmental science", "Wildfire recovery", "Forestry"],
    metrics: [
      { label: "Burned sites in the study", value: "2,600" },
      { label: "Open datasets merged", value: "6" },
      { label: "Weighted F1, cross-validated", value: "0.717" },
    ],
    links: { github: "https://github.com/poojaverma-me/After-Fire_Sustainability_Project" },
    cover: img("after-fire", "home"),
    thumbs: thumbs("after-fire", ["a", "b", "c", "d"]),
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "After a wildfire, land managers have to decide what to replant, and the answer depends on how hard the ground burned, how dry the climate is and which ecosystem the site sits in. My research predicts **three-year vegetation recovery** for burned land in British Columbia and scores native species for each site.",
          "After Fire is the public face of that study. Instead of a PDF, it is a site anyone can explore: a WebGL globe that dives into BC, a 3D terrain atlas of landmark fires and study sites, a recovery simulator, a species library, and an Evidence page that shows the model's results, including where it fails. Every technical term opens a plain-language definition, because the audience is land managers and communities, not data scientists.",
        ],
        figures: [
          { src: img("after-fire", "home"), caption: "Home: the globe hero", alt: "After Fire home page with a green WebGL globe behind the headline 'After a wildfire, what should we replant?'" },
        ],
      },
      {
        id: "problem",
        label: "01 / Problem",
        title: "The Problem",
        body: [
          "Canada's 2023 fire season burned about **18 million hectares**, more than double the previous record. Recovery is not uniform. In the study data, the share of sites reaching moderate or better recovery rises from **11.5%** on the driest ponderosa pine benches (PPdh1) to **37.7%** in the wetter sub-boreal spruce zone (SBSmc2).",
          "The same fire in two places needs two different prescriptions, so the tool has to make the role of place visible, not just output a class label.",
        ],
        figures: [
          { src: img("after-fire", "zones"), caption: "Six BEC zones, dry to wet", alt: "Cards for six biogeoclimatic zones with precipitation, moisture deficit, elevation and three-year recovery bars" },
          { src: img("after-fire", "compare"), caption: "Same fire, two places", alt: "Simulator comparing the same moderate fire at Kelowna and Kamloops, with different recovery and different species" },
        ],
      },
      {
        id: "data-model",
        label: "02 / Data and model",
        title: "Data and Model",
        body: [
          "I merged six open datasets: **CNFDB/CIFFC** fire perimeters and burn severity, **SoilGrids 2.0**, **ClimateNA**, **SRTM** terrain, **MODIS** vegetation greenness (NDVI) and **GBIF** species records. The result is **2,600 burned sites** across six BEC zones, described by **19 features**. Recovery is defined from NDVI three years after the fire.",
          "Five classifiers were benchmarked with SMOTE for the class imbalance. **XGBoost** led on held-out weighted F1 (**0.695**) and in cross-validation (**0.717 ± 0.009**). A McNemar test against LightGBM gave p = 0.30, so I report the two as statistically tied rather than claiming a clear winner.",
          "A Python export script turns the research outputs into versioned JSON, so the site deploys as static pages with no Python, database or server in production.",
        ],
        figures: [
          { src: img("after-fire", "benchmark"), caption: "Evidence: pipeline and benchmark", alt: "Pipeline diagram from six datasets to 19 features to XGBoost, above a five-model weighted F1 benchmark" },
        ],
      },
      {
        id: "drivers",
        label: "03 / What drives recovery",
        title: "What Drives Recovery",
        body: [
          "SHAP explains the model's decisions. **Burn severity** dominates everywhere (mean |SHAP| 2.08, about six times the next feature). In the Thompson-Okanagan the **moisture deficit** climbs to second place, which matches the region's dry climate.",
          "An ablation makes the point concrete: removing burn severity drops weighted F1 from **0.684 to 0.475**. The page also reports where the model struggles. The High-recovery class is only **1.3%** of records and every tree ensemble scores **0 F1** on it, which I show rather than hide.",
        ],
        figures: [
          { src: img("after-fire", "shap"), caption: "SHAP, Thompson-Okanagan scope", alt: "Bar chart of mean SHAP values with burn severity first and moisture deficit second" },
          { src: img("after-fire", "ablation"), caption: "Ablation and weak spots", alt: "Ablation panel showing weighted F1 of 0.475 without burn severity, next to per-model F1 on the rare High class" },
        ],
      },
      {
        id: "interface",
        label: "04 / Interface",
        title: "Interface",
        body: [
          "The **atlas** puts landmark fires (Okanagan Mountain Park, Elephant Hill, Lytton Creek) and six study sites on real 3D terrain with MapLibre. Each site opens its modelled recovery class and a ranked planting prescription.",
          "The **simulator** regrows a burned slope over three years as you change zone, severity, aspect, dryness and pre-fire greenness. It runs a transparent surrogate calibrated to the study's NDVI data rather than the trained model, so every slider move can explain its own effect in the driver bars.",
          "The **species scorer** is a TypeScript port of the study's seven-criterion recommender. A Vitest suite checks it against the Python output for all six study sites: **9 of 9 tests pass**.",
        ],
        figures: [
          { src: img("after-fire", "atlas-site"), caption: "Atlas: a study site", alt: "3D terrain map of the Thompson-Okanagan with the Kelowna study site drawer open" },
          { src: img("after-fire", "simulator"), caption: "Simulator: build your own", alt: "Simulator with a regrown forest scene, NDVI trajectory chart and driver bars" },
          { src: img("after-fire", "prescriptions"), caption: "Prescriptions for six sites", alt: "Six study sites with their top three native species and scores" },
          { src: img("after-fire", "phone-home"), caption: "Home on a phone", alt: "After Fire home page on a phone", device: "phone" },
          { src: img("after-fire", "phone-simulator"), caption: "Simulator on a phone", alt: "Guided simulator on a phone", device: "phone" },
        ],
      },
      {
        id: "results",
        label: "05 / Results",
        title: "Results",
        body: [
          "The study shipped as a static Next.js site where every chart traces back to the research outputs. It was presented at the TRU Sustainability Conference.",
        ],
        bullets: [
          "2,600 burned sites, 6 open datasets, 19 features, 5 benchmarked models",
          "XGBoost at 0.717 weighted F1 in cross-validation, reported alongside its failure on the rare class",
          "Species recommender ported to the browser and verified against Python, 9 of 9 tests passing",
          "No backend in production: research outputs are exported to JSON at build time",
        ],
      },
    ],
  },
  {
    slug: "reelmind",
    title: "ReelMind",
    tagline:
      "A Netflix-style movie app whose recommendations come from TypeSafe's Jev: three typed requests rank a catalogue in about 400 ms for $0.0006, and every pick explains itself.",
    category: "AI / ML",
    year: "2026",
    status: "Prototype",
    timeline: "Oct 2026",
    role: "Design, recommendation pipeline and front end",
    team: "Solo",
    featured: true,
    stack: ["Next.js 16", "React 19", "TypeScript", "Jev (TypeSafe)", "Tailwind CSS 4", "Framer Motion"],
    domains: ["Streaming and media", "Recommendation systems"],
    metrics: [
      { label: "Median time per recommendation, measured", value: "382 ms" },
      { label: "Cost per recommendation", value: "$0.0006" },
      { label: "Typed questions across 3 Jev calls", value: "25" },
    ],
    links: { github: "https://github.com/poojaverma-me/reelmind" },
    cover: img("reelmind", "for-you"),
    thumbs: thumbs("reelmind", ["a", "b"]),
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "The obvious way to build an AI recommender is to paste the whole catalogue and the viewer's history into one LLM prompt and ask for a ranked list with reasons. That is slow, priced at frontier-model rates, and returns prose you have to parse and cannot calibrate.",
          "ReelMind takes a different route. It asks **Jev**, TypeSafe's decision model, narrow typed questions one level at a time, and lets plain code do the filtering in between. Jev does not generate text: it answers yes/no, multiple-choice and scale questions with a probability for every option, and those probabilities become the ranking.",
        ],
        figures: [
          { src: img("reelmind", "for-you"), caption: "For You: Jev's top pick", alt: "ReelMind home with Avengers: Endgame as Jev's number one pick for the viewer, with its probability" },
        ],
      },
      {
        id: "pipeline",
        label: "01 / Pipeline",
        title: "Four Stages, Three Calls",
        body: [
          "**1. Taste profile.** One request asks 17 questions about the last 25 titles watched: a separate yes/no affinity for each of 11 genres (so a viewer can love several), preferred language, tone, era, and whether they are multilingual, acclaim-driven or watching as a family.",
          "**2. Narrowing, in code.** Keep the strongest genres, the languages that cover 85% of the probability, apply a family-safe rule, relax the filters if fewer than 8 titles survive, and cap the shortlist at 30. This step costs **0 tokens and about 1 ms**.",
          "**3. Rank.** One multiple-choice question across the shortlist. Jev's probability distribution is the ranking.",
          "**4. Explain.** One request links each top-5 pick to the film in the viewer's history it most resembles (\"Because you watched...\") and builds two more rows from titles outside the Top 10, so rows never repeat.",
        ],
        figures: [
          { src: img("reelmind", "replay"), caption: "Replay: narrowing in code", alt: "How Jev Picks replay showing filters narrowing 88 titles to a 30-title shortlist" },
          { src: img("reelmind", "ranking"), caption: "Ranking and explanations", alt: "Ranked shortlist with Jev probabilities beside the Because you watched links" },
          { src: img("reelmind", "request"), caption: "The exact typed request", alt: "JSON of the ranking request sent to the Jev API" },
        ],
      },
      {
        id: "product",
        label: "02 / Product",
        title: "The Product",
        body: [
          "The catalogue has **88 streaming titles** plus 132 archive titles that make up six viewer histories, from a Marvel fan to a family. Every title opens with **Jev's verdict**: its rank among the candidates, its probability, and the film in your history behind it, or which stage filtered it out.",
          "Watching a film adds it to your history and re-ranks the whole page, measured at **482 ms** in the browser. A new viewer picks three films and that is enough for a first profile.",
        ],
        figures: [
          { src: img("reelmind", "top10"), caption: "Top 10 and Because-you-watched rows", alt: "Top 10 row and a Because you watched Iron Man row of posters" },
          { src: img("reelmind", "verdict"), caption: "Jev's verdict on a title", alt: "Title modal showing its rank of 30 candidates, probability and the history title behind it" },
          { src: img("reelmind", "onboarding"), caption: "New viewer onboarding", alt: "Pick three films you love onboarding screen with three posters selected" },
          { src: img("reelmind", "rerank"), caption: "Re-ranked after a watch", alt: "Home page re-ranked after watching a film, with a new Because you watched row" },
          { src: img("reelmind", "phone-for-you"), caption: "For You on a phone", alt: "ReelMind on a phone with Hereditary as the top pick for a horror fan", device: "phone" },
        ],
      },
      {
        id: "results",
        label: "03 / Results",
        title: "Measured Results",
        body: [
          "Measured over 18 runs across all six viewers against the live API, a full recommendation takes a median **382 ms** (306 to 600 ms), about **14,200 input tokens** and **$0.0006**. The number-one pick was identical across all three rounds for every viewer; lower ranks shuffle slightly between runs.",
          "One honest finding: only the ranking step is capped. The explanation step lists every unwatched title outside the Top 10, so it accounts for 72% of tokens and grows with the catalogue. The next version would cap that step too.",
        ],
        figures: [
          { src: img("reelmind", "numbers"), caption: "The numbers behind one run", alt: "Dashboard with 403 ms, $0.000602, 14,335 input tokens and 3 Jev calls with 25 questions" },
        ],
      },
    ],
  },
  {
    slug: "pulse",
    title: "Pulse",
    tagline:
      "Live sales-call coaching: after every sentence, TypeSafe's Jev answers 12 typed questions about the prospect, fast enough to steer the rep while the call is still going.",
    category: "AI / ML",
    year: "2026",
    status: "Prototype",
    timeline: "Oct 2026",
    role: "Design, question design and front end",
    team: "Solo",
    featured: true,
    stack: ["Next.js 16", "React 19", "TypeScript", "Jev (TypeSafe)", "Web Speech API", "Tailwind CSS 4"],
    domains: ["Sales enablement", "Conversation intelligence", "B2B SaaS"],
    metrics: [
      { label: "Typed questions after every sentence", value: "12" },
      { label: "Median analysis time, measured", value: "230 ms" },
      { label: "Cost to analyse a full call", value: "$0.0014" },
    ],
    links: { github: "https://github.com/poojaverma-me/pulse" },
    cover: img("pulse", "price-objection"),
    thumbs: thumbs("pulse", ["a", "b"]),
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "Coaching a sales rep mid-call only helps if the insight lands before the moment passes. An LLM that writes JSON takes seconds per analysis and falls behind the conversation.",
          "Pulse reads the transcript after every finished sentence and sends one request to **Jev**, TypeSafe's decision model, with **12 typed questions**: how likely the prospect is to buy, how they feel, what they care about, their main objection, the deal stage, the rep's best next move, and six yes/no signals such as price sensitivity, urgency and competitor mentions. The answers drive a conversion line, a \"Pivot your pitch\" card and a coaching feed.",
        ],
        figures: [
          { src: img("pulse", "price-objection"), caption: "A price objection, live", alt: "Live call console at turn 8 with conversion down to 31% and the next move Quantify the ROI" },
        ],
      },
      {
        id: "turning-point",
        label: "01 / A call, turn by turn",
        title: "A Call, Turn by Turn",
        body: [
          "In the Brightline call, conversion starts at **27%**, climbs to about 60% during discovery, then drops to **31%** when the prospect balks at a 50% price increase. Jev's top recommendation switches to \"Quantify the ROI\". Four turns later the refund maths and a two-year price lock bring it back to **69%**, and the call ends at **83%** with a meeting booked.",
          "Turn-to-turn changes are compared in plain code, which pins moments on the chart (momentum, objections, buying signals) and adds a coaching nudge.",
        ],
        figures: [
          { src: img("pulse", "signals-shifted"), caption: "Four turns later", alt: "Live call at turn 12 with conversion back up to 69% and positive sentiment" },
        ],
      },
      {
        id: "post-call",
        label: "02 / After the call",
        title: "After the Call",
        body: [
          "One more request produces the review: the outcome, why a deal stalled, whether a dated next step was agreed, and a four-part rep scorecard. The three key moments are multiple-choice questions whose options are the prospect's own sentences, so the summary quotes the transcript instead of generating text that could drift from it.",
        ],
        figures: [
          { src: img("pulse", "post-call"), caption: "Post-call review", alt: "Post-call review with outcome, three quoted key moments and a rep scorecard" },
          { src: img("pulse", "phone-post-call"), caption: "Review on a phone", alt: "Post-call review on a phone", device: "phone" },
          { src: img("pulse", "phone-answers"), caption: "Answers on a phone", alt: "Question cards with full probability distributions on a phone", device: "phone" },
        ],
      },
      {
        id: "how",
        label: "03 / How it works",
        title: "How It Works",
        body: [
          "Each request sends the transcript so far as structured state plus all 12 question definitions; the How Jev Listens page lets you scrub to any turn and see exactly what Jev received and every probability it returned. Five scripted demo calls replay at real speed, and a Live mic mode uses the browser's speech recognition for real conversations.",
          "Measured on a full call at real speed, analyses took a median **230 ms**, so each one lands within the first word or two of the next sentence and uses **2% to 8%** of that sentence's duration. A whole call cost about **$0.0014**. The LLM lane on this page is a projection from published speeds and prices, not a measured run.",
        ],
        figures: [
          { src: img("pulse", "how-jev-listens"), caption: "What Jev sees at each turn", alt: "How Jev Listens page with the transcript state and question cards with probabilities" },
          { src: img("pulse", "headroom"), caption: "Real-time headroom", alt: "Per-turn bars comparing measured Jev latency with the time to say the next sentence" },
          { src: img("pulse", "library"), caption: "Call library (sample history)", alt: "Call library dashboard of synthetic history with win rate and drop-off reasons" },
        ],
      },
    ],
  },
  {
    slug: "tidal",
    title: "Tidal",
    tagline:
      "IT and support ticket routing: one TypeSafe Jev request per ticket picks the team, priority, mood and risk, and its probabilities decide when a human should step in.",
    category: "AI / ML",
    year: "2026",
    status: "Prototype",
    timeline: "Oct 2026",
    role: "Design, routing logic and front end",
    team: "Solo",
    featured: true,
    stack: ["Next.js 16", "React 19", "TypeScript", "Jev (TypeSafe)", "Tailwind CSS 4"],
    domains: ["IT service management", "Customer support"],
    metrics: [
      { label: "Team accuracy on 96 labelled tickets", value: "96.9%" },
      { label: "Median routing time per ticket", value: "176 ms" },
      { label: "To re-route the backlog after a reorg", value: "1.04 s" },
    ],
    links: { github: "https://github.com/poojaverma-me/tidal" },
    cover: img("tidal", "inbox"),
    thumbs: thumbs("tidal", ["a", "b"]),
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "Ticket triage is repetitive, and a router that guesses is risky. Tidal sends each incoming IT or support ticket to **Jev**, TypeSafe's decision model, as one request with six typed questions: which team owns it (with a probability for every team), priority, the requester's mood, whether many people are affected, whether it is a security risk, and which saved reply to start from.",
          "Because the answers are probabilities rather than generated text, the routing rule lives in plain code that anyone can read and tune.",
        ],
        figures: [
          { src: img("tidal", "inbox"), caption: "Inbox with live intake", alt: "Help-desk inbox with a newly arrived ticket routed to Facilities at full confidence" },
          { src: img("tidal", "new-ticket"), caption: "A stolen laptop, routed", alt: "Ticket about a stolen laptop routed to Security as P1 with a security-risk flag" },
        ],
      },
      {
        id: "human-in-the-loop",
        label: "01 / Human in the loop",
        title: "When a Human Steps In",
        body: [
          "A ticket whose team confidence clears the threshold (0.60 by default) routes itself; anything below waits in a **Needs review** mailbox. When Jev splits a new-starter request between Identity & Access and the IT Service Desk at 52% and 45%, a person decides.",
          "A confidence-gating chart shows the trade-off for every threshold: how much is automated and how accurate that automated slice is against hand labels.",
        ],
        figures: [
          { src: img("tidal", "needs-review"), caption: "Held for review", alt: "Needs review mailbox with a ticket split between two teams below the confidence threshold" },
          { src: img("tidal", "gating"), caption: "Choosing a threshold", alt: "Chart of automated share and accuracy across confidence thresholds" },
          { src: img("tidal", "phone-held"), caption: "A held ticket on a phone", alt: "Ticket held for review on a phone with its team probabilities", device: "phone" },
          { src: img("tidal", "phone-inbox"), caption: "Inbox on a phone", alt: "Tidal inbox on a phone", device: "phone" },
        ],
      },
      {
        id: "reorg",
        label: "02 / Org changes",
        title: "Org Changes Without Retraining",
        body: [
          "Teams change. Merge Network and Hardware into one Infrastructure team, split Product Support, or mark a team unavailable, and Tidal re-asks only the team question for every open ticket. Re-routing the 92-ticket backlog took **1.04 s** and **$0.0021**, and a Sankey diagram shows exactly which tickets moved. There is no model to retrain because the teams are just the options in the question.",
        ],
        figures: [
          { src: img("tidal", "reroute"), caption: "Re-routing after a merge", alt: "Sankey diagram of 24 of 92 tickets moving after two teams were merged" },
          { src: img("tidal", "request"), caption: "The exact request", alt: "The JSON request body and the typed answers for a lost-phone ticket" },
        ],
      },
      {
        id: "results",
        label: "03 / Results",
        title: "Measured Results",
        body: [
          "On **96 hand-labelled synthetic tickets**, Jev picked the right team **96.9%** of the time (93 of 96). Routing the whole 92-ticket backlog took 1.2 to 1.6 s with 24 requests in flight, a median **176 ms** per ticket, about 1,000 input tokens each, and under half a cent in total.",
          "The data also showed the limit of thresholds: the two misroutes came back at high confidence (0.82 and 0.97), so a threshold catches uncertain tickets but not confident mistakes. That is why agents can override and re-ask any ticket. The hosted-LLM costs on the Insights page are estimates from published prices.",
        ],
        figures: [
          { src: img("tidal", "benchmark"), caption: "Labelled-ticket benchmark", alt: "Benchmark table with 97% accuracy, latency percentiles and tokens per ticket" },
          { src: img("tidal", "insights"), caption: "Insights and cost", alt: "Insights page with routing KPIs and cost to triage 1,000 tickets" },
          { src: img("tidal", "dark"), caption: "Dark mode", alt: "Tidal inbox in dark mode with a security alert ticket" },
        ],
      },
    ],
  },
  {
    slug: "shortlist",
    title: "Shortlist",
    tagline:
      "Resume screening where every criterion is a typed question to TypeSafe's Jev: add a new requirement and 40 resumes are re-scored on it in about a second, for a tenth of a cent.",
    category: "AI / ML",
    year: "2026",
    status: "Prototype",
    timeline: "Oct 2026",
    role: "Design, scoring model and front end",
    team: "Solo",
    featured: true,
    stack: ["Next.js 16", "React 19", "TypeScript", "Jev (TypeSafe)", "Tailwind CSS 4", "Framer Motion"],
    domains: ["HR tech", "Recruiting"],
    metrics: [
      { label: "Synthetic resumes across 3 openings", value: "80" },
      { label: "To score 40 resumes on a new criterion", value: "~1 s" },
      { label: "Composite fit against planted skill levels (r)", value: "0.94" },
    ],
    links: { github: "https://github.com/poojaverma-me/shortlist" },
    cover: img("shortlist", "ranked"),
    thumbs: thumbs("shortlist", ["a", "b"]),
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "LLM resume parsers extract a fixed set of fields up front. When a hiring manager asks for something new, every resume has to be parsed again, which is slow and expensive.",
          "Shortlist treats each criterion, like \"Java and Spring depth\" or \"Notice period 30 days or less\", as its own **typed question** to Jev, TypeSafe's decision model, with a written rubric. Answers are cached per resume and question, and the ranking is plain arithmetic in the browser, so changing a weight re-ranks instantly with **no model call** at all.",
        ],
        figures: [
          { src: img("shortlist", "ranked"), caption: "Ranked candidates", alt: "Senior Backend Engineer opening with 40 resumes scored on nine criteria and ranked by fit" },
          { src: img("shortlist", "criterion"), caption: "A criterion, its rubric and weight", alt: "Popover showing a criterion's question, five-level rubric and weight selector" },
        ],
      },
      {
        id: "new-criterion",
        label: "01 / A new criterion",
        title: "A New Criterion, Now",
        body: [
          "A recruiter adds a requirement in one click or writes their own as a scale or a yes/no question. Only that question is sent, one request per resume with 24 in flight, and the new column fills in live. In measured runs, adding a criterion to 40 resumes took **0.5 to 1.4 s** and cost about **$0.0012**; a full nine-criterion screen of 40 resumes took 0.3 to 1.8 s for **$0.0023**.",
        ],
        figures: [
          { src: img("shortlist", "add-attribute"), caption: "Adding a criterion", alt: "Add a scoring attribute sheet with suggestions and a write-your-own form" },
          { src: img("shortlist", "rescored"), caption: "Re-scored in 1.12 s", alt: "Candidate table with a new Kafka column and a toast reporting 40 resumes scored in 1.12 seconds" },
        ],
      },
      {
        id: "explainability",
        label: "02 / Explainability",
        title: "Every Score Explains Itself",
        body: [
          "Each answer shows its full probability distribution across the rubric levels and a confidence label, and the composite fit breaks down line by line as weight times answer. Candidates can be compared side by side, and nothing is rejected automatically: moving a candidate through the pipeline is always a recruiter's decision.",
        ],
        figures: [
          { src: img("shortlist", "candidate"), caption: "Candidate profile", alt: "Candidate drawer with composite fit, radar chart and per-criterion answers" },
          { src: img("shortlist", "compare"), caption: "Side by side", alt: "Comparison of three candidates with an overlaid radar and per-criterion table" },
          { src: img("shortlist", "single-resume"), caption: "One resume in, typed answers out", alt: "A resume beside each criterion's answer and probability distribution" },
          { src: img("shortlist", "phone-candidate"), caption: "Candidate on a phone", alt: "Candidate profile on a phone", device: "phone" },
          { src: img("shortlist", "phone-answers"), caption: "Answers on a phone", alt: "Score cards with probability bars on a phone", device: "phone" },
        ],
      },
      {
        id: "validation",
        label: "03 / Validation",
        title: "Does It Read Resumes Correctly?",
        body: [
          "The sample resumes are generated from hidden skill levels, which makes a check possible. Jev's scores tracked those levels closely, with correlations of **0.92 to 0.99** on the skill criteria and **0.94** for the overall fit. The weakest was resume clarity, at 0.73. Because the resumes are built from templates, this shows Jev reads the planted signal well; it is not evidence about real resumes.",
        ],
        figures: [
          { src: img("shortlist", "composite"), caption: "The fit, as arithmetic", alt: "Composite fit of 9.47 broken down by weight and answer for each criterion" },
        ],
      },
      {
        id: "next",
        label: "04 / Next",
        title: "Before Real Hiring",
        body: ["Screening real people needs safeguards this prototype does not have yet:"],
        bullets: [
          "Redact names, contact details, location and other identity fields before any question is asked",
          "Review the suggested criteria for proxies such as location or employer prestige",
          "Measure score calibration and disparity on real, consented data",
          "Keep an audit log of every criterion, weight and decision",
        ],
      },
    ],
  },
  {
    slug: "wildwood",
    title: "Wildwood",
    tagline:
      "A voice-controlled first-person survival game in the browser. Say \"make it night and grab my flashlight\" and TypeSafe's Jev turns the sentence into game actions in about a tenth of a second.",
    category: "Full-Stack",
    year: "2026",
    status: "Prototype",
    timeline: "Oct 2026",
    role: "Game design, 3D world and voice pipeline",
    team: "Solo",
    featured: true,
    stack: ["Next.js 16", "Three.js", "React Three Fiber", "Jev (TypeSafe)", "Web Speech API", "TypeScript"],
    domains: ["Gaming", "Voice interfaces"],
    metrics: [
      { label: "Median Jev time per command, measured", value: "115 ms" },
      { label: "Typed questions per sentence", value: "19" },
      { label: "Cost per thousand commands", value: "$0.06" },
    ],
    links: { github: "https://github.com/poojaverma-me/wildwood" },
    cover: img("wildwood", "title"),
    thumbs: thumbs("wildwood", ["a", "b", "c"]),
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "Wildwood is a survival sandbox in a forest valley: walk with the keyboard and mouse, and change the world by talking to it. Weather, time of day, what is in your hands, using supplies, lighting the campfire and reloading all happen by voice, with no inventory menus or weapon wheels.",
          "The idea behind it: mapping a loose sentence onto a fixed set of game actions is a classification problem, so a fast decision model fits better than an LLM writing a tool call.",
        ],
        figures: [
          { src: img("wildwood", "title"), caption: "Title screen", alt: "Wildwood title screen over the live 3D valley with example phrases" },
          { src: img("wildwood", "valley"), caption: "The valley at golden hour", alt: "First-person view of a cabin, campfire pit and pines at golden hour with the game HUD" },
        ],
      },
      {
        id: "pipeline",
        label: "01 / Voice to action",
        title: "Voice to Action",
        body: [
          "The browser's speech recognition turns speech into text. Each finished phrase goes to the server with the current game state, and one Jev request asks **19 typed questions**: six yes/no gates (does the player want to change the weather, the time, what they hold, use an item, act on the world, or check status?) and a pick for each category.",
          "Plain TypeScript then applies the rules: a category fires above 0.5, only one healing item is used per need, time always moves forward, and two actions in one sentence complete the combo objective. The HUD shows the parsed actions and how long Jev took.",
        ],
        figures: [
          { src: img("wildwood", "command"), caption: "One sentence, two actions", alt: "Night falling with the flashlight equipped and HUD chips for TIME NIGHT and EQUIP FLASHLIGHT, Jev 89 ms" },
          { src: img("wildwood", "brain"), caption: "The Jev brain inspector", alt: "Inspector panel listing every gate and probability for the last sentence" },
        ],
      },
      {
        id: "world",
        label: "02 / The world",
        title: "The World",
        body: [
          "The valley is rendered with Three.js through React Three Fiber: up to 190,000 GPU grass blades, thousands of distant impostor trees, a cabin, a campfire, day-night lighting, fog, rain, thunderstorms and snow that eases in over a few seconds. Models and textures stream from Poly Haven, and three power modes trade detail for frame rate.",
        ],
        figures: [
          { src: img("wildwood", "storm"), caption: "A thunderstorm rolling in", alt: "Fog and storm rolling over the cabin with a pistol in hand after a two-part command" },
          { src: img("wildwood", "snow"), caption: "Snow and an axe", alt: "Snow settled on the meadow and cabin roof with an axe in hand" },
        ],
      },
      {
        id: "results",
        label: "03 / Results",
        title: "Measured Results",
        body: [
          "Over 28 commands, the Jev request took a median **115 ms** (73 to 170 ms). From pressing Enter on a typed command to the HUD updating took a median **190 ms**. Every request used about 1,330 input tokens, roughly **$0.000056** per command. Spoken commands add the browser's own speech recognition time on top of these figures.",
          "The How Jev Hears You page breaks a sentence into gates and picks and compares the frame budget with an LLM tool call; that LLM figure is a labelled estimate.",
        ],
        figures: [
          { src: img("wildwood", "how"), caption: "How Jev hears you", alt: "Breakdown of one sentence into gates, picks and a frame budget against an estimated LLM call" },
        ],
      },
    ],
  },
  {
    slug: "tadka",
    title: "Tadka",
    tagline:
      "What to cook today? An installable mobile app for Indian home cooking: describe a craving and TypeSafe's Jev scores all 68 dishes in one request, in about a quarter of a second.",
    category: "Full-Stack",
    year: "2026",
    status: "Prototype",
    timeline: "Oct 2026",
    role: "Design, ranking model and PWA",
    team: "Solo",
    featured: true,
    stack: ["Next.js 16", "React 19", "TypeScript", "Jev (TypeSafe)", "PWA", "Tailwind CSS 4"],
    domains: ["Food and cooking", "Consumer mobile"],
    metrics: [
      { label: "Typed questions in one request", value: "79" },
      { label: "Median search time, measured", value: "251 ms" },
      { label: "Cost per search", value: "$0.00044" },
    ],
    links: { github: "https://github.com/poojaverma-me/tadka" },
    cover: img("tadka", "desktop-search"),
    thumbs: thumbs("tadka", ["a", "b"]),
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "People describe what they want to cook in sentences, with constraints: \"spicy without onions\", \"Jain food\", \"high protein, no dairy\". Keyword search ignores those constraints, and chat answers are slow and come back as free text.",
          "Tadka is a mobile-first app with **68 classic Indian dishes**. Type a craving and, half a second after you stop typing, it ranks every dish against it: top picks as a swipeable card deck, the rest as a ranked list, and each dish as a recipe sheet you can save to an on-device cookbook.",
        ],
        figures: [
          { src: img("tadka", "phone-home"), caption: "Picks for the time of day", alt: "Tadka home screen with late-night picks in a card deck", device: "phone" },
          { src: img("tadka", "phone-search"), caption: "Spicy without onions", alt: "Search results for spicy without onions with Jev heard chips and the top dish card", device: "phone" },
          { src: img("tadka", "desktop-search"), caption: "Search on a laptop", alt: "Desktop layout with the search and card deck beside the full ranking" },
        ],
      },
      {
        id: "ranking",
        label: "01 / Ranking",
        title: "One Request, 79 Questions",
        body: [
          "Each search is one request to **Jev**, TypeSafe's decision model. Eleven questions read the craving itself (diet, spice, meal, how heavy, time, region, and which ingredients to avoid), and 68 yes/no questions ask whether each dish fits.",
          "Plain code turns those answers into the order: **Jev's fit, multiplied by diet, preference and avoid factors**. Diet acts as a near-hard rule, preferences only nudge, and an ingredient is penalised only once Jev is at least 30% sure you want to avoid it. Every dish shows the factors behind its match, and when nothing fits every part of a request the list says \"Closest options\" instead of pretending.",
        ],
        figures: [
          { src: img("tadka", "phone-ranked"), caption: "Everything else, ranked", alt: "Ranked list of dishes with match scores", device: "phone" },
          { src: img("tadka", "phone-why"), caption: "Why Jev picked this", alt: "Dish sheet showing Jev fit, diet and weight factors behind an 85% match", device: "phone" },
          { src: img("tadka", "how"), caption: "The request, in numbers", alt: "How Jev picks page with 79 questions, latency, tokens and cost, and intent probabilities" },
          { src: img("tadka", "rules"), caption: "Rules turn answers into a ranking", alt: "Formula and factor chips for the top dishes" },
        ],
      },
      {
        id: "pwa",
        label: "02 / Installable",
        title: "Installable and Offline",
        body: [
          "Tadka is a progressive web app: Chrome reports it installable with no errors, and a service worker caches the app shell and dish photos. Offline, the installed app still opens and search falls back to a keyword matcher that says so on screen. Dark mode follows the phone's setting, and identical searches are served from a cache in milliseconds.",
        ],
        figures: [
          { src: img("tadka", "phone-dark"), caption: "Dark mode", alt: "Tadka in dark mode with comfort-food results", device: "phone" },
          { src: img("tadka", "phone-offline"), caption: "Offline fallback", alt: "Offline mode with a labelled keyword match", device: "phone" },
        ],
      },
      {
        id: "results",
        label: "03 / Results",
        title: "Measured Results",
        body: [
          "Across 17 fresh searches, Jev answered all 79 questions in a median **251 ms** (123 to 352 ms) using about **10,350 input tokens**, about **$0.00044** per search. \"Light vegetarian dinner\" returned dal tadka, bhindi masala and khichdi; \"something sweet for Diwali\" returned gulab jamun, gajar ka halwa and kheer; and \"pizza\" sensibly came back as closest options only.",
        ],
      },
    ],
  },
  {
    slug: "keystroke-dynamics",
    title: "Keystroke Dynamics",
    tagline:
      "Can AI-generated text be typed out with a human rhythm? A typing simulator built from 99 real typists, tested against the detectors meant to catch it.",
    category: "Security",
    year: "2026",
    status: "Course project",
    timeline: "Winter 2026 term",
    role: "Research design, ML pipeline, simulator and demo",
    team: "Solo",
    featured: true,
    stack: ["Python", "scikit-learn", "SciPy", "pandas", "Flask", "JavaScript"],
    domains: ["Cybersecurity", "Biometric authentication", "AI-text detection"],
    metrics: [
      { label: "Real typists in the dataset", value: "99" },
      { label: "Detector F1, Random Forest", value: "0.982" },
      { label: "Simulated windows that passed it", value: "56%" },
    ],
    links: { github: "https://github.com/poojaverma-me/BehaviouralBiometrics_ResearchPaper" },
    cover: img("keystroke-dynamics", "demo-evaluation"),
    thumbs: thumbs("keystroke-dynamics", ["a", "b", "c"]),
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "Detectors for AI-written text usually look at the words. A second line of defence looks at **how the text was typed**: real people have a rhythm of key holds, flights between keys and pauses that a paste or a bot does not. Keystroke dynamics is also used as a behavioural biometric for authentication.",
          "This project asks whether that defence holds. I built a **simulator** that types any text with timings sampled from real typists, trained **detectors** to separate human from synthetic typing, and measured how often the simulator gets through. A Flask demo replays the simulated typing live and asks the detectors for a verdict.",
        ],
        figures: [
          { src: img("keystroke-dynamics", "demo-ready"), caption: "The simulator demo", alt: "Keystroke Simulator web demo with a text input, speed selector and empty metric cards" },
        ],
      },
      {
        id: "data",
        label: "01 / Data",
        title: "What Human Typing Looks Like",
        body: [
          "The data is the **KeyRecs** free-text dataset: **99 participants**, two sessions each, **562,583** key-pair records. Cleaning removed nulls, corrupted rows and pauses over 10 seconds, leaving **559,485**.",
          "Three patterns shaped the simulator. Starting a new word is the slowest transition, about **53% slower** than typing inside a word (241 ms against 157 ms median). Typists differ by **3.8x** in median speed. And **17.2%** of transitions are rollovers, where the next key goes down before the last one comes up.",
        ],
        figures: [
          { src: img("keystroke-dynamics", "timing"), caption: "Human timing distributions", alt: "Histograms of key hold time, down-down flight time and up-down flight time" },
          { src: img("keystroke-dynamics", "word-boundaries"), caption: "Word boundaries slow typing", alt: "Box plots of flight time within a word, before a space and after a space" },
          { src: img("keystroke-dynamics", "rollover"), caption: "Rollover between keys", alt: "Histogram of overlapping and non-overlapping key transitions, and the most common overlapping key pairs" },
        ],
      },
      {
        id: "simulator",
        label: "02 / Simulator",
        title: "The Simulator",
        body: [
          "For each character, the engine samples a flight time from the distribution fitted to that **specific key pair**, then adjusts it for context (word start, mid-word, word end), the chosen speed profile and slow fatigue drift. It blends each new flight with the previous one so rhythm has momentum, and adds thinking pauses after commas and full stops. Hold times are sampled per key.",
          "The output is a full keystroke stream with key-down and key-up times, which the demo replays in real time while charting every flight.",
        ],
        figures: [
          { src: img("keystroke-dynamics", "demo-run"), caption: "A finished simulation", alt: "Completed simulation with typing metrics and a chart of flight time per keystroke" },
          { src: img("keystroke-dynamics", "phone-demo"), caption: "The demo on a phone", alt: "Keystroke simulator demo on a phone", device: "phone" },
        ],
      },
      {
        id: "detection",
        label: "03 / Detection",
        title: "Detection",
        body: [
          "Detectors see **19 features** computed over windows of 20 keystrokes: flight and hold statistics, their variability, rollover ratio and hold-to-flight ratio. I trained Random Forest, Gradient Boosting and AdaBoost on **26,430** human windows.",
          "The first version scored almost perfectly, which was the warning sign: its synthetic negatives were too easy to separate. I rebuilt the negatives from statistical mimics, independently resampled features and noise-perturbed human windows. On that harder task **Random Forest reached F1 0.982 and AUC 0.999**, Gradient Boosting 0.901 and AdaBoost 0.745. K-Means on the participants found four typing archetypes, from steady to fast-and-overlapping.",
        ],
        figures: [
          { src: img("keystroke-dynamics", "detectors"), caption: "Three detectors compared", alt: "ROC curves, classification metrics and top feature importances for three detectors" },
          { src: img("keystroke-dynamics", "archetypes"), caption: "Four typing archetypes", alt: "Elbow plot, PCA scatter and sizes of four typing archetypes" },
        ],
      },
      {
        id: "results",
        label: "04 / Results",
        title: "Results",
        body: [
          "Against the strongest detector the simulator is close to a coin flip: Random Forest called **56.3%** of simulated windows human. Gradient Boosting caught most of them, passing only **23.5%**. AdaBoost passed 82.6%, but it also passes 100% of naive synthetic typing, so that number says more about AdaBoost than about the simulator. Naive synthetic typing was caught almost every time by the two strong detectors (0% and 0.5% passed).",
        ],
        figures: [
          { src: img("keystroke-dynamics", "demo-evaluation"), caption: "Asking the detectors", alt: "Demo evaluation panel with Random Forest leaning human and Gradient Boosting calling the run synthetic" },
          { src: img("keystroke-dynamics", "simulation-vs-detectors"), caption: "Simulation against each detector", alt: "Share of simulated and naive windows classified human by each detector" },
        ],
      },
      {
        id: "lessons",
        label: "05 / What gave it away",
        title: "What Gave It Away",
        body: [
          "My report attributed the misses to rollover, which the simulator does not model explicitly. Going back to the outputs, rollover was actually close to human, because short sampled flights overlap long holds on their own. The clearer tell is **hold time**: some fitted distributions were degenerate, so about **18%** of simulated holds sit at the 20 ms floor, and hold features are four of the Random Forest's top seven.",
          "The fixes are concrete: refit holds with a fixed location or sample them empirically, add typos and corrections, and train detectors on keystroke-level synthetic streams instead of synthetic feature vectors.",
        ],
        figures: [
          { src: img("keystroke-dynamics", "real-vs-simulated"), caption: "Real against simulated timing", alt: "Real and simulated flight and hold time histograms, with a Q-Q plot of flight times" },
        ],
      },
    ],
  },
  {
    slug: "sprint-ticket-master",
    title: "Sprint Ticket Master",
    tagline:
      "Upload a spreadsheet of tasks and Google Gemini turns each one into an estimated, categorised sprint ticket on a Jira-style board.",
    category: "AI / ML",
    year: "2025",
    status: "Prototype",
    timeline: "2025",
    role: "UI, parsing, prompt design and API route",
    team: "Solo",
    featured: true,
    stack: ["Next.js 15", "React 19", "TypeScript", "Gemini 2.0 Flash", "SheetJS", "Tailwind CSS", "shadcn/ui"],
    domains: ["Project management", "Agile delivery"],
    metrics: [
      { label: "Fields generated per ticket", value: "8" },
      { label: "Server route between the browser and Gemini", value: "1" },
      { label: "Sampling temperature, for steady estimates", value: "0.2" },
    ],
    links: { github: "https://github.com/poojaverma-me/AI-based-Ticket-generator" },
    cover: img("sprint-ticket-master", "extracted"),
    thumbs: thumbs("sprint-ticket-master", ["a", "b", "c"]),
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "Before sprint planning, someone has to turn a rough task list into structured tickets: a clear title, a description, an estimate, an owner and a category. That list usually lives in a spreadsheet.",
          "Sprint Ticket Master automates the step. Upload an Excel file with a **Task Description** column, review what was extracted, and Gemini writes a full ticket for each task, shown as cards or a table and editable on a Jira-style detail page.",
        ],
        figures: [
          { src: img("sprint-ticket-master", "upload"), caption: "Upload a task list", alt: "Upload card for an Excel file with a template download button" },
          { src: img("sprint-ticket-master", "extracted"), caption: "Tasks extracted in the browser", alt: "Six extracted tasks listed after uploading a spreadsheet, with a Start Analysis button" },
        ],
      },
      {
        id: "how-it-works",
        label: "01 / How it works",
        title: "How It Works",
        body: [
          "**SheetJS** parses the workbook in the browser, so nothing leaves the machine until you choose to analyse. Files without a Task Description column are rejected with a clear message before any request is made.",
          "The tasks go to a single **Next.js API route**, which keeps the Gemini key on the server, calls **gemini-2.0-flash**, extracts the JSON array from the reply and assigns ticket IDs. Without a key configured, the route returns built-in demo tickets and the interface says so in a banner.",
        ],
        figures: [
          { src: img("sprint-ticket-master", "validation"), caption: "Validation before any request", alt: "Upload card showing an error that the file must contain a Task Description column" },
        ],
      },
      {
        id: "prompt",
        label: "02 / Prompt design",
        title: "Prompt Design",
        body: [
          "The prompt teaches the output by example: one complete ticket in JSON with all **eight fields** (title, three-point description, story points, assignee team, reporting lead, parent ticket, category, status), followed by the numbered task list.",
          "It also grounds the model in a fixed company context, with four teams, four leads, four categories and a parent-ticket ID format, so assignments land on real options instead of invented ones. Temperature **0.2** keeps estimates consistent between runs.",
        ],
      },
      {
        id: "interface",
        label: "03 / Interface",
        title: "Interface",
        body: [
          "Tickets open in a card view for a quick read or a table for scanning the whole sprint. Each one links to a detail page where the title, story points and status can be edited and saved for the session. The screenshots below show the app's built-in demo tickets.",
        ],
        figures: [
          { src: img("sprint-ticket-master", "cards"), caption: "Card view (demo tickets)", alt: "Generated tickets in a card grid with status, category, points and assignee" },
          { src: img("sprint-ticket-master", "table"), caption: "Table view (demo tickets)", alt: "Generated tickets in a table with ID, title, story points, assignee, category and status" },
          { src: img("sprint-ticket-master", "detail"), caption: "Ticket detail (demo ticket)", alt: "Ticket detail page with description, comments and an editable sidebar for status, points and assignee" },
          { src: img("sprint-ticket-master", "phone-cards"), caption: "Cards on a phone", alt: "Ticket cards stacked on a phone screen", device: "phone" },
        ],
      },
      {
        id: "next",
        label: "04 / Next",
        title: "What I'd Build Next",
        body: [
          "The prototype proves the flow end to end. The next version would harden it:",
        ],
        bullets: [
          "Gemini's structured output with a response schema, instead of extracting JSON from free text",
          "Validation of every field before it reaches the interface",
          "Persistence, so a generated sprint survives a refresh",
          "Authentication and rate limits on the API route",
        ],
      },
    ],
  },
  {
    slug: "schedulo",
    title: "Schedulo",
    tagline:
      "A real-time shift scheduler: employees swap shifts with a colleague in two clicks, and managers plan the week on a drag-and-drop board with conflict warnings and analytics.",
    category: "Full-Stack",
    year: "2025",
    status: "Prototype",
    timeline: "Nov 2025",
    role: "Lead developer: dashboards, swaps, calendar, analytics, data layer",
    team: "Two developers; a teammate built the sign-up flow",
    featured: true,
    stack: ["React", "TypeScript", "Vite", "Firebase Firestore", "Tailwind CSS", "shadcn/ui", "Recharts"],
    domains: ["Workforce management", "Retail and hospitality"],
    metrics: [
      { label: "Real-time Firestore listeners", value: "3" },
      { label: "Manager views over one dataset", value: "6" },
      { label: "Swap requests handled in testing", value: "24" },
    ],
    links: { github: "https://github.com/poojaverma-me/Schedulo" },
    cover: img("schedulo", "calendar"),
    thumbs: thumbs("schedulo", ["a", "b", "c"]),
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "In most shift jobs, swaps happen over text messages and the roster lives on paper or in a spreadsheet, so nobody is sure which version is current. Schedulo puts the roster, the swap handshake and the history of every change in one shared place that updates live.",
          "It has two roles. **Employees** see their week, request a swap with a colleague and answer requests sent to them. **Managers** plan the whole store on a week grid, see conflicts, and read the schedule through charts and an activity log.",
        ],
        figures: [
          { src: img("schedulo", "employee"), caption: "Employee dashboard", alt: "Employee dashboard with shift stats, a colour-coded week of shifts and a notifications sidebar" },
        ],
      },
      {
        id: "architecture",
        label: "01 / Architecture",
        title: "Architecture",
        body: [
          "Schedulo is a React and TypeScript single-page app on **Cloud Firestore**, with no server of its own. Five collections hold users, shifts, swap requests, availability and an activity log. Three `onSnapshot` listeners stream shifts, swap requests and the log, so a swap accepted on one screen moves the shift on every other screen at once.",
          "The hardest bug was identity. Shifts and swaps referred to employees by a short ID while user records used Firestore's generated IDs, which broke the analytics and the swap flow in different ways. I traced it with an in-app diagnostics page, wrote repair tooling for existing records, and standardised one ID scheme across the app.",
        ],
      },
      {
        id: "swaps",
        label: "02 / Swaps",
        title: "Shift Swaps",
        body: [
          "An employee picks a shift, chooses a colleague and sends the request. It appears in the colleague's sidebar in real time with Accept and Decline. Accepting reassigns the shift and writes the change to the activity log, so the manager sees who swapped what and when.",
        ],
        figures: [
          { src: img("schedulo", "swap-modal"), caption: "Requesting a swap", alt: "Request Shift Swap modal with a day shift and a list of colleagues" },
          { src: img("schedulo", "swaps"), caption: "Incoming swap requests", alt: "Notifications sidebar with accepted, declined and pending swap requests" },
        ],
      },
      {
        id: "manager",
        label: "03 / Manager tools",
        title: "Manager Tools",
        body: [
          "The store calendar lays every employee against seven days. Clicking an empty cell creates a shift for that person and day, and dragging a shift moves it to someone else or another day. Booking someone twice on one day raises a warning on that date and in the conflict count.",
          "Analytics recompute in the browser from the live shift listener: shifts per day, per employee and per type, plus a weekly trend. An availability heat map colours each employee's open hours per day; in this prototype the availability is generated sample data.",
        ],
        figures: [
          { src: img("schedulo", "manager"), caption: "Manager dashboard", alt: "Manager dashboard with team stats, six tabs and the store schedule" },
          { src: img("schedulo", "calendar"), caption: "Store calendar", alt: "Week grid of employees by day with colour-coded day, afternoon and night shifts" },
          { src: img("schedulo", "conflict"), caption: "Conflict warning", alt: "Store calendar with one employee double-booked and a conflict warning on that day" },
          { src: img("schedulo", "analytics"), caption: "Shift analytics", alt: "Pie chart of shift types with summary cards" },
        ],
      },
      {
        id: "onboarding",
        label: "04 / Onboarding",
        title: "Onboarding and Mobile",
        body: [
          "A four-step tutorial walks new users through the schedule, swaps, conflicts and the manager view. The employee schedule reflows into two columns on a phone, where most shift workers would check it.",
        ],
        figures: [
          { src: img("schedulo", "tutorial"), caption: "Four-step tutorial", alt: "Tutorial dialog on the step about requesting shift swaps" },
          { src: img("schedulo", "phone-login"), caption: "Login on a phone", alt: "Schedulo login on a phone", device: "phone" },
          { src: img("schedulo", "phone-schedule"), caption: "Schedule on a phone", alt: "Employee schedule cards on a phone", device: "phone" },
        ],
      },
      {
        id: "next",
        label: "05 / Next",
        title: "What I'd Harden Next",
        body: ["Schedulo works end to end as a prototype. To run it for a real team I would:"],
        bullets: [
          "Replace demo logins with Firebase Authentication and enforce roles in Firestore security rules",
          "Make swaps a single Firestore transaction that checks the shift's owner and the recipient's day",
          "Compare shift times in conflict detection, not just shifts per day",
          "Let employees enter their own availability and overlay it on the schedule",
        ],
      },
    ],
  },
  {
    slug: "workout-calories-ml",
    title: "Workout Calorie Prediction",
    tagline:
      "A full machine-learning study of 20,000 workout sessions across eleven model families, and the audit that showed why its best score was too good to be true.",
    category: "Data",
    year: "2025",
    status: "Course project",
    timeline: "Fall 2025, report Dec 2025",
    role: "Co-author: modelling, evaluation and report",
    team: "Two, with Gursahib Singh",
    featured: true,
    stack: ["Python", "scikit-learn", "pandas", "SciPy", "matplotlib", "seaborn", "LaTeX"],
    domains: ["Health and fitness", "Wearables"],
    metrics: [
      { label: "Workout sessions, 54 columns", value: "20,000" },
      { label: "Test R² as submitted, then without the leaked feature", value: "0.997 → 0.65" },
      { label: "PCA components for 95% of variance", value: "21" },
    ],
    links: { github: "https://github.com/poojaverma-me/Predicting-Workout-Calories-Burned-Using-Machine-Learning" },
    cover: img("workout-calories-ml", "workout-types"),
    thumbs: thumbs("workout-calories-ml", ["a", "b", "c"]),
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "Can calories burned in a workout be predicted from heart rate, session and body measurements, and which kind of model does it best? For our machine learning course at Thompson Rivers University, Gursahib Singh and I built a seven-stage Python pipeline that covers the whole syllabus: data quality, exploratory analysis, PCA, decision trees, ensembles, regularisation, SVMs, neural networks, classification, clustering and cross-validation.",
        ],
        figures: [
          { src: img("workout-calories-ml", "workout-types"), caption: "Calories by workout type", alt: "Violin, box and bar plots of calories by workout type, and a scatter of duration against calories" },
        ],
      },
      {
        id: "data",
        label: "01 / Data",
        title: "Data and Exploration",
        body: [
          "The Kaggle dataset has **20,000 sessions** and **54 columns** with no missing values. HIIT sessions averaged **1,653** calories against **897** for yoga, and an ANOVA confirmed the workout-type effect (p < 0.001) while diet type had none (p = 0.36). Session duration had the strongest correlation with calories burned (**0.81**).",
          "PCA over 41 numeric features needed **21 components** for 95% of the variance: the first captured body composition and the second heart-rate intensity. The scatter of duration against calories falls on perfectly straight lines, a sign the dataset is synthetic, which the report notes as a limitation.",
        ],
        figures: [
          { src: img("workout-calories-ml", "correlations"), caption: "Top correlations with calories", alt: "Bar chart of the 15 features most correlated with calories burned" },
          { src: img("workout-calories-ml", "pca"), caption: "PCA explained variance", alt: "Scree plot and cumulative explained variance for the principal components" },
        ],
      },
      {
        id: "models",
        label: "02 / Models",
        title: "Models",
        body: [
          "We compared six ensembles (Random Forest, ExtraTrees, AdaBoost, Gradient Boosting, stacking and voting), Lasso, Ridge and ElasticNet, SVR with three kernels and four neural network sizes, then checked the strongest with 5-fold cross-validation and a learning curve. K-Means grouped sessions into three loose personas (silhouette about 0.19).",
          "As submitted, **Gradient Boosting** won with test **R² 0.997** and RMSE 27.7 calories, and 0.989 in cross-validation.",
        ],
        figures: [
          { src: img("workout-calories-ml", "ensembles"), caption: "Ensemble comparison", alt: "Test R², RMSE, train against test R² and feature importances for six ensemble models" },
          { src: img("workout-calories-ml", "clustering"), caption: "K-Means clustering", alt: "Elbow and silhouette plots, clusters by age and BMI, and cluster sizes" },
        ],
      },
      {
        id: "audit",
        label: "03 / Audit",
        title: "Why 0.997 Was Too Good",
        body: [
          "Plain Ridge and Lasso scored a **perfect 1.000**. A linear model fitting exactly means some input already contains the answer. The culprit was `cal_balance`, a column that ships with the dataset and equals calorie intake minus calories burned, checked on all 20,000 rows. With intake also in the inputs, the target was a simple subtraction away.",
          "We had excluded three other leaky columns, but missed this one. Rerunning the same Gradient Boosting setup without `cal_balance` drops test R² to **0.65**. Adding back workout type, which the pipeline had silently dropped as a text column, lifts it to 0.9999 on this synthetic data: the honest finding is that duration, workout type and experience level almost fully determine the target here, which says little about real wearable data.",
        ],
        figures: [
          { src: img("workout-calories-ml", "cross-validation"), caption: "Cross-validated R²", alt: "Cross-validated R² by model with Ridge and Lasso at 1.000" },
          { src: img("workout-calories-ml", "regularization"), caption: "Regularisation paths", alt: "Lasso and Ridge regularisation paths and the largest coefficients" },
          { src: img("workout-calories-ml", "tree-importance"), caption: "Decision tree importance", alt: "Decision tree feature importance with session duration first and cal_balance second" },
        ],
      },
      {
        id: "lessons",
        label: "04 / Lessons",
        title: "What I Took From It",
        body: ["The broad pipeline was the assignment; the leak was the lesson."],
        bullets: [
          "A perfect score from a simple model is a bug report, not a result",
          "Check every engineered or pre-derived column for a path back to the target",
          "Encode categorical columns explicitly instead of selecting numeric types and losing them",
          "Synthetic data can validate a pipeline but not a real-world claim",
        ],
      },
    ],
  },
  {
    slug: "solo-ascend",
    title: "Solo Ascend",
    tagline:
      "A habit tracker that plays like an RPG: daily habits become quests that earn XP, train stats and climb the hunter ranks of Solo Leveling.",
    category: "Full-Stack",
    year: "2026",
    status: "Prototype",
    timeline: "Jan 2026",
    role: "Design and front end",
    team: "Solo",
    featured: true,
    stack: ["React 19", "Vite 7", "Tailwind CSS 4", "Framer Motion", "date-fns"],
    domains: ["Personal productivity", "Gamification"],
    metrics: [
      { label: "XP per completed quest", value: "50" },
      { label: "Named levels", value: "20" },
      { label: "Hunter ranks, E-Rank to Shadow Monarch", value: "8" },
    ],
    links: { github: "https://github.com/poojaverma-me/Solo_Ascend" },
    cover: img("solo-ascend", "dashboard"),
    thumbs: thumbs("solo-ascend", ["a", "b", "c"]),
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "Habit trackers are checklists, and checklists are easy to abandon. Solo Ascend borrows the **System** interface from the Solo Leveling manhwa, where the hero levels up by completing daily quests, and applies it to real habits.",
          "Each habit is a quest tied to a stat you choose to train, like Focus or Strength. Completing it earns XP and raises that stat; finishing the day produces an evaluation and can level you up.",
        ],
        figures: [
          { src: img("solo-ascend", "landing"), caption: "Landing page", alt: "Solo Ascend landing page with the headline Gamify Your Existence" },
          { src: img("solo-ascend", "onboarding"), caption: "Player onboarding", alt: "Onboarding form with a player name and selected attributes including a custom Research attribute" },
        ],
      },
      {
        id: "progression",
        label: "01 / Progression",
        title: "The Progression System",
        body: [
          "Every completed quest gives **50 XP** and **+2** to its stat, capped at 100. Each **1,000 XP** is a level, granted when you finalise the day, and the 20 levels carry titles from the series, from The World's Weakest to The Absolute Sovereign. Total XP sets your hunter rank across **eight tiers**, from E-Rank at the start to Shadow Monarch at 250,000 XP.",
          "The numbers are tuned so progress is visible daily (20 quests is a level) while the top rank takes years of consistency.",
        ],
        figures: [
          { src: img("solo-ascend", "dashboard"), caption: "Dashboard", alt: "Dashboard with level, rank progress bars and a weekly completion chart" },
          { src: img("solo-ascend", "quests"), caption: "Attributes and daily quests", alt: "Player attribute bars beside a daily quest list with three quests completed" },
        ],
      },
      {
        id: "evaluation",
        label: "02 / Evaluation",
        title: "Finishing the Day",
        body: [
          "Finalising the day opens an **Evaluation Manifest**: quests cleared, completion rate, stat gains and XP harvested. If the level bar is full, the player levels up and earns a new title. Each finalised day is archived, and the Quest Archives calendar shows completion per day with a breakdown of every quest.",
        ],
        figures: [
          { src: img("solo-ascend", "evaluation"), caption: "Evaluation Manifest", alt: "Evaluation screen showing five quests cleared, 83% completion, stat gains and 250 XP" },
          { src: img("solo-ascend", "level-up"), caption: "After a level up", alt: "Dashboard after levelling up to level 7, Instance Dungeon Crawler" },
          { src: img("solo-ascend", "archives"), caption: "Quest Archives", alt: "Monthly calendar of completed days with a per-quest breakdown for one day" },
        ],
      },
      {
        id: "build",
        label: "03 / Build",
        title: "How It's Built",
        body: [
          "Solo Ascend is a React 19 app built with Vite, styled with **Tailwind CSS 4** configured entirely in CSS, and animated with **Framer Motion**. A small state machine moves the player from landing to login, onboarding and the dashboard, with animated transitions between them.",
          "Everything is stored in the browser, namespaced by player, so the app needs no account or server. Dark and light themes share one set of design tokens, and the layout collapses to a single column on phones.",
        ],
        figures: [
          { src: img("solo-ascend", "dashboard-light"), caption: "Light theme", alt: "Dashboard in the light theme" },
          { src: img("solo-ascend", "phone-landing"), caption: "Landing on a phone", alt: "Solo Ascend landing page on a phone", device: "phone" },
          { src: img("solo-ascend", "phone-dashboard"), caption: "Dashboard on a phone", alt: "Solo Ascend dashboard on a phone", device: "phone" },
        ],
      },
      {
        id: "next",
        label: "04 / Next",
        title: "What's Next",
        body: ["The roadmap turns the prototype into something to use every day:"],
        bullets: [
          "Reset quests automatically at midnight and compute real streaks",
          "Sync across devices with a hosted database",
          "Let players choose the stat each quest trains",
          "Bring back the System Advisor as an AI coach that reads your history",
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
