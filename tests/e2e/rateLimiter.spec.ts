import { test, expect } from '@playwright/test';

const API_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4173';
const ENDPOINT = '/api/generate';

test.describe('Rate limiter', () => {
  test('blocks after threshold and exposes metrics', async ({ request }) => {
    // Use a unique IP for this test (simulate by setting header)
    const ip = '1.2.3.4';
    const payload = { url: 'https://calendly.com/demo', timezone: 'UTC', startDate: '2025-12-11' };
    let blocked = false;
    let allowed = 0;
    for (let i = 0; i < 15; i++) {
      const resp = await request.post(`${API_URL}${ENDPOINT}`, {
        data: payload,
        headers: { 'x-forwarded-for': ip }
      });
      if (resp.status() === 429) blocked = true;
      if (resp.status() === 200) allowed++;
    }
    expect(blocked).toBeTruthy();
    expect(allowed).toBeGreaterThan(0);

    // Check metrics endpoint
    const metricsResp = await request.get(`${API_URL}/api/metrics`);
    expect(metricsResp.status()).toBe(200);
    const metricsText = await metricsResp.text();
    expect(metricsText).toContain('app_rate_limiter_blocked_total');
    expect(metricsText).toMatch(/app_rate_limiter_blocked_total\s+\d+/);
  });
});
