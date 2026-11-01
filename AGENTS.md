# Contributor guide

A bilingual International Women's Day card site. Cards are links: the recipient's name in the path, everything else in the `#fragment`. There is no database and no account.

## Architecture

- Next.js App Router. `src/app/layout.tsx` owns metadata, fonts (`next/font`), global CSS and the inline boot script; `page.tsx`, `for/[name]` and `gui/[name]` all render `CardPage`.
- The boot script runs before first paint: it picks the language (card path, then an older `#lang=` link, a saved choice, the browser), adds `js` and `not-loaded`, and adds `is-sealed` on card paths. Keep it tiny and ES5-safe; it runs in in-app browsers.
- Both languages ship in the HTML. `<T en vi>` renders a pair of `lang` spans and `global.css` hides the one that does not match `<html lang>`, so a link opens in its language before hydration. Strings used in attributes, titles and notifications live in `features/card/text.ts`.
- `features/card/CardPage.tsx` is a Server Component; the bouquet (`features/bouquet`), the sections and the SVG sprite stay on the server and reach `Experience.tsx` as props or children.
- `Experience.tsx` owns client state: the card from the URL, the envelope, the composer draft, previews, language and replays. Browser values (hash, language, media queries, scroll) are read with `useSyncExternalStore` in `browser.ts` so hydration never mismatches; follow that pattern instead of setting state in effects.
- `features/sky/sky.ts` is the canvas: stars, shooting stars, fireflies and tap-to-bloom. It runs outside React and must clean up everything in `destroy()`.
- `features/card/card.ts` parses and builds links. Every field is untrusted: NFC-normalise, strip control and bidi-override characters, cap by code point, and render only as text.
- `features/og/card-image.tsx` draws share images with `next/og`. It reads only from `features/og/assets/`; a dynamic path anywhere else makes the build trace the whole project into the function.

## Motion

- `.not-loaded` pauses the top bar and hero until the page starts the bloom (fonts ready, or after the envelope opens). Stars and the envelope keep moving.
- Replays remount the bouquet and hero text with a key, so every CSS entrance plays again.
- Keep `prefers-reduced-motion: reduce` working: the global rule shortens animations, the sky stops, and the envelope opens at once.

## Development

Use Node.js 26.13.0 (`.nvmrc`) and the Yarn release pinned in `package.json` through Corepack (`npm install --global corepack@0.36.0` once).

```sh
corepack yarn install --immutable
corepack yarn dev
corepack yarn verify
```

`check:all` runs formatting, zero-warning ESLint, route types, TypeScript, Vitest, lint regression tests and the build; it never rewrites files, so run `corepack yarn format` after edits. `test:e2e` needs an existing build and Chromium (`corepack yarn exec playwright install chromium`). For UI changes, check a card link end to end (envelope, open, reply), both languages, a phone width and reduced motion.

## Product boundaries

- Never send a card's message or sender to a server, log or analytics. Only the recipient's name may appear in a path, and analytics must keep reporting card routes as `/for/[name]` and `/gui/[name]`.
- Card pages stay `noindex`. Keep older fragment-only links working.
- Analytics and Speed Insights mount only in production builds, with the shared redaction in `src/lib/monitoring.ts`; Hobby has no custom events, so add none.
- Automated visits must not count as readers: the shared `beforeSend` drops events when `navigator.webdriver` is set, and the first `@smoke` test fails if a production page sends an analytics beacon. Vercel serves the SDK scripts from obfuscated paths, so never filter on `/_vercel/`.
- Keep the 8 March history factual and sourced; check UN and UN Women wording before changing dates or numbers.

## Dependencies and delivery

- Pin direct dependency versions and commit `yarn.lock` with intentional changes. No forced installs or broad resolutions.
- The code is MIT. Credit anything borrowed in `THIRD_PARTY_NOTICES.md` (the bouquet is Md Usman Ansari's CodePen, MIT; the fonts are OFL) and keep the font license files next to `src/features/og/assets/`.
- Vercel builds through `vercel.json` (Next.js preset, Corepack, region `sin1`). Keep the security headers in `next.config.ts` and extend the CSP when adding any third-party origin.
- GitHub Actions: keep actions pinned to full commit SHAs, read-only default permissions, and the check names `IWD quality`, `IWD browser` and `IWD production`. See `docs/deployment.md` before changing GitHub or Vercel settings.
- Use Conventional Commits. Never change Git identity or add co-author or tool attribution. Commit and push only when asked.
