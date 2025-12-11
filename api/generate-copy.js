// Handler to generate the single-sentence copy text server-side.
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
  metrics.requestCounter = global.__prom_counters.ai_generate_copy_requests_total || new promClient.Counter({ name: 'ai_generate_copy_requests_total', help: 'Total /api/generate-copy requests' });
  metrics.successCounter = global.__prom_counters.ai_generate_copy_success_total || new promClient.Counter({ name: 'ai_generate_copy_success_total', help: 'Successful /api/generate-copy responses' });
  metrics.errorCounter = global.__prom_counters.ai_generate_copy_errors_total || new promClient.Counter({ name: 'ai_generate_copy_errors_total', help: 'Errored /api/generate-copy responses' });
  metrics.latency = global.__prom_counters.ai_generate_copy_duration_seconds || new promClient.Histogram({ name: 'ai_generate_copy_duration_seconds', help: 'Duration of /api/generate-copy in seconds', buckets: [0.01, 0.05, 0.1, 0.3, 1, 2] });
  global.__prom_counters.ai_generate_copy_requests_total = metrics.requestCounter;
  global.__prom_counters.ai_generate_copy_success_total = metrics.successCounter;
  global.__prom_counters.ai_generate_copy_errors_total = metrics.errorCounter;
  global.__prom_counters.ai_generate_copy_duration_seconds = metrics.latency;
}

module.exports = async (req, res) => {
  const start = process.hrtime();
  if (metrics.requestCounter) metrics.requestCounter.inc();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  // Redis-backed rate limit
  try {
    const ip = (req.headers && (req.headers['x-forwarded-for'] || req.socket.remoteAddress)) || req.ip || 'unknown';
    const { consume } = require('./rateLimiter');
    const resLimit = await consume(ip);
    if (!resLimit.ok) {
      return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }
  } catch (e) {
    console.warn('Rate limiter failed:', e);
  }

  const { date, times, timezone } = req.body || {};
  if (!date || !Array.isArray(times) || !timezone) {
    return res.status(400).json({ error: 'Missing required parameters: date, times, timezone' });
  }

  if (!GoogleGenAI) {
    console.error('Missing @google/genai package on server.');
    return res.status(500).json({ error: 'Server misconfiguration: AI client missing' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

    const dateObj = new Date(date + 'T12:00:00Z');
    const niceDate = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });

    let timesText;
    if (times.length === 1) timesText = times[0];
    else timesText = `${times.slice(0, -1).join(', ')} or ${times[times.length - 1]}`;

    const prompt = `You are a friendly and professional assistant. Your task is to generate a single sentence for proposing a meeting.\nDetails:\n- Date: ${niceDate}\n- Times: ${timesText}\n- Timezone: ${timezone}\n\nCombine these into one natural-sounding sentence. The output must be ONLY the sentence itself, with no extra commentary.`;

    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { role: 'user', parts: [{ text: prompt }] } });
    const text = response?.text || '';
    if (metrics.successCounter) metrics.successCounter.inc();
    if (metrics.latency) {
      const diff = process.hrtime(start);
      const seconds = diff[0] + diff[1] / 1e9;
      metrics.latency.observe(seconds);
    }
    return res.status(200).json({ text });
  } catch (err) {
    console.error('AI generate-copy failed:', err);
    if (Sentry) {
      try { Sentry.captureException(err); await Sentry.flush(2000); } catch (e) { /* ignore */ }
    }
    if (metrics.errorCounter) metrics.errorCounter.inc();
    if (metrics.latency) {
      const diff = process.hrtime(start);
      const seconds = diff[0] + diff[1] / 1e9;
      metrics.latency.observe(seconds);
    }
    return res.status(500).json({ error: 'Failed to generate copy' });
  }
};
