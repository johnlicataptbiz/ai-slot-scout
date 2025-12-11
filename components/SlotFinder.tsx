import React, { useState, useEffect } from 'react';
import { TIMEZONE_OPTIONS } from '../constants';
import { SearchIcon } from './icons';

interface SlotFinderProps {
  onSubmit: (timezone: string) => void;
  isLoading: boolean;
}

export const SlotFinder: React.FC<SlotFinderProps> = ({ onSubmit, isLoading }) => {
  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (userTz && TIMEZONE_OPTIONS.some(tz => tz.name === userTz)) {
        setTimezone(userTz);
      } else {
        setTimezone(TIMEZONE_OPTIONS[0].name); // Default to first in list
      }
    } catch (e) {
      setTimezone(TIMEZONE_OPTIONS[0].name);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (timezone && !isLoading) {
      onSubmit(timezone);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center justify-between gap-4 p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700">
      <div className="flex-grow">
        <label htmlFor="timezone" className="block text-sm font-medium text-slate-300 mb-1">
          Target Timezone
        </label>
        <select
          id="timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          required
          className="w-full px-3 py-2 bg-slate-900/70 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-2 ring-offset-2 ring-offset-slate-800 focus:ring-primary-500 focus:border-primary-500"
        >
          {TIMEZONE_OPTIONS.map(tz => (
            <option key={tz.name} value={tz.name}>
              {tz.abbreviation} ({tz.name.split('/')[1].replace('_', ' ')})
            </option>
          ))}
        </select>
      </div>
      <div className="pt-6">
        <button
          type="submit"
          disabled={isLoading || !timezone}
          className="w-16 h-16 flex justify-center items-center rounded-full shadow-lg text-white bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/50 disabled:from-slate-500 disabled:to-slate-600 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          aria-label="Find Times"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <SearchIcon className="w-8 h-8" />
          )}
        </button>
      </div>
    </form>
  );
};