## AI assistant instructions for AI Slot Scout

Purpose: Help an AI coding agent be productive in this small React TypeScript SPA that scans public Calendly/HubSpot scheduling pages using a Google Gemini/GenAI integration.

- Big picture
  - Single-page React app. Entry: `index.tsx` -> `App.tsx`.
  - UI components live in `components/` (notable: `SetupView.tsx`, `SlotFinder.tsx`, `ResultsDisplay.tsx`).
  - Core logic lives in the hook `hooks/useSlotScout.ts` which orchestrates the AI call, parses the AI output and stores results.
  - Time/business logic in `utils/time.ts` (parsing 12h times and the `selectSpreadOutCadence` selection strategy).

- Key data flows and responsibilities
  - User provides a scheduling page URL once via `SetupView` (saved to `localStorage` under `calendlyUrl`).
  - `SlotFinder` triggers `findSlots(calendlyUrl, timezone)` from the `useSlotScout` hook.
  - `useSlotScout.findSlots` builds a long prompt, calls `GoogleGenAI`, and expects the assistant to return strictly-formatted markdown (see example below).
  - `parseScrapedSlots` in `useSlotScout.ts` extracts headings `## YYYY-MM-DD` and bullet times `- HH:MM AM/PM`. Keep this format when changing prompts/parsing.
  - `selectSpreadOutCadence` chooses up to 3 days and up to 2 times/day (earliest and latest when many exist) — found in `utils/time.ts` and relied on by `ResultsDisplay`.

- Prompts, expected AI output, and parsing notes
  - The prompt in `useSlotScout.ts` instructs the model to output markdown headings `## YYYY-MM-DD` with `- HH:MM AM/PM` bullets. Example exact output the code expects:

    ## 2025-12-15
    - 09:00 AM
    - 11:30 AM

  - If the AI returns the phrase `No available slots found.` the app treats it as no results. Tests/changes to parsing should preserve this sentinel string.
  - `parseScrapedSlots` uses regex to find `## YYYY-MM-DD` and bullets beginning with `-` or `*` and validates time format using `/\d{1,2}:\d{2}\s*(AM|PM)/i`.

- Environment & external integration points
  - The client-side hook constructs `new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true })` in `hooks/useSlotScout.ts` and uses `ai.models.generateContent(...)`.
  - The code expects `process.env.API_KEY` to be defined at runtime/build time. When modifying deployment or local development, ensure the env var is injected into the build (or refactor to a backend proxy if you must keep keys secret).
  - The `GoogleGenAI` call config includes a `googleSearch` tool; the AI is expected to analyze fully-rendered page content. Keep any changes to tool usage consistent with these calls.

- Component & UX conventions
  - Timezone auto-detection uses `Intl.DateTimeFormat().resolvedOptions().timeZone` in `SlotFinder.tsx` and `SlotFinderForm.tsx`. If you change supported zones, update `constants.ts` (`TIMEZONE_OPTIONS`).
  - Styling is Tailwind-based classes embedded in components; keep class names inline (no special styling system used).
  - `ResultsDisplay` expects `generateCopyText(date, times, timezone)` to return a single sentence (no extra commentary) which it copies to the clipboard. The generator enforces that in `useSlotScout.generateCopyText`.

- Files to inspect first when making changes
  - `hooks/useSlotScout.ts` — AI prompts, model name, parsing, and error handling.
  - `utils/time.ts` — time parsing and cadence selection logic (max 3 days, 2 times per day).
  - `components/ResultsDisplay.tsx` — UI assumptions about result shape and clipboard flow.
  - `components/SetupView.tsx` — localStorage key for the URL (`calendlyUrl`).

- Small, actionable rules for the AI agent
  - When changing the prompt format, update `parseScrapedSlots` and include an example response in the same commit.
  - Do not remove or rename the `No available slots found.` sentinel without updating all callers.
  - Keep timezone display/parsing UTC-safe: the code often builds `new Date(date + 'T12:00:00Z')` to avoid parsing issues — preserve this pattern or validate behavior across timezones.
  - Any change that touches `process.env.API_KEY` usage should include a short README note about local dev (how to supply the env var during build) or refactor to a backend call.

If anything in these instructions is unclear or you want me to add example local-run commands (.env, build scripts, or a README snippet), tell me which part to expand and I will iterate. 
