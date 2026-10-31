import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // the browser bundle ships without source maps, so the published JavaScript
  // stays minified rather than mapping back to readable source
  productionBrowserSourceMaps: false,
  // no "x-powered-by: Next.js" banner on every response
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // the hero portrait asks for 82
    qualities: [75, 82],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // no other site can frame these pages and pass them off as its own
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
