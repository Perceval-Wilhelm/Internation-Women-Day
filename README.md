# 8·3 · Happy Women's Day

A bilingual (English and Vietnamese) International Women's Day card. A CSS-art bouquet grows under a night sky full of fireflies; tap anywhere and another flower blooms. Below it, the story of 8 March, its colours and a few of the voices that shaped it.

Anyone can write a personal card: pick her flowers, write a few words, and send the link. The recipient gets a sealed envelope with her name on it; opening it grows her bouquet and reveals the message.

**Live:** [international-women-day-from-perceval-wilhelm.vercel.app](https://international-women-day-from-perceval-wilhelm.vercel.app)

## How a card link works

```
https://…/for/Lan#msg=Thank%20you%20for%20everything&from=An&f=rose
         └─ path ─┘└──────────────── fragment ─────────────────────┘
```

- The **fragment** (`#…`) holds the message, the sender and the flowers. Browsers never send it to a server, so the words exist only in the link.
- The **path** holds the recipient's name, so chat apps (Messenger, Zalo, iMessage…) can show “Lan, a bloom for you 💐” with a preview image drawn for her. `/for/` opens the card in English, `/gui/` (from _gửi_) in Vietnamese.
- Card pages are `noindex`, and analytics records them as `/for/[name]`, never by name.
- Older links that carry everything in the fragment (`/#to=Lan&msg=…&lang=vi`) keep working.

## Development

Use Node.js 26.13.0 (`.nvmrc`) and the Yarn release pinned in `package.json` through Corepack. Node 25 and newer no longer bundle Corepack, so install it once:

```sh
npm install --global corepack@0.36.0
corepack yarn install --immutable
corepack yarn dev
```

| Command                    | What it does                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `corepack yarn check:all`  | Formatting, zero-warning ESLint, route types, TypeScript, unit and lint tests, build |
| `corepack yarn test:e2e`   | Browser tests at phone, tablet and desktop sizes, with axe accessibility audits      |
| `corepack yarn verify`     | Everything above                                                                     |
| `corepack yarn test:smoke` | The read-only `@smoke` checks against `PLAYWRIGHT_BASE_URL` (for example production) |

Install Chromium for the browser tests once with `corepack yarn exec playwright install chromium`. They start a production build on port 4321; set `PLAYWRIGHT_PORT` if it is taken.

The share images draw on `src/features/og/assets/sky.jpg`, a capture of the grown bouquet. After changing the bouquet or the sky, run the site and redraw it with `node scripts/capture-og-sky.mjs http://localhost:3000/`.

## Deployment

Vercel builds every branch as a protected preview and `main` as production, once the GitHub checks pass. GitHub Actions also watches the live site after each release and every six hours. See [docs/deployment.md](docs/deployment.md).

## Tech stack

| Area            | Tools                                                                                                 |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| App             | Next.js 16 (App Router, Turbopack), React 19, TypeScript 6                                            |
| Look and motion | Hand-written CSS (custom properties, `@property`, scroll-driven animation), Canvas 2D, Web Animations |
| Share images    | `next/og` with local font subsets                                                                     |
| Quality         | ESLint 10, Prettier, Vitest, Playwright with axe-core (WCAG 2.2 AA)                                   |
| Toolchain       | Node.js 26, Yarn 4 through Corepack                                                                   |
| Delivery        | Vercel (Fluid compute, `sin1`), Web Analytics, Speed Insights, GitHub Actions, Dependabot, CodeQL     |

## License

The code is under the [MIT License](LICENSE). The bouquet is adapted from [“CSS Blossoming Flowers at Magical Night”](https://codepen.io/mdusmanansari/pen/BamepLe) by Md Usman Ansari (MIT), and the fonts (Cormorant Garamond, Be Vietnam Pro, Great Vibes) are under the SIL Open Font License; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
