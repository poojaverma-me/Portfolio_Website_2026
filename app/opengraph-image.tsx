import { ImageResponse } from "next/og";
import { profile } from "@/lib/profile";

export const alt = `${profile.name}, computing science student and developer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The card that shows up when the site is pasted into a chat or a feed. */
export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#000000",
          backgroundImage:
            "radial-gradient(70% 60% at 82% 12%, rgba(249,107,11,0.30), transparent 70%)",
          padding: 72,
          color: "#f5f5f7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#f96b0b",
            }}
          >
            Computing Science · Thompson Rivers University
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 104, fontWeight: 800, lineHeight: 1 }}>
            {profile.name}
          </div>
          <div style={{ fontSize: 34, lineHeight: 1.3, color: "rgba(245,245,247,0.72)" }}>
            Full-stack builds, applied AI and data work
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 14,
            fontSize: 24,
            color: "rgba(245,245,247,0.6)",
          }}
        >
          <span>Mitacs research intern</span>
          <span style={{ color: "#f96b0b" }}>·</span>
          <span>UREAP and TRU research awards</span>
          <span style={{ color: "#f96b0b" }}>·</span>
          <span>Kamloops, BC</span>
        </div>
      </div>
    ),
    size,
  );
}
