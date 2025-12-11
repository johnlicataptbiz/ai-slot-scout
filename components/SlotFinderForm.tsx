import React, { useState, useEffect } from 'react';

interface SlotFinderFormProps {
  onSubmit: (url: string, timezone: string) => void;
  isLoading: boolean;
}

const COMMON_TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export const SlotFinderForm: React.FC<SlotFinderFormProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    // Auto-detect user's timezone
    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (userTz) {
        setTimezone(userTz);
      }
    } catch (e) {
      console.warn("Could not detect user timezone.", e);
      setTimezone("America/New_York");
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && timezone && !isLoading) {
      onSubmit(url, timezone);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-4">
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Scheduling Page URL
        </label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://calendly.com/your-name/30min"
          required
          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Target Timezone
        </label>
        <input
          id="timezone"
          type="text"
          list="timezones"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          placeholder="e.g., America/New_York"
          required
          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
        <datalist id="timezones">
          {COMMON_TIMEZONES.map(tz => <option key={tz} value={tz} />)}
        </datalist>
      </div>
      <button
        type="submit"
        disabled={isLoading || !url || !timezone}
        className="w-full flex justify-center items-center gap-2 px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Scanning...' : 'Find Available Slots'}
      </button>
    </form>
  );
};