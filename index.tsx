import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Sentry client init (Vite exposes VITE_* env vars via import.meta.env)
try {
  // only load Sentry if configured
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (dsn) {
    // dynamic import to avoid requiring package if not installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/react');
    const Tracing = require('@sentry/tracing');
    Sentry.init({
      dsn,
      integrations: [new Tracing.BrowserTracing()],
      tracesSampleRate: 0.1,
      environment: import.meta.env.VITE_SENTRY_ENV || import.meta.env.MODE,
    });
  }
} catch (e) {
  // ignore if Sentry isn't installed or not configured
  // console.warn('Sentry init failed', e);
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);