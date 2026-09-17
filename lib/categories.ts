import { BrainCircuit, Database, Layers, Shield, type LucideIcon } from "lucide-react";
import type { Project } from "@/lib/projects";

/** One glyph per category. Colour stays neutral across the site. */
export const categoryIcon: Record<Project["category"], LucideIcon> = {
  "AI / ML": BrainCircuit,
  Data: Database,
  Security: Shield,
  "Full-Stack": Layers,
};
