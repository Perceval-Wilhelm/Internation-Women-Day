# GitHub and Vercel delivery

Configuration reviewed on **1 November 2026**. The site is a static card with three on-demand routes (card pages and their share images). It needs no API keys, database or environment variables.

## Project identity

- GitHub: [Perceval-Wilhelm/Internation-Women-Day](https://github.com/Perceval-Wilhelm/Internation-Women-Day)
- Vercel: [internation-women-day](https://vercel.com/perceval-wilhelms-projects/internation-women-day), in the personal `perceval-wilhelms-projects` workspace (Hobby)
- Production: [internation-women-day-delta.vercel.app](https://internation-women-day-delta.vercel.app), built from `main`. Every other branch gets a protected preview.

## How a change reaches production

1. A pull request runs **IWD quality** and **IWD browser** (`.github/workflows/check.yml`). Vercel builds a protected preview.
2. Merging needs both checks green on a branch that is up to date with `main`. Only squash merges are allowed.
3. Vercel builds `main` but keeps serving the previous production deployment until both checks pass on that commit (deployment checks, `deployment-alias`).
4. **IWD production** (`.github/workflows/production.yml`) waits for the domain to serve the new commit (`X-Build` header), then runs the `@smoke` browser checks against it. It runs again every six hours. A failure opens, or comments on, a “Production check failed” issue.

## CI

| Check          | Runs on                                       | What it verifies                                                                                                                             |
| -------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| IWD quality    | PRs to `main`, pushes to `main`, manual       | Immutable install, high/critical audit, formatting, zero-warning ESLint, route types, TypeScript, unit and lint-rule tests, production build |
| IWD browser    | after IWD quality                             | A fresh production build on Vercel's Node patch, then Playwright at phone, tablet and desktop sizes with axe WCAG 2.2 AA audits              |
| IWD production | production deployments, every 6 hours, manual | The read-only `@smoke` checks against the live domain                                                                                        |

Actions are pinned to full commit SHAs, the default token is read-only (only the production watch may write issues), and checkouts don't persist credentials. No Vercel token is stored in GitHub: Vercel's Git integration does the deploying. Browser reports from failed runs are kept for 7 days (14 for production).

## GitHub settings

- Ruleset **Protect main with verified changes** on the default branch, with no bypass: pull requests required (0 approvals for a solo owner, conversations resolved), IWD quality and IWD browser required from GitHub Actions on an up-to-date branch, linear history, no force pushes or deletion.
- Squash merges only, titled after the PR with a blank body. Merged branches are deleted.
- Actions must be pinned to full SHAs; workflows get read-only tokens and cannot approve PRs.
- Dependabot alerts and security updates, secret scanning with push protection, and CodeQL default setup are on. Weekly version updates come from `.github/dependabot.yml`; nothing auto-merges.

## Vercel settings

| Setting               | Value                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------- |
| Framework             | Next.js, from `vercel.json`                                                            |
| Install / build       | `npx --yes corepack@0.36.0 yarn install --immutable` / `… yarn build`                  |
| Node.js               | 26.x (dashboard and `engines`); CI pins the 26.13.0 patch                              |
| Functions             | Fluid compute, region `sin1` (Singapore, from `vercel.json`)                           |
| Deployment protection | Vercel Authentication on everything except the production domain                       |
| Source maps           | Protected                                                                              |
| Deployment checks     | IWD quality, IWD browser: block the production alias                                   |
| Web Analytics         | On, production builds only, card names redacted (`src/lib/monitoring.ts`)              |
| Speed Insights        | Wired in code; enable it in the dashboard (see below)                                  |
| Security headers      | CSP, `nosniff`, `DENY` framing, strict referrer, permissions policy (`next.config.ts`) |

Keep build settings in `vercel.json`, not the dashboard. When changing the Node major, update `.nvmrc`, `engines`, the CI browser job and `@types/node` together, after checking that Vercel supports it.

### Still to do by hand

- **Speed Insights:** the CLI warns that enabling it may add charges, so it needs the owner's confirmation. Run `vercel project speed-insights enable internation-women-day --scope=perceval-wilhelms-projects` in a terminal. Until then, production requests for its script return 404, which is harmless.
- **Framework preset:** after the Next.js migration is on `main`, set the dashboard preset to match `vercel.json` with `vercel project update internation-women-day --framework nextjs --scope=perceval-wilhelms-projects`. Doing it earlier would break a rebuild of the old static site.

## Observability

- **Web Analytics:** page views per route. Card visits appear as `/for/[name]` and `/gui/[name]`, so they count opened cards by language without recording who they were for. Hobby has no custom events.
- **Speed Insights:** real-user Core Web Vitals, once enabled.
- **Vercel Observability and logs:** invocations, errors and latency for card pages and share images (log retention on Hobby is short).
- **IWD production:** synthetic checks after each release and every six hours, with GitHub issues as alerts. Scheduled workflows pause after 60 days without repository activity; re-enable them from the Actions tab.

## Recovery

Check the deployment's build and runtime logs first. For an immediate fix use Vercel's **Instant Rollback** to the last good production deployment, confirm the domain serves it (its `X-Build` header), then land a corrective PR so the next `main` build doesn't bring the fault back. Never bypass the required checks or force-push `main`.
