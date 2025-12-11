// Simple serverless-style handler suitable for Vercel/Netlify or Node servers.
// Expects POST { url, timezone, startDate }
const { GoogleGenAI } = (() => {
  try {
    return require('@google/genai');
  } catch (e) {
    return {};
  }
})();

// Sentry init (server)
let Sentry;
try {
  Sentry = require('@sentry/node');
  if (process.env.SENTRY_DSN) {
    Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1, environment: process.env.SENTRY_ENV || process.env.NODE_ENV });
  }
} catch (e) {
  Sentry = null;
}

// Prometheus instrumentation (optional)
let promClient;
try {
  promClient = require('prom-client');
} catch (e) {
  promClient = null;
}

let metrics = {};
if (promClient) {
  if (!global.__prom_counters) global.__prom_counters = {};
  metrics.requestCounter = global.__prom_counters.ai_generate_requests_total || new promClient.Counter({ name: 'ai_generate_requests_total', help: 'Total /api/generate requests' });
  metrics.successCounter = global.__prom_counters.ai_generate_success_total || new promClient.Counter({ name: 'ai_generate_success_total', help: 'Successful /api/generate responses' });
  metrics.errorCounter = global.__prom_counters.ai_generate_errors_total || new promClient.Counter({ name: 'ai_generate_errors_total', help: 'Errored /api/generate responses' });
  metrics.latency = global.__prom_counters.ai_generate_duration_seconds || new promClient.Histogram({ name: 'ai_generate_duration_seconds', help: 'Duration of /api/generate in seconds', buckets: [0.1, 0.5, 1, 2, 5, 10] });
  global.__prom_counters.ai_generate_requests_total = metrics.requestCounter;
  global.__prom_counters.ai_generate_success_total = metrics.successCounter;
  global.__prom_counters.ai_generate_errors_total = metrics.errorCounter;
  global.__prom_counters.ai_generate_duration_seconds = metrics.latency;
}

const { consume } = require('./rateLimiter');

function getIp(req) {
  return (req.headers && (req.headers['x-forwarded-for'] || req.socket.remoteAddress)) || req.ip || 'unknown';
}

module.exports = async (req, res) => {
  const start = process.hrtime();
  if (metrics.requestCounter) metrics.requestCounter.inc();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Redis-backed rate limit
  try {
    const ip = getIp(req);
    const resLimit = await consume(ip);
    if (!resLimit.ok) {
      return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }
  } catch (e) {
    // If rate limiter errors, log and continue to avoid blocking legitimate requests
    console.warn('Rate limiter failed:', e);
  }

  const { url, timezone, startDate } = req.body || {};
  if (!url || !timezone || !startDate) {
    return res.status(400).json({ error: 'Missing required parameters: url, timezone, startDate' });
  }

  if (!GoogleGenAI) {
    console.error('Missing @google/genai package on server.');
    return res.status(500).json({ error: 'Server misconfiguration: AI client missing' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

    const prompt = `You are an expert web scraper. Your task is to analyze a web page that contains a JavaScript-driven scheduling widget (likely Calendly embedded in HubSpot).

URL to analyze: "${url}"
Target Timezone: "${timezone}"
Start Date: "${startDate}"

Instructions:
1. Access the URL and wait for all JavaScript to execute, especially the embedded scheduling widget. The content you need is not in the initial HTML.
2. The Google Search tool will provide you with the page content. Analyze this content deeply to find available dates and times.
3. The times on the page might be in a different timezone. You MUST convert them and present the final list in the "${timezone}" timezone.
4. Format the output strictly as markdown. For each day with availability, use a heading "## YYYY-MM-DD". Under each heading, create a bulleted list of available times using a hyphen, like "- HH:MM AM/PM".

If, after thoroughly analyzing the fully rendered page content provided by the search tool, you still cannot find any available slots, or if the page is not a valid scheduling page, respond with ONLY the text "No available slots found."`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { role: 'user', parts: [{ text: prompt }] },
      config: { tools: [{ googleSearch: {} }] },
    });

    const rawText = response?.text || '';
    if (metrics.successCounter) metrics.successCounter.inc();
    if (metrics.latency) {
      const diff = process.hrtime(start);
      const seconds = diff[0] + diff[1] / 1e9;
      metrics.latency.observe(seconds);
    }
    return res.status(200).json({ text: rawText });
  } catch (err) {
    console.error('AI request failed:', err);
    if (Sentry) {
      try { Sentry.captureException(err); await Sentry.flush(2000); } catch (e) { /* ignore */ }
    }
    if (metrics.errorCounter) metrics.errorCounter.inc();
    if (metrics.latency) {
      const diff = process.hrtime(start);
      const seconds = diff[0] + diff[1] / 1e9;
      metrics.latency.observe(seconds);
    }
    return res.status(500).json({ error: 'Failed to process request' });
  }
};
