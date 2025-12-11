# AI Slot Scout

Quick starter notes to run and deploy this small React SPA with a server-side AI proxy.

## Development

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set `API_KEY`.

3. During local development you can run a serverless-compatible environment or host the `api/` folder with your platform (Vercel/Netlify). If you prefer a simple Node server, serve the `api/` endpoints on the same origin as the client.

## Server API

This repo includes two serverless handlers under `api/`:

- `api/generate.js` — accepts POST { url, timezone, startDate } and returns `{ text }` (markdown listing of slots) from the AI.
- `api/generate-copy.js` — accepts POST { date, times, timezone } and returns `{ text }` (single sentence) from the AI.

Set `API_KEY` as an environment variable on your host — do NOT embed the key in client code. On Vercel/Netlify add `API_KEY` via the project settings.

## Monitoring (Sentry)

This project supports Sentry for error monitoring. Configure the following environment variables:

- `SENTRY_DSN` — server-side DSN (private). Set this in your host's secret settings.
- `VITE_SENTRY_DSN` — client-side DSN (public) for the browser; prefix is required for Vite to expose to the frontend.

When these are set the server handlers will report exceptions to Sentry and the client will initialize Sentry's React SDK.

## Chrome extension build

This project can be packaged as a Chrome extension (Manifest V3). Vite will copy files from the `public/` folder into the build output so `public/manifest.json` becomes the extension manifest.

To build and load the extension locally:

1. Build the app:

```bash
npm run build
```

2. Open Chrome and go to `chrome://extensions`, enable *Developer mode* (top-right), click *Load unpacked*, and select the `dist/` directory created by Vite.

3. The extension popup will use the built `index.html` (your React app) as the popup UI.

Notes:
- Replace the placeholder icons in `public/icons/` with proper PNGs for a polished extension.
- Server API endpoints must be reachable from the extension (same-origin or CORS-enabled). Configure `API_KEY`, `SENTRY_DSN`, and `REDIS_URL` as appropriate on your server hosting the API.

## Running E2E tests locally

Playwright E2E tests in this repo are configured to target the Vite preview server (port 4173), which is what CI uses.

To run E2E locally:

```bash
# build + preview (serves on port 4173 by default)
npm run build
npm run preview

# in another terminal, run playwright tests
npx playwright test
```

If you prefer to run tests against the dev server (5173), set `PLAYWRIGHT_BASE_URL` to `http://localhost:5173` before running tests.



## Tests & CI

This project includes a Jest config and example tests. To run tests locally:

```bash
npm install --save-dev jest @types/jest ts-jest
npm test
```

## CI

GitHub Actions workflow is provided at `.github/workflows/ci.yml` to run lint/typecheck/test/build on PRs.
