import type { MorphCard } from "@/components/ui/scroll-morph-hero";
import { projects } from "@/lib/projects";

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=240&h=340&q=70&auto=format&fit=crop`;

// Stock covers per project until real screenshots exist (all verified to load)
const coverIds: Record<string, string[]> = {
  "rag-study-assistant": [
    "1677442136019-21780ecad995", // AI lettering
    "1485827404703-89b55fcc595e", // service robot
    "1620712943543-bcc4688e7485", // robot reading
    "1515879218367-8466d910aaa4", // python code
  ],
  "retina-scan": [
    "1576091160399-112ba8d25d1d", // clinician
    "1530497610245-94d3c16cda28", // x-ray
    "1559757175-5700dde675bc", // brain model
    "1579154204601-01588f351e67", // research lab
  ],
  cryptosent: [
    "1611974789855-9c2a0a7236a3", // market candles
    "1551288049-bebda4e38f71", // analytics dashboard
    "1460925895917-afdab827c52f", // charts on laptop
  ],
  "quantum-safe-passwords": [
    "1526374965328-7f61d4dc18c5", // matrix code
    "1550751827-4bd374c3f58b", // circuit lines
    "1518770660439-4636190af475", // circuit board
    "1558494949-ef010cbdcc31", // server rack
  ],
  "retail-licensing-automation": [
    "1504868584819-f8e8b4b6d7e3", // dashboard laptop
    "1563986768609-322da13575f3", // laptop and phone
    "1522071820081-009f0129c71c", // team at laptops
  ],
  "employee-check-in": [
    "1497366216548-37526070297c", // office corridor
    "1552664730-d307ca884978", // team whiteboard
  ],
};

/** Round-robin across projects so neighbouring cards differ. */
export function projectCovers(): MorphCard[] {
  const queues = projects.map((p) => ({
    project: p,
    ids: [...(coverIds[p.slug] ?? [])],
  }));
  const cards: MorphCard[] = [];
  while (queues.some((q) => q.ids.length)) {
    for (const q of queues) {
      const id = q.ids.shift();
      if (!id) continue;
      cards.push({
        src: unsplash(id),
        title: q.project.title,
        category: q.project.category,
        href: `/projects/${q.project.slug}`,
      });
    }
  }
  return cards;
}
