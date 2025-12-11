Monitoring & alert templates
=============================

This document contains example monitors and alerting rules for Redis and the rate limiter. Use these as starting points for Datadog, Prometheus/Grafana, or your monitoring provider.

Datadog examples
-----------------

1. Redis memory usage (Datadog monitor)

Name: Redis memory usage high
Query:
```text
avg(last_5m):avg:redis.used_memory{*} by {host} > 500000000
```
Alert conditions: OK -> Warning -> Alert as appropriate for your instance size.

2. Redis connection errors or evictions

Name: Redis evicted keys or rejected connections
Query:
```text
sum(last_5m):sum:redis.evicted_keys{*} by {host} > 0 OR sum(last_5m):sum:redis.rejected_connections{*} by {host} > 0
```

3. Rate limiter blocked requests (custom metric)

If you emit a custom metric from your server when a request is blocked by the rate limiter, monitor it:

Name: Rate limiter blocks
Query:
```text
sum(last_5m):sum:app.rate_limiter.blocked{*} > 0
```

Prometheus / Grafana examples
-----------------------------

1. Redis memory usage (Prometheus expression)

```text
redis_memory_used_bytes{job="redis"}
```

Create an alert rule when the value exceeds a threshold for several minutes.

2. Rate limiter blocks (Prometheus)

If your server exposes a counter `app_rate_limiter_blocked_total`, use:

```text
increase(app_rate_limiter_blocked_total[5m]) > 0
```

How to instrument
-----------------

- Redis: most managed Redis providers expose metrics to Datadog or Cloud provider metrics. Enable those integrations.
- Rate limiter: emit a custom counter when a request is blocked. Example (Node/Express):

```js
// pseudo-code
if (blocked) {
  dogstatsd.increment('app.rate_limiter.blocked');
  prometheusCounter.inc();
}
```

Runbook snippets
-----------------

- If Redis memory is high: scale the Redis instance, investigate eviction policies, and check for memory-heavy keys.
- If rate limiter blocks many users: check if legitimate traffic patterns changed, consider increasing quota (RATE_LIMIT_POINTS) or using different keys (e.g., per-user instead of per-IP).
Monitoring & alert templates
=============================

This document contains example monitors and alerting rules for Redis and the rate limiter. Use these as starting points for Datadog, Prometheus/Grafana, or your monitoring provider.

Datadog examples
-----------------

1. Redis memory usage (Datadog monitor)

Name: Redis memory usage high
Query:
```text
avg(last_5m):avg:redis.used_memory{*} by {host} > 500000000
```
Alert conditions: OK -> Warning -> Alert as appropriate for your instance size.

2. Redis connection errors or evictions

Name: Redis evicted keys or rejected connections
Query:
```text
sum(last_5m):sum:redis.evicted_keys{*} by {host} > 0 OR sum(last_5m):sum:redis.rejected_connections{*} by {host} > 0
```

3. Rate limiter blocked requests (custom metric)

If you emit a custom metric from your server when a request is blocked by the rate limiter, monitor it:

Name: Rate limiter blocks
Query:
```text
sum(last_5m):sum:app.rate_limiter.blocked{*} > 0
```

Prometheus / Grafana examples
-----------------------------

1. Redis memory usage (Prometheus expression)

```text
redis_memory_used_bytes{job="redis"}
```

Create an alert rule when the value exceeds a threshold for several minutes.

2. Rate limiter blocks (Prometheus)

If your server exposes a counter `app_rate_limiter_blocked_total`, use:

```text
increase(app_rate_limiter_blocked_total[5m]) > 0
```

How to instrument
-----------------

- Redis: most managed Redis providers expose metrics to Datadog or Cloud provider metrics. Enable those integrations.
- Rate limiter: emit a custom counter when a request is blocked. Example (Node/Express):

```js
// pseudo-code
if (blocked) {
  dogstatsd.increment('app.rate_limiter.blocked');
  prometheusCounter.inc();
}
```

Runbook snippets
-----------------

- If Redis memory is high: scale the Redis instance, investigate eviction policies, and check for memory-heavy keys.
- If rate limiter blocks many users: check if legitimate traffic patterns changed, consider increasing quota (RATE_LIMIT_POINTS) or using different keys (e.g., per-user instead of per-IP).
