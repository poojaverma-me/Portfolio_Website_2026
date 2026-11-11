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
    slug: "living-city",
    title: "The Living City",
    tagline:
      "A 3D miniature city inside an animal cell: walk its streets with a scientist guide, explore 11 organelle districts, try a hands-on activity in each and hunt for 24 hidden curiosities.",
    category: "Full-Stack",
    year: "2026",
    status: "Shipped",
    timeline: "Oct 2026",
    role: "Game design, 3D world, science activities and audio",
    team: "Solo",
    featured: true,
    stack: ["Three.js", "JavaScript", "Vite", "postprocessing", "GSAP", "Web Audio API", "Gemini TTS"],
    domains: ["Science education", "Cell biology", "Game-based learning"],
    metrics: [
      { label: "Organelle districts, each with a hands-on activity", value: "11" },
      { label: "Hidden curiosities to find", value: "24" },
      { label: "Voiced lines for the guide and workers", value: "108" },
    ],
    links: { live: "https://the-living-city.poojaverma.ca/", github: "https://github.com/poojaverma-me/TheLivingCity" },
    cover: img("living-city", "golgi"),
    thumbs: thumbs("living-city", ["a", "b", "c"]),
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "The Living City turns a classic biology poster, the animal cell drawn as a city, into a place you can walk around. Every organelle is a district: the nucleus is a control centre under a violet dome, the mitochondria are power plants, the Golgi apparatus is a packaging and shipping hall, and lysosomes are recycling tanks. Lab-coat workers, delivery trucks and vesicles keep the streets busy.",
          "It is built for intro cell biology students and curious adults. There are no levels or locks: you explore freely, and the reward is curiosity. The opening shot matches the poster, then the camera descends to the front gate and the city is yours.",
        ],
        figures: [
          { src: img("living-city", "overview"), caption: "The poster view: the whole cell as a city", alt: "Isometric 3D animal cell shaped like a city, with a violet nucleus dome, blue rough ER rings, orange mitochondria and a pink Golgi stack" },
          { src: img("living-city", "labels"), caption: "Science labels over the overview", alt: "The cell city from above with numbered labels for each organelle" },
        ],
      },
      {
        id: "world",
        label: "01 / The world",
        title: "A Miniature You Can Walk",
        body: [
          "The city is made in Three.js and lit like a hand-built scale model: satin paint, glass and brushed metal under soft studio light, with ambient occlusion, bloom and a tilt-shift blur that makes it read as a miniature. One layout file holds every position, so districts, roads and the membrane gates never drift out of place.",
          "About **140 workers** walk the streets, all drawn in **5 draw calls**: one instanced, GPU-skinned crowd with per-worker colour, and level of detail that drops far figures from the colour pass. Trucks, staff at their stations and drifting vesicles fill in the rest.",
        ],
        figures: [
          { src: img("living-city", "nucleus"), caption: "The nucleus control centre", alt: "Violet glass dome over a control room with screens and a glowing nucleolus orb, ringed by the rough ER" },
          { src: img("living-city", "mito"), caption: "A mitochondrion power plant", alt: "Orange capsule-shaped mitochondrion with glowing cristae, among city streets" },
          { src: img("living-city", "street"), caption: "Street level near Protein QC", alt: "Street with a recycling tank, the Golgi shipping hall, a Protein QC sign and workers" },
        ],
      },
      {
        id: "learning",
        label: "02 / Learning by doing",
        title: "Learning by Doing",
        body: [
          "Each of the **11 districts** has something to look at closely and something to try. You transcribe a gene at the nucleus console, sort tagged cargo through the Golgi to lysosomes, the membrane or secretion, and pump protons across a crista until ATP synthase spins and releases ATP. The city analogy stays an analogy; the labels, cards and deeper notes on top are accurate science.",
          "Dr. Celia Mendel, a scientist guide, walks with you, explains a place when you ask and offers a guided tour. Her lines and the workers' are **108 voiced lines in 5 voices**, generated offline with Gemini text-to-speech and cached by content hash, so only changed lines are regenerated. A field notebook tracks the districts you have visited, the activities you have tried and the **24 curiosities** you have found.",
        ],
        figures: [
          { src: img("living-city", "sorting"), caption: "Sort the cargo at the Golgi", alt: "Golgi activity with parcels routed to lysosome, plasma membrane or secretion" },
          { src: img("living-city", "proton"), caption: "Proton power in a mitochondrion", alt: "Magnified crista with protein complexes, a proton gradient and ATP synthase" },
          { src: img("living-city", "guide"), caption: "Dr. Celia explains the lysosomes", alt: "Lysosome recycling tank beside a delivery truck with the guide's subtitle at the bottom" },
        ],
      },
      {
        id: "engineering",
        label: "03 / Engineering",
        title: "Built to Run in a Browser",
        body: [
          "Graphics quality is chosen automatically from three tiers, which change render resolution, shadow map size, ambient occlusion and the tilt-shift pass, and the player can override it. In a headless Chrome capture at 1800 by 1125 on an Apple M4, the full city drew in **198 draw calls**, about **2.1 million triangles**, at **42 fps**.",
          "All sound is generated in code with the Web Audio API: ambience, effects and generative music. A QA script renders every effect offline and checks it against loudness targets (peak at or below -1 dBFS, no DC offset, little energy above 8 kHz). Scripted playtests, headless GPU screenshots and a per-district performance breakdown ran alongside, and the art direction went through **17 recorded review rounds** against the reference poster.",
        ],
        figures: [
          { src: img("living-city", "ser"), caption: "The smooth ER detox district", alt: "Green folded smooth ER ribbons with enzyme stations beside a winding road" },
          { src: img("living-city", "membrane"), caption: "Through the membrane", alt: "City blocks seen through the translucent cell membrane near a vesicle port" },
        ],
      },
    ],
  },
  {
    slug: "floating-physics-kingdom",
    title: "The Floating Physics Kingdom",
    tagline:
      "An isometric 3D exploration game about physics, set on floating islands above a sea of clouds: no levels, no scores, just ancient machines that wake when you get the physics right, with every simulation checked against hand calculations.",
    category: "Full-Stack",
    year: "2026",
    status: "Prototype",
    timeline: "Oct 2026",
    role: "Design, simulation and engine",
    team: "Solo",
    featured: false,
    stack: ["Three.js", "Rapier", "TypeScript", "Vite", "Vitest", "Gemini TTS"],
    domains: ["Game-based learning", "Physics education"],
    metrics: [
      { label: "Simulation checks vs hand calculations", value: "100 passing" },
      { label: "Ancient machines to wake", value: "10" },
      { label: "External art assets", value: "0" },
    ],
    links: {},
    cover: img("floating-physics-kingdom", "title"),
    thumbs: thumbs("floating-physics-kingdom", ["a", "b"]),
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "The machines of a floating kingdom have fallen silent, and nobody remembers how they worked. You wander between islands, each one a physics topic made walkable: the Temple of Motion, the Waterwheel Sanctuary, the Garden of Arcs, the Storm Shrine, the Observatory Spire.",
          "There are no levels and no score. Waking a machine means actually getting the physics right: setting a projectile's angle, balancing a truss, closing a circuit. The chapter structure follows the CBSE / NCERT Class 9 syllabus, so the game doubles as a curriculum companion rather than a generic science toy.",
        ],
        figures: [
          { src: img("floating-physics-kingdom", "title"), caption: "The kingdom: each island is a physics chapter", alt: "Title screen showing floating islands labelled Temple of Motion, Garden of Arcs, Pagoda of Echoes, Storm Shrine and Observatory Spire above a sea of clouds" },
        ],
      },
      {
        id: "world",
        label: "01 / The world",
        title: "The World",
        body: [
          "Everything is generated in code: no downloaded models, textures or audio. Toon-ramp materials, procedural textures, procedural music and ambience, and a living day cycle with dusk, stars, aurora and sky lanterns. Cranes, butterflies, koi and fireflies keep the islands breathing between experiments.",
          "Rapier drives rigid-body physics for everything that moves, and the character walks, jumps and rides gondolas between islands with pathfinding on the walkable mesh.",
        ],
        figures: [
          { src: img("floating-physics-kingdom", "gameplay-storm"), caption: "Storm Shrine: circuits, induction and a lightning pool, mid-rain", alt: "Storm Shrine island in the rain with Tesla coil towers, a glowing lightning pool and the HUD showing Class 9 Chapter 1 progress" },
          { src: img("floating-physics-kingdom", "gameplay-arcs"), caption: "Garden of Arcs: projectile range markers on real terrain", alt: "Garden of Arcs island with a launcher, distance markers at 2, 4 and 6 metres, a pagoda and a fountain" },
        ],
      },
      {
        id: "simulations",
        label: "02 / Real simulations",
        title: "Real Simulations",
        body: [
          "Each machine runs a real model, not an animation: projectile motion with drag, a 2D truss stiffness solver, nodal circuit analysis, the wave equation, ray optics, orbital mechanics, hydraulics and light gates, all in src/sim as pure TypeScript.",
          "The test suite checks the simulations against hand calculations, and it is the number I am proudest of on this page: **100 checks passing**. When the notebook tells you the game's model of something is simplified, that honesty is possible because the model is explicit enough to test.",
        ],
        figures: [
          { src: img("floating-physics-kingdom", "film"), caption: "Story films set up each machine's question before you touch it", alt: "In-game story film frame where the Keeper asks which of a heavy and a light ball lands first from the drop tower" },
        ],
      },
      {
        id: "learning",
        label: "03 / Learning design",
        title: "Learning Design",
        body: [
          "The Physics Notebook is the spine: a journey view mapping each NCERT chapter to its island, 30 collectible ideas each with its equation and an honest note on how the game models it, an experiment log of your own results, and the films you have unlocked.",
          "Character voices are pre-generated with Gemini TTS at build time, so no API key ever reaches the browser, and every line still appears as a caption without the audio files.",
        ],
        figures: [
          { src: img("floating-physics-kingdom", "notebook"), caption: "The notebook: NCERT chapters mapped to islands", alt: "Physics Notebook overlay with Journey, Films, Ideas, Experiment log and Machines tabs, listing Class 9 chapters Motion, Force and Laws of Motion and Gravitation" },
          { src: img("floating-physics-kingdom", "chapters"), caption: "Pick a chapter and Pip flies you to its island", alt: "Choose a chapter overlay with Class 9 to 12 tabs and NCERT chapters mapped to islands, including one marked island being built" },
        ],
      },
      {
        id: "results",
        label: "04 / Results",
        title: "Results",
        body: [
          "The Kingdom is the largest thing I have built alone: an engine-level project where the physics is the gameplay, the art is code, and the curriculum is a real one.",
        ],
        bullets: [
          "100 simulation checks against hand calculations, run with Vitest",
          "10 machines across the islands, each woken by doing the physics, not watching it",
          "Every asset generated in code: geometry, textures, music and ambience",
          "CBSE / NCERT Class 9 chapter structure, with honest notes where the model simplifies",
        ],
      },
    ],
  },
  {
    slug: "voice-receptionist",
    title: "Clinic Voice Receptionist",
    tagline:
      "A real-time AI voice receptionist for a family clinic: it answers calls, books, cancels and reschedules appointments in Google Calendar, and answers questions only from what the clinic has told it.",
    category: "AI / ML",
    year: "2026",
    status: "In Progress",
    timeline: "Oct 2026",
    role: "Voice agent, tool design, calendar integration and interface",
    team: "Solo",
    featured: true,
    stack: ["Gemini Live API", "React", "TypeScript", "Vite", "Google Calendar API", "OAuth 2.0", "Web Audio API"],
    domains: ["Voice AI", "Agentic AI", "Healthcare scheduling"],
    metrics: [
      { label: "Tools the agent calls: check, book, find, cancel, reschedule", value: "5" },
      { label: "Nearest open times offered when a slot is taken", value: "3" },
      { label: "Languages it answers in: English, Spanish, Hindi", value: "3" },
    ],
    links: {},
    cover: img("voice-receptionist", "week"),
    thumbs: thumbs("voice-receptionist", ["a", "b", "c"]),
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "Small clinics lose calls when the front desk is busy. This project puts **Ava**, an AI receptionist, on the line for a demo practice, Brightside Family Clinic. Callers talk to her in plain speech; she books, cancels and reschedules appointments, answers questions about hours, insurance and prices, and reads back a confirmation code.",
          "The front desk sees everything on one screen: the call and its live transcript on the left, and the clinic's week on the right, synced from a real **Google Calendar**. Every booking, cancellation and reschedule is written straight to that calendar, so staff can keep working in the tool they already use.",
        ],
        figures: [
          { src: img("voice-receptionist", "week"), caption: "The front desk: receptionist and the clinic's week (demo bookings)", alt: "Receptionist panel with a Start call button beside a week calendar of appointments and a staff training block" },
        ],
      },
      {
        id: "voice",
        label: "01 / The call",
        title: "A Real-Time Voice Call",
        body: [
          "The call runs on the **Gemini Live API**, which takes audio in and speaks back with no separate speech-to-text or text-to-speech step. An AudioWorklet resamples the microphone to 16 kHz, 16-bit PCM and streams it in **50 ms chunks**; replies play back at 24 kHz. If the caller talks over Ava, playback stops at once and she listens.",
          "Both sides are transcribed live into the panel, and tool results appear inline so staff can see why Ava said what she said. Long calls stay connected through context compression and session resumption, and if the microphone is blocked the call carries on in type-to-talk mode, which also makes the receptionist easy to test.",
        ],
        figures: [
          { src: img("voice-receptionist", "phone"), caption: "Ready for calls on a phone", alt: "Phone view of the receptionist with a glowing orb and a green Start call button", device: "phone" },
          { src: img("voice-receptionist", "list"), caption: "Upcoming appointments, with voice bookings marked to verify (demo bookings)", alt: "List of upcoming appointments grouped by day with Verified and Verify badges" },
        ],
      },
      {
        id: "tools",
        label: "02 / Tools",
        title: "Tools, Not Guesses",
        body: [
          "Ava never decides from memory whether a time is free. She has **five function-calling tools**: check availability, book, find the caller's appointments, cancel and reschedule. Every tool call first re-reads the calendar, because staff may have changed it by hand a moment ago.",
          "The rules live in code, not in the prompt: 30-minute slots on the hour or half hour, the clinic's opening hours and lunch break, and no times in the past. When a slot is taken, the tool returns the **three nearest open times**, on the same day first and then over the next two weeks. Any other event on the calendar, such as staff training, blocks that time too. A booking needs a full name and a phone number, and returns a six-character confirmation code that leaves out look-alike characters such as 0 and O.",
          "In a scripted test against a stand-in calendar, each tool behaved as designed: a taken 10:30 slot came back with 9:30, 10:00 and 11:30; a Sunday request returned \"closed\" with the next openings; a booking with only a first name paused to ask for details; and a lookup with the wrong phone number found nothing.",
        ],
        figures: [
          { src: img("voice-receptionist", "activity"), caption: "The activity log: every voice action, including a declined slot (demo data)", alt: "Activity list showing a cancellation, two reschedules, two bookings and a requested slot that was unavailable, each tagged Voice" },
        ],
      },
      {
        id: "privacy",
        label: "03 / Privacy",
        title: "Private by Design",
        body: [
          "A receptionist hears about other people's health, so privacy is built into the data layer, not just the prompt. Tools only ever return a caller-safe view of an appointment. A caller's bookings are found only when their **name and phone number both match**, Ava never says who holds a slot, and other calendar events block time without their details ever reaching a caller.",
          "Bookings made by voice are marked **Needs verification** until a person at the front desk confirms them. The instructions also rule out diagnosis and medication advice and send emergencies to 911. Google sign-in runs through a small local OAuth broker, so the client secret and refresh token stay on the server and the browser only receives short-lived access tokens; Gemini keys stay in the browser's local storage and a production build never ships one.",
        ],
        figures: [
          { src: img("voice-receptionist", "sheet"), caption: "A voice booking waiting for staff to verify it (demo booking)", alt: "Appointment sheet for a new patient with reason, phone, confirmation code and a Mark as Verified button" },
          { src: img("voice-receptionist", "settings"), caption: "Settings: Google Calendar, demo data and masked API keys", alt: "Settings sheet showing a connected Google Calendar, demo booking controls and a masked Gemini API key" },
        ],
        bullets: [
          "Status: in progress, running locally; not yet connected to a phone line",
          "Screenshots use the app's tagged demo bookings on a stand-in calendar, not patient data",
        ],
      },
    ],
  },
  {
    slug: "plainsight",
    title: "Plainsight",
    tagline:
      "A legal and medical information assistant that answers in plain language and cites an official source for every claim: hybrid retrieval over 127 government documents, Claude Haiku answers measured at $0.0007 each, and a hands-free voice mode on Gemini Live.",
    category: "AI / ML",
    year: "2026",
    status: "Prototype",
    timeline: "Oct 2026",
    role: "Design, retrieval pipeline and front end",
    team: "Solo",
    featured: false,
    stack: ["Next.js 16", "TypeScript", "Claude Haiku 5.5", "Gemini embeddings", "Gemini Live", "Tailwind CSS 4"],
    domains: ["Legal information", "Consumer rights", "Voice interfaces"],
    metrics: [
      { label: "Official documents indexed", value: "127" },
      { label: "Searchable passages", value: "3,738" },
      { label: "Measured cost per answer", value: "$0.0007" },
    ],
    links: { github: "https://github.com/poojaverma-me/Plainsight" },
    cover: img("plainsight", "home"),
    thumbs: thumbs("plainsight", ["a", "b"]),
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "Plainsight answers everyday legal and medical-legal questions: rent increases, eviction notices, traffic tickets, consent to care. It covers four regions (British Columbia, Ontario, California, New York), and every answer is drawn from statutes, government guides and regulators, with a numbered citation on each claim.",
          "The rule that shapes the whole app: the model is never allowed to answer from its own memory. Retrieval finds official passages first, Claude Haiku explains only what those passages say, and every answer carries a triage level that points to the right professional. It presents itself as general information, not legal or medical advice.",
        ],
        figures: [
          { src: img("plainsight", "home"), caption: "Home: four topics, one region, grounded in 37 BC sources", alt: "Plainsight home page with the headline 'Know where you stand, in plain language', four topic filters and suggested questions" },
        ],
      },
      {
        id: "honesty",
        label: "01 / The honesty test",
        title: "The Honesty Test",
        body: [
          "The question 'How much can my landlord raise the rent this year?' is the trap every legal chatbot falls into: the yearly percentage changes, and a language model will happily invent one. Plainsight's corpus intentionally holds the rules but not the current figure, and the answer says exactly that: the sources do not give this year's percentage, here is how the limit works, here is the official calculator.",
          "Everything else in the answer is cited: the no-rounding rule, the 12-month wait, the 3 months' written notice on the approved form. The sources rail shows which passages were retrieved, each with its cosine score and keyword rank, so the grounding is inspectable rather than claimed.",
        ],
        figures: [
          { src: img("plainsight", "answer"), caption: "A cited answer that refuses to invent the one number it does not have", alt: "Plainsight answer about rent increases with a triage chip, British Columbia badge, numbered citations and a sources rail showing 5 cited of 8 retrieved" },
        ],
      },
      {
        id: "retrieval",
        label: "02 / Retrieval",
        title: "Retrieval",
        body: [
          "The library holds **127 documents** from governments, tribunals, regulators, Crown insurers and legal-aid organisations, plus statute text. Heading-aware chunking turns them into **3,738 passages**; Gemini embeddings (768-d, L2-normalised) live in an 11.5 MB binary file, so there is no vector database service to run.",
          "Search is hybrid: BM25 rewards exact legal terms like 'security deposit', semantic search catches 'kicked out' meaning eviction. The two rankings merge with reciprocal-rank fusion, the chosen topic gets a gentle boost, each document contributes at most 2 passages, and the top 8 go to the model. The app's own How It Works page traces a real query live: for BC that is 1,195 candidate passages, 376 ms to embed, 3 ms to search.",
        ],
        figures: [
          { src: img("plainsight", "how-it-works"), caption: "The pipeline explaining itself on a real query", alt: "How Plainsight answers page showing corpus stats and a live trace with BM25 and cosine top hits for the rent question" },
          { src: img("plainsight", "library"), caption: "Source library: every document the answers can draw from", alt: "Source library page showing 37 BC documents and 1,195 searchable passages with filters by type and topic" },
        ],
      },
      {
        id: "answering",
        label: "03 / Answering",
        title: "Answering",
        body: [
          "Claude Haiku 5.5 writes the answer behind a byte-stable cached system prompt, with three rules: cite every claim, never invent figures or deadlines, and say so when the library does not cover something. Answers stream as NDJSON with a fixed structure: what the rules say, your options, next steps, when to get professional help.",
          "Measured on repeated runs: **0.9 to 1.0 s** to the first word, under 4.2 s for the full answer, about 3,900 tokens, **$0.0007** per answer. Failure modes are designed in: if Claude is unavailable the app shows the top official passages instead, and if embeddings fail, search falls back to keywords and says so.",
        ],
        figures: [
          { src: img("plainsight", "answer-sources"), caption: "Options, next steps, and the measured footer: 3.8 s and $0.0007", alt: "Lower half of a Plainsight answer with next steps, professional help section and a footer reading haiku-5-5, 0.9s first word, 3.8s, 3,878 tokens, $0.0007" },
        ],
      },
      {
        id: "voice-safety",
        label: "04 / Voice and safety",
        title: "Voice and Safety",
        body: [
          "A voice mode runs on the Gemini Live API: you talk naturally, Gemini transcribes and calls the same retrieval pipeline through a lookup_answer tool, and the cited answer appears on screen while it speaks. The grounding rules do not change because the modality did.",
          "Safety is handled before search, not after: emergency phrases surface a call-911 / 9-8-8 banner immediately, every answer carries a triage level, and the disclaimer that Plainsight is not a lawyer or a doctor sits on every screen.",
        ],
        figures: [
          { src: img("plainsight", "phone-home"), caption: "Home on a phone", alt: "Plainsight home page on a phone", device: "phone" },
          { src: img("plainsight", "phone-answer"), caption: "A cited answer on a phone", alt: "Plainsight rent increase answer on a phone with triage chip and citations", device: "phone" },
        ],
      },
      {
        id: "results",
        label: "05 / Results",
        title: "Results",
        body: [
          "Plainsight is the answer-engine pattern I now reach for when correctness matters more than fluency: retrieve first, cite everything, measure the cost, and make refusing to guess a feature.",
        ],
        bullets: [
          "127 official documents, 3,738 passages, 4 regions, one 11.5 MB embedding file, no vector database service",
          "Hybrid BM25 + semantic retrieval fused by reciprocal rank, at most 2 passages per document, top 8 to the model",
          "Measured answers: first word in about 1 s, $0.0007 each, with citations on every claim",
          "Asked for this year's rent cap, it says the number is not in its sources instead of inventing one",
        ],
      },
    ],
  },
  {
    slug: "quanta",
    title: "Quanta",
    tagline:
      "An AI data analyst that runs in the browser: drop a CSV and DuckDB-WASM turns it into a typed SQL database that never leaves the tab, Claude profiles and charts it, an autonomous Opus agent investigates it, and you can ask follow-ups out loud.",
    category: "Data",
    year: "2026",
    status: "Prototype",
    timeline: "Oct 2026",
    role: "Design, data pipeline and agent loops",
    team: "Solo",
    featured: false,
    stack: ["Next.js 16", "DuckDB-WASM", "Highcharts", "Claude Opus 5.5", "Claude Haiku 5.5", "Gemini Live"],
    domains: ["Data analytics", "Business intelligence"],
    metrics: [
      { label: "Live deep dive, measured", value: "88 s · $0.25" },
      { label: "SQL queries the agent ran", value: "8" },
      { label: "Measured cost to profile a CSV", value: "$0.001" },
    ],
    links: { github: "https://github.com/poojaverma-me/Quanta" },
    cover: img("quanta", "overview"),
    thumbs: thumbs("quanta", ["a", "b"]),
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "Most 'chat with your data' tools upload the file to a server. Quanta inverts that: the CSV is staged into **DuckDB-WASM inside the browser tab**, and the raw rows never leave it. The models see the schema, column statistics and the results of the SQL they ask for, nothing more.",
          "The browser owns every agent loop. API routes only forward model calls; each model-written query passes a read-only guard (single SELECT or WITH statements, no file or URL readers) and runs locally. The result is an analyst you can hand sensitive data to without a data-processing conversation.",
        ],
        figures: [
          { src: img("quanta", "landing"), caption: "Landing: drop a CSV, or try a synthetic dataset", alt: "Quanta landing page with the headline 'Your spreadsheets, as an analyst you can talk to', a CSV dropzone and three sample datasets" },
        ],
      },
      {
        id: "ingestion",
        label: "01 / Typed ingestion",
        title: "Typed Ingestion",
        body: [
          "A CSV lands as an all-VARCHAR table, then Claude Haiku reads 20 sample rows and writes the typed schema: column types, roles, date formats and an executive summary. Each column is converted with TRY_CAST, and any column where more than 20% of values fail falls back to text rather than corrupting rows.",
          "I verified the live path with a 388-row cafe-sales CSV generated for the test: Haiku named it 'Cafe Sales Transactions', classified it as food and beverage retail, typed the dates, and the whole profile cost **$0.001**.",
        ],
        figures: [
          { src: img("quanta", "live-overview"), caption: "A 388-row test CSV, profiled live for $0.001", alt: "Quanta overview of a live-uploaded cafe sales CSV, named and sector-classified by Claude Haiku, with charts and a live token meter in the header" },
        ],
      },
      {
        id: "dashboard",
        label: "02 / Dashboard",
        title: "Dashboard",
        body: [
          "The Overview tab renders a dashboard generated from the profile: KPI cards with glowing pill columns and rolling averages, a neon barcode of daily records with the busiest fortnight lit, ranked category rows, and a set of 3D and radar cards, all Highcharts on black, styled after Setproduct's Hyper Charts kit.",
          "Every card is honest about its provenance: each one has a table toggle and a SQL toggle, so the query behind any number is one click away.",
        ],
        figures: [
          { src: img("quanta", "overview"), caption: "Overview: KPI cards and the daily-records barcode", alt: "Quanta overview dashboard for the IT support tickets sample with a green barcode chart, weekly KPI cards and category rows" },
          { src: img("quanta", "overview-cards"), caption: "The 3D report cards further down the page", alt: "Category landscape, peak days and daily rhythm 3D chart cards on the Quanta overview" },
        ],
      },
      {
        id: "deep-dive",
        label: "03 / The deep dive agent",
        title: "The Deep Dive Agent",
        body: [
          "Deep Dive hands the dataset to an autonomous Claude Opus agent with two tools: run_sql and submit_report. It plans, queries, reasons about what it finds and queries again, streaming every step to a live agent log, then delivers an executive report with KPI cards, validated charts, findings and recommendations.",
          "The three sample datasets ship as recorded real sessions that replay instantly, labelled Demo in the header, so the public demo costs nothing. I verified the live loop on my test CSV, which had a deliberate planted pattern: the agent ran **7 steps and 8 queries in 88 seconds for $0.25**, and its report led with exactly the planted fact, the University store's revenue run-rate down 71% since mid-September, then went further and tied the drop to falling loyalty-member visits.",
        ],
        figures: [
          { src: img("quanta", "deepdive-run"), caption: "Mid-run: the agent log streams reasoning and SQL", alt: "Deep dive in progress with an agent log showing reasoning steps, SQL queries with row counts and a skeleton report" },
          { src: img("quanta", "deepdive-report"), caption: "The delivered report on the sample dataset", alt: "Executive report titled 'Department Bottlenecks: Security Engineering Is Structural, Data Platform Is New' with four KPI cards" },
          { src: img("quanta", "live-deepdive"), caption: "Live run on the test CSV: 7 steps, 8 queries, $0.25, planted decline found", alt: "Live deep dive report on cafe sales data finding the University store decline, with a cost card showing $0.25" },
        ],
      },
      {
        id: "ask",
        label: "04 / Ask, in text or out loud",
        title: "Ask, in Text or Out Loud",
        body: [
          "The Ask tab answers one-off questions: the model writes SQL, the browser runs it, and the answer arrives with an 'Inspect SQL and results' toggle so nothing is a black box.",
          "Voice runs on the Gemini Live API: a real-time, interruptible conversation where Gemini calls a run_sql tool mid-sentence, the query executes on the in-browser DuckDB, and both the SQL and the rows appear in the transcript alongside the spoken answer.",
        ],
        figures: [
          { src: img("quanta", "ask"), caption: "Ask: a cited, inspectable answer next to the voice panel", alt: "Ask tab answering an SLA question with Inspect SQL toggle, a Gemini Live voice panel and suggested questions" },
          { src: img("quanta", "phone-overview"), caption: "The dashboard on a phone", alt: "Quanta overview dashboard on a phone", device: "phone" },
        ],
      },
      {
        id: "results",
        label: "05 / Results",
        title: "Results",
        body: [
          "Quanta is my argument that agentic analytics and privacy are not in tension: put the database in the browser, give the model tools instead of data, and show the SQL behind every number.",
        ],
        bullets: [
          "Raw data never leaves the tab: DuckDB-WASM locally, models see schema, statistics and query results only",
          "Every model-written query passes a read-only guard: single SELECT or WITH, no file or URL readers",
          "Live verification: a planted revenue decline found autonomously in 88 s for $0.25, 7 steps, 8 queries",
          "Recorded demo replays make the public samples free to explore, honestly labelled Demo in the header",
        ],
      },
    ],
  },
  {
    slug: "bastion",
    title: "Bastion",
    tagline:
      "An event-driven portfolio risk platform for fund managers, built capital-preservation-first: every incoming headline is read by an LLM, scored by Jev for every exposed holding, run through a transparent risk calculus and pushed to the manager's phone, with the full reasoning chain one click away.",
    category: "AI / ML",
    year: "2026",
    status: "Prototype",
    timeline: "Oct 2026",
    role: "Design, risk pipeline and front end",
    team: "Solo",
    featured: false,
    stack: ["Next.js 16", "TypeScript", "Claude Haiku 5.5", "Jev (TypeSafe)", "Tailwind CSS 4"],
    domains: ["Fintech", "Portfolio risk", "Decision support"],
    metrics: [
      { label: "Ingest to phone push, measured", value: "8.9 s" },
      { label: "Jev scoring per event, measured", value: "202 ms" },
      { label: "Breaking-news stress presets", value: "22" },
    ],
    links: {},
    cover: img("bastion", "command"),
    thumbs: thumbs("bastion", ["a", "b"]),
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "Bastion asks what a risk desk would look like if capital preservation, not alpha, were the organising principle. It watches 18 intelligence feeds for a simulated $1.78B fund, and every headline that lands is checked against the book: who is exposed, how bad could it get, and does the manager need to know right now.",
          "Everything in the prototype is honestly simulated, and says so on screen: the news posts, the prices, the hedge orders. What is real is the pipeline: live Claude extraction, live Jev scoring, a deterministic risk calculus and a push console, all traceable end to end.",
        ],
        figures: [
          { src: img("bastion", "command"), caption: "Command: a stress event scored against the book, alert on the phone dock", alt: "Bastion command dashboard with NAV, Event VaR and posture KPIs, a tariff stress event with downside probability gauge, an at-risk holdings table and a simulated phone showing critical alerts" },
        ],
      },
      {
        id: "pipeline",
        label: "01 / Pipeline",
        title: "The Pipeline",
        body: [
          "Each event runs a six-stage pipeline: ingest, LLM extraction, exposure screen, Jev scoring, risk calculus, push. Claude Haiku reads the headline against the book and returns entities, sentiment, auditable analysis steps and impact vectors in the platform's tag vocabulary. The screen matches vectors to holdings deterministically, so a vector targeting fabless semiconductors also catches a holding added next week.",
          "Jev, TypeSafe's decision model, then answers typed questions for every exposed holding in **one batched request**: exposure, direction, and a magnitude distribution over move buckets, plus two portfolio-level questions. Measured on screen: extraction 8.2 s, exposure screen 1 ms, Jev scoring **202 ms**, and ingest to phone push in **8.9 to 10.5 s** against a 60 s SLA.",
        ],
        figures: [
          { src: img("bastion", "trace"), caption: "The traceability console: raw payload to push, with real model timings", alt: "AI reasoning and traceability view showing the live claude-haiku-5-5 extraction with token counts, step-by-step analysis, entities and sectoral dependency chains" },
        ],
      },
      {
        id: "calculus",
        label: "02 / Risk calculus",
        title: "Risk Calculus",
        body: [
          "The probabilities become numbers through a pure, inspectable function rather than another model call: exposure weights blend Jev's direct, indirect and peripheral probabilities, an event factor folds in source reliability and follow-through, and expected loss multiplies position size, expected move and probability. Confidence bars show the P10 to P90 of Jev's magnitude distribution, not a point estimate.",
          "Event VaR sums each holding's worst live residual loss, with live events decaying over 20 minutes as they get priced in. The fund's preservation posture maps VaR against a 1.5% drawdown budget, so one number tells the manager how close the book is to its limit.",
        ],
        figures: [
          { src: img("bastion", "method"), caption: "How Jev decides: a real decision replayed one step at a time", alt: "Method page with the six-stage integration map and a step-by-step walkthrough of the Taiwan tariff decision for TSMC" },
        ],
      },
      {
        id: "stress",
        label: "03 / Stress lab",
        title: "Stress Lab",
        body: [
          "The Stress Lab fires synthetic breaking news through the full pipeline against the current book: 22 presets across tariffs, export controls, FDA decisions, rate shocks and defense budgets, plus a composer for custom headlines. Stress tests never touch the live book, and a league table ranks scenarios by expected loss.",
          "The portfolio page closes the loop: add any of a 40-name universe or define a custom security, and Jev classifies its industry domain live while open events are re-scored for the new name.",
        ],
        figures: [
          { src: img("bastion", "stress"), caption: "22 breaking-news presets, each a full pipeline run", alt: "Stress Lab page with preset scenario cards from tariff threats to FDA rejections and a run-all button" },
          { src: img("bastion", "portfolio"), caption: "The book: sector exposure, JEV classification, treemap by open threat", alt: "Portfolio page with sector exposure bars, market-cap tiers, a book treemap coloured by threat and an add-holding search" },
        ],
      },
      {
        id: "results",
        label: "04 / Results",
        title: "Results",
        body: [
          "Bastion is the most complete systems-design piece in this archive: two model APIs, a deterministic core you can audit, honest simulation labels everywhere, and latency measured against an SLA rather than asserted.",
        ],
        bullets: [
          "Six-stage pipeline with every stage timed on screen: 8 ms ingest, 8.2 s extraction, 1 ms screen, 202 ms Jev scoring",
          "One batched Jev request scores every exposed holding, with P10 to P90 ranges instead of point estimates",
          "Ingest to phone push measured at 8.9 to 10.5 s against a 60 s SLA",
          "Fallbacks at every model boundary, and a trace console that shows which mode actually ran",
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
    slug: "capstone-kanban",
    title: "Capstone Team Board",
    tagline:
      "A real-time Kanban board for my capstone team, shipped as one HTML file: no build step, Supabase for live sync, tasks with any number of assignees, and an operating manual that lets an AI agent work the board through a restricted database role.",
    category: "Full-Stack",
    year: "2026",
    status: "Shipped",
    timeline: "Oct 2026",
    role: "Design and build",
    team: "Solo build, used by a team of 5",
    featured: false,
    stack: ["HTML + CSS + JS", "Supabase", "PostgreSQL", "Realtime"],
    domains: ["Team tooling", "Project management"],
    metrics: [
      { label: "Build step, bundler, framework", value: "None" },
      { label: "Lines in index.html", value: "1,017" },
      { label: "Setup time for the team", value: "About 5 min" },
    ],
    links: { github: "https://github.com/poojaverma-me/Capstone-Kanban" },
    cover: img("capstone-kanban", "board"),
    thumbs: thumbs("capstone-kanban", ["a", "b"]),
    sections: [
      {
        id: "overview",
        label: "00 / Overview",
        title: "Overview",
        body: [
          "My capstone team needed a shared board without another account to create, another subscription, or a deploy pipeline for a tool we would use for one semester. So the whole app is one **index.html**: open it anywhere and the team's live board is there. Data lives in Supabase, and changes appear on everyone's screen within a second.",
          "Constraints were the design brief: no build step, no framework, no server of mine. The single file holds the Apple-style UI, drag and drop, search, filters and the Supabase client, in 1,017 lines. A 'Try without Supabase' mode runs the same board with sample data in the browser, which is also what these screenshots show.",
        ],
        figures: [
          { src: img("capstone-kanban", "board"), caption: "The board in demo mode: three columns, priorities, due dates, overdue flags", alt: "Capstone Board Kanban with Not Started, In Progress and Done columns, multi-assignee avatars and an overdue task" },
        ],
      },
      {
        id: "build",
        label: "01 / Design and data model",
        title: "Design and Data Model",
        body: [
          "Tasks take **any number of assignees**, which most lightweight boards refuse to do; the schema is three tables (members, tasks, task_assignees) with row-level-security policies and realtime publication, created by pasting one schema.sql into Supabase. That paste is the entire setup: teammates just open the same file, and there is nothing to configure on their side.",
          "The details carry the polish: cards drag between and within columns, a column choice replaces dragging on phones, avatars in the top bar filter by person, the slash key jumps to search, N creates a task, and option plus arrow keys move a focused card between columns.",
        ],
        figures: [
          { src: img("capstone-kanban", "task"), caption: "A task with two assignees, status, priority and notes", alt: "Edit task modal with five teammates as toggleable assignees, status and priority segmented controls and a due date" },
          { src: img("capstone-kanban", "phone-board"), caption: "The board on a phone", alt: "Capstone Board on a phone showing task cards with assignees", device: "phone" },
        ],
      },
      {
        id: "agent",
        label: "02 / The board agent",
        title: "The Board Agent",
        body: [
          "The part I find most interesting is agent.html: an **operating manual addressed to an AI agent** that controls a browser. Paste meeting notes, an email or a request, tell your agent to process the page, and it extracts the tasks, works out owners, checks for duplicates, writes and runs the SQL, verifies the result and reports back, asking a person only when something essential is ambiguous.",
          "The agent never touches the team's real credentials. A one-time agent-setup.sql creates a restricted board_agent role, a token-gated SQL function and a run log, so the agent operates through its own audited, least-privilege path rather than the service key.",
        ],
        figures: [
          { src: img("capstone-kanban", "agent"), caption: "agent.html: the manual and tool panels an AI agent follows", alt: "Board Agent operating manual page with connection, input and context panels and a how-to-use section" },
        ],
      },
      {
        id: "results",
        label: "03 / Results",
        title: "Results",
        body: [
          "The team ran the semester on this board. It is the smallest project on this page and the one with the highest usage-to-code ratio, which is its own lesson: the right tool for a five-person team was a file, not a platform.",
        ],
        bullets: [
          "One HTML file, no build step; live team sync through Supabase realtime in about a second",
          "Any number of assignees per task via a junction table, with row-level security on all three tables",
          "An AI agent can run the board through a token-gated, least-privilege SQL path with a run log",
          "Setup for the whole team was one SQL paste and a shared file, about 5 minutes",
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

/** The number of projects as a word, for copy ("Thirteen builds"). */
export function projectCountWord(): string {
  const words = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty"];
  return words[projects.length] ?? String(projects.length);
}
