// Redis-backed rate limiter using ioredis + rate-limiter-flexible
const Redis = require('ioredis');
const { RateLimiterRedis } = require('rate-limiter-flexible');

// Prometheus client for emitting a custom counter when requests are blocked
let promClient;
try {
  promClient = require('prom-client');
} catch (e) {
  promClient = null;
}

const redisClient = new Redis(process.env.REDIS_URL || process.env.REDIS_URI || undefined);

const limiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: parseInt(process.env.RATE_LIMIT_POINTS || '10', 10), // 10 requests
  duration: parseInt(process.env.RATE_LIMIT_DURATION || '60', 10), // per 60 seconds
  keyPrefix: 'rlflx'
});

// Ensure a single Counter instance across cold-starts / module reloads
let blockedCounter;
if (promClient) {
  if (!global.__prom_counters) global.__prom_counters = {};
  blockedCounter = global.__prom_counters.app_rate_limiter_blocked_total;
  if (!blockedCounter) {
    blockedCounter = new promClient.Counter({
      name: 'app_rate_limiter_blocked_total',
      help: 'Total number of requests blocked by rate limiter'
    });
    global.__prom_counters.app_rate_limiter_blocked_total = blockedCounter;
  }
}

async function consume(key) {
  try {
    await limiter.consume(key);
    return { ok: true };
  } catch (rejRes) {
    // increment blocked counter for monitoring if available
    try {
      if (blockedCounter) blockedCounter.inc();
    } catch (e) {
      // ignore metric errors
    }
    return { ok: false, msBeforeNext: rejRes.msBeforeNext };
  }
}

module.exports = { consume, redisClient };
