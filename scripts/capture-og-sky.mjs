// Draws the grown bouquet under the night sky as the background of every share image (src/features/og/assets/sky.jpg).
// Start the site first (corepack yarn dev), then run: node scripts/capture-og-sky.mjs [site URL]
import { chromium } from "@playwright/test";

const url = process.argv[2] ?? "http://localhost:3000/";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(url, { waitUntil: "networkidle" });

// The words are drawn by the image renderer, so clear the page's text and give it the left side.
await page.addStyleTag({
  content: `
    .topbar, .hero__copy, .tap-hint, body > nextjs-portal { display: none !important; }
    body::after { display: none; }
    .hero {
      --bouquet-scale: 0.88 !important;
      background:
        radial-gradient(55vmin 42vmin at 74% 54%, color-mix(in srgb, var(--glow) 16%, transparent), transparent 70%),
        linear-gradient(to bottom, var(--night-1), var(--night-2) 45%, var(--dark-color) 80%) !important;
    }
    .flowers { left: 74% !important; transition: none !important; }
  `,
});
await page.waitForFunction(() => !document.documentElement.classList.contains("not-loaded"));
// Grow the whole bouquet at once; looping twinkles stay wherever they are. Fireflies fade in over 2.5 s.
await page.evaluate(() => {
  document.querySelector(".hero")?.style.removeProperty("--fit");
  for (const animation of document.getAnimations()) {
    if (animation.effect?.getComputedTiming().iterations === Infinity) animation.pause();
    else animation.finish();
  }
});
await page.waitForTimeout(3000);
await page.screenshot({ path: "src/features/og/assets/sky.jpg", type: "jpeg", quality: 88 });
await browser.close();
console.log("Saved src/features/og/assets/sky.jpg");
