// Expose Prometheus metrics for scraping
let promClient;
try {
  promClient = require('prom-client');
} catch (e) {
  promClient = null;
}

module.exports = async (req, res) => {
  if (!promClient) {
    return res.status(501).send('Metrics not configured');
  }

  try {
    res.setHeader('Content-Type', promClient.register.contentType || 'text/plain; version=0.0.4');
    const metrics = await promClient.register.metrics();
    res.status(200).send(metrics);
  } catch (err) {
    console.error('Failed to collect metrics', err);
    res.status(500).send('Failed to collect metrics');
  }
};
