import { profile } from "@/lib/profile";

/** The skills strip under the hero: one row of everything, drifting left. */
export default function Toolkit() {
  return (
    <div className="relative overflow-hidden border-y hairline py-4">
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-base to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-base to-transparent"
      />
      <div className="marquee-track">
        {[...profile.skills, ...profile.skills].map((s, i) => (
          <span
            key={`${s}-${i}`}
            className="flex items-center whitespace-nowrap text-[0.9375rem] text-label-2"
            aria-hidden={i >= profile.skills.length || undefined}
          >
            <span className="px-5">{s}</span>
            <span aria-hidden className="text-label-3">
              ·
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
