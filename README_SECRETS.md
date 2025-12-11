Secrets and required scopes
===========================

This file lists the exact secret names and recommended scopes for GitHub repository secrets and hosting provider environment variables.

GitHub repository secrets (add under Settings → Secrets → Actions):

- VERCEL_TOKEN — Vercel personal token. Scope: Deployments:Write (or full if you prefer). Used by the Vercel GitHub Action.
- VERCEL_ORG_ID — optional; Vercel organization id for targeted CLI deploys.
- VERCEL_PROJECT_ID — optional; Vercel project id for targeted CLI deploys.
- NETLIFY_AUTH_TOKEN — Netlify personal access token. Scope: deploys:write.
- NETLIFY_SITE_ID — Netlify site id to identify the site when deploying via CLI/action.

Production environment variables (set in host's environment variables / project settings):

- API_KEY — AI provider API key used by server functions. Keep secret.
- SENTRY_DSN — Sentry project DSN for server-side errors.
- VITE_SENTRY_DSN — (optional) client DSN for frontend Sentry (exposed at build time).
- REDIS_URL — connection string for Redis (if using Redis-backed rate limiter). Example: redis://:password@hostname:6379
- RATE_LIMIT_POINTS — numeric (e.g., 10)
- RATE_LIMIT_DURATION — seconds (e.g., 60)

Notes
- Only `VITE_`-prefixed variables are injected into the client bundle at build time. Do NOT store secrets without `VITE_` prefix if you want them to remain server-side.
