import type { NextConfig } from "next";

// Vercel's preview toolbar loads from vercel.live; production and local builds never need it.
const toolbar = process.env.VERCEL_ENV === "preview";
const allow = (sources: string) => (toolbar ? ` ${sources}` : "");

const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js streams page data in inline scripts, and an inline script picks the language before first paint.
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}${allow("https://vercel.live https://vercel.com")}`,
  `style-src 'self' 'unsafe-inline'${allow("https://vercel.live")}`,
  `img-src 'self' data: blob:${allow("https://vercel.live https://vercel.com https://*.pusher.com")}`,
  `font-src 'self'${allow("https://vercel.live https://assets.vercel.com")}`,
  `connect-src 'self'${allow("https://vercel.live https://vercel.com https://*.pusher.com wss://*.pusher.com")}`,
  `frame-src ${toolbar ? "https://vercel.live https://vercel.com" : "'none'"}`,
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: process.cwd() },
  devIndicators: false,
  agentRules: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          // Card paths carry a name, so other sites only ever learn the origin.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          // The production watch waits for this commit before it checks the live site.
          { key: "X-Build", value: (process.env.VERCEL_GIT_COMMIT_SHA ?? "local").slice(0, 12) },
        ],
      },
    ];
  },
};

export default nextConfig;
