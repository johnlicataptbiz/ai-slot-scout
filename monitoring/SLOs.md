# SLOs for AI Slot Scout

## Availability
- **API endpoints** (`/api/generate`, `/api/generate-copy`):
  - SLO: 99.9% successful response rate (non-5xx, non-429) over 30 days

## Latency
- **AI response latency** (`/api/generate`, `/api/generate-copy`):
  - SLO: 95% of requests complete in <2 seconds (measured by Prometheus histogram)

## Rate Limiting
- **Blocked requests**:
  - SLO: <1% of legitimate user requests are blocked (measured by `app_rate_limiter_blocked_total` vs. total requests)

## Error Rate
- **AI errors**:
  - SLO: <0.5% error rate on AI requests (measured by `ai_generate_errors_total` / `ai_generate_requests_total`)

## Monitoring & Alerting
- All SLOs are tracked via Prometheus metrics and visualized in Grafana (see `grafana-dashboard.json`).
- Alerts should be configured for:
  - Error rate >0.5% for 10m
  - Latency 95th percentile >2s for 10m
  - Availability <99.9% for 1h
  - Blocked requests >1% for 10m

## Review
- SLOs should be reviewed quarterly and adjusted based on user feedback and traffic patterns.
