"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/lib/projects";

const categories = ["All", "AI / ML", "Data", "Security", "Full-Stack"] as const;
type Filter = (typeof categories)[number];

export default function ProjectsGrid() {
  const [active, setActive] = useState<Filter>("All");
  const shown =
    active === "All" ? projects : projects.filter((p) => p.category === active);

  return (
    <div className="pb-8">
      {/* segmented control */}
      <div className="mt-10 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          role="tablist"
          aria-label="Filter projects by category"
          className="glass inline-flex rounded-full p-1"
        >
          {categories.map((c) => {
            const count =
              c === "All"
                ? projects.length
                : projects.filter((p) => p.category === c).length;
            const selected = active === c;
            return (
              <button
                key={c}
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(c)}
                className={`relative whitespace-nowrap rounded-full px-4 py-1.5 text-[0.875rem] transition-colors ${
                  selected ? "text-label" : "text-label-2 hover:text-label"
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId="segment"
                    className="absolute inset-0 rounded-full bg-fill-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_1px_3px_var(--shadow-strong)]"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">
                  {c} <span className="tabular-nums text-label-3">{count}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* keyed by filter so the grid remounts with a fresh fade-in */}
      <div key={active} className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((p, i) => (
          <motion.div
            key={p.slug}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <ProjectCard project={p} headingLevel={2} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
