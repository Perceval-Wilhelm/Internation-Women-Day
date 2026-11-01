import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Cormorant_Garamond, Great_Vibes } from "next/font/google";
import type { ReactNode } from "react";
import { SiteMonitoring } from "@/components/site-monitoring";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "@/features/bouquet/bouquet.css";
import "@/styles/global.css";

// Only Latin glyphs are preloaded; Vietnamese and other letters load on demand through unicode-range.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});
const sans = Be_Vietnam_Pro({ subsets: ["latin"], weight: ["300", "500"], variable: "--font-sans" });
const script = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-script" });

// Before first paint: pick the language (a card's path, then an older #lang link, a saved choice, the browser),
// hold the opening animations until the page starts the bloom, and keep a card's page still under its envelope.
const boot = String.raw`(function(r){var p=location.pathname,l=navigator.language||"en";try{l=(/^\/gui\//.test(p)&&"vi")||(/^\/for\//.test(p)&&"en")||new URLSearchParams(location.hash.slice(1)).get("lang")||localStorage.getItem("lang")||l}catch(e){}r.lang=/^vi/i.test(l)?"vi":"en";r.classList.add("js","not-loaded");if(/^\/(for|gui)\//.test(p))r.classList.add("is-sealed")})(document.documentElement)`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Happy International Women's Day · 8 March",
  description:
    "A bouquet that blooms for every woman. Write a few words, pick her flowers and send a personal 8 March card, in English or Vietnamese.",
  applicationName: "8·3",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: "/",
    title: "Happy International Women's Day 💐",
    description: "A bouquet that blooms for every woman. Open it, then send one of your own.",
    locale: "en_GB",
    alternateLocale: ["vi_VN"],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#0d0719", viewportFit: "cover" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} ${script.variable}`}
      // The boot script sets lang and classes before React hydrates
      suppressHydrationWarning
    >
      <head>
        {/* eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- a fixed string; it must run before first paint */}
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        {children}
        <SiteMonitoring enabled={process.env.VERCEL_ENV === "production" && process.env.NODE_ENV === "production"} />
      </body>
    </html>
  );
}
