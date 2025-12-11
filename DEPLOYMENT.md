Deployment runbook — Vercel (recommended)
=======================================

This file documents the minimal steps and exact environment variable names required to deploy the project to Vercel (the GitHub Action added in `.github/workflows/deploy-vercel.yml` expects a Vercel token).

Required GitHub repository secrets (add via Settings → Secrets → Actions):

- VERCEL_TOKEN — a Vercel personal token with `Deployments:Write` scope. Used by the deployment action.
- VERCEL_ORG_ID — (optional) Vercel organization id. Helpful for targeted CLI commands.
- VERCEL_PROJECT_ID — (optional) Vercel project id. Helpful for targeted CLI commands.

Production environment variables to set in Vercel (Project → Settings → Environment Variables):

- API_KEY — the AI provider API key (server-side only). Value should NOT be committed.
- SENTRY_DSN — Sentry DSN for server-side error reporting.
- VITE_SENTRY_DSN — (optional) client-side Sentry DSN used at build/runtime by the frontend.
- REDIS_URL — connection string for Redis (e.g. redis://:password@hostname:6379). Required if using the Redis-backed rate limiter.
- RATE_LIMIT_POINTS — (optional) numeric default points for the rate limiter (default set in repo if not provided).
- RATE_LIMIT_DURATION — (optional) duration window (seconds) for the rate limiter.

Notes on secrets vs. env vars
- Put secrets used by serverless functions in Vercel's Environment Variables (set to Production). The server functions read `process.env.API_KEY`, `process.env.SENTRY_DSN`, `process.env.REDIS_URL` etc.
- `VITE_`-prefixed envs are injected into the client bundle at build time. Only set `VITE_SENTRY_DSN` if you want client-side Sentry reporting enabled.

Quick Vercel setup
-------------------
1. Create a Vercel account and a new project (import from GitHub).
2. In the project settings, add the production environment variables listed above.
3. In your GitHub repo settings, add `VERCEL_TOKEN` (personal token). Optionally add `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` to enable the GitHub Action to scope the CLI deployment.

How the GitHub Action works
---------------------------
- The workflow `.github/workflows/deploy-vercel.yml` checks out the repo, installs dependencies, runs `npm run build` (produces `dist/`) and runs `npx vercel --prod --confirm` using `VERCEL_TOKEN`. If you provide `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`, the CLI can be targeted.

Local verification and build steps
---------------------------------
To verify locally before pushing:

```bash
# install deps
npm ci

# set env locally (create a .env file from .env.example and populate values)
# build
npm run build

# preview the dist directory (optional)
npx serve dist
```

If you use serverless `api/` handlers locally, run the dev server:

```bash
npm run dev
# open http://localhost:5173 (or printed port)
```

Redis & rate limiter notes
--------------------------
- Provision a managed Redis (Redis Labs, Azure Cache for Redis, AWS Elasticache). Provide its URL in `REDIS_URL`.
- Monitor: add an uptime check and Redis memory/connection alerts. On Vercel, you can use external monitoring (Datadog, Grafana Cloud, or Vercel Analytics) to track error rates.

Sentry
------
- Create a Sentry project and set `SENTRY_DSN` (server) and, if desired, `VITE_SENTRY_DSN` (client) in Vercel environment variables. Ensure sourcemaps are uploaded if you want readable stack traces (optional advanced step).

Post-deploy checklist
---------------------
- Verify server endpoints (/api/generate and /api/generate-copy) return 200 when called with valid inputs.
- Check Sentry for any runtime errors.
- Verify rate limiting works by making repeated requests from a single IP and ensuring requests are blocked after threshold.
- Run a quick E2E smoke test (the Playwright CI does this automatically on PRs if configured).

Fallback: Netlify
-----------------
If you'd prefer Netlify instead of Vercel, let me know and I will add `netlify.toml` and a GitHub Action for Netlify deploys.

Troubleshooting
---------------
- Build fails with missing env: ensure `API_KEY` or other required env vars are set in the Vercel dashboard for the Production environment.
- Rate limiter errors referencing Redis: check `REDIS_URL` and network access from your provider to the Redis instance.

Contact
-------
If you want, I can also add the exact Vercel CLI command used in CI to the README and a short script to upload client sourcemaps to Sentry after build.
