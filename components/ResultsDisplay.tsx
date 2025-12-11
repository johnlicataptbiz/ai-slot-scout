import React, { useState } from 'react';
import { CadenceSlots } from '../types';
import { ClipboardIcon, CheckIcon } from './icons';

interface ResultsDisplayProps {
  results: CadenceSlots;
  timezone: string;
  generateCopyText: (date: string, times: string[], timezone: string) => Promise<string>;
}

interface ResultCardProps {
  date: string;
  times: string[];
  timezone: string;
  generateCopyText: (date: string, times: string[], timezone: string) => Promise<string>;
}

const ResultCard: React.FC<ResultCardProps> = ({ date, times, timezone, generateCopyText }) => {
  const [isCopying, setIsCopying] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = async () => {
    setIsCopying(true);
    setHasCopied(false);
    try {
      const message = await generateCopyText(date, times, timezone);
      await navigator.clipboard.writeText(message);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Failed to generate or copy message. Please try again.");
    } finally {
      setIsCopying(false);
    }
  };

  const dateObj = new Date(date + 'T12:00:00Z');
  const titleText = dateObj.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });

  return (
    <div className="bg-slate-800/70 backdrop-blur-sm border border-slate-700 rounded-lg shadow-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all hover:bg-slate-800">
      <div>
        <h3 className="font-bold text-lg text-slate-100">{titleText}</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
          {times.map(time => (
            <span key={time} className="px-3 py-1 bg-primary-900/70 text-primary-300 rounded-full text-sm font-medium">
              {time}
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={handleCopy}
        disabled={isCopying}
        className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 border border-slate-600 text-sm font-medium rounded-md text-slate-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-primary-500 disabled:opacity-50 transition-all"
      >
        {hasCopied ? (
          <>
            <CheckIcon className="w-5 h-5 text-green-500" />
            Copied!
          </>
        ) : isCopying ? (
          'Generating...'
        ) : (
          <>
            <ClipboardIcon className="w-5 h-5" />
            Copy Message
          </>
        )}
      </button>
    </div>
  );
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, timezone, generateCopyText }) => {
  const dates = Object.keys(results).sort();

  if (dates.length === 0) {
    return (
      <div className="text-center p-8 bg-slate-800/70 backdrop-blur-sm border border-slate-700 rounded-lg shadow-lg">
        <h3 className="text-lg font-medium text-slate-100">No Available Slots Found</h3>
        <p className="mt-1 text-sm text-slate-400">
          No open meeting times were found on the page. It may be fully booked or the link is incorrect.<br />
          Make sure you are on a public Calendly or HubSpot scheduling page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dates.map(date => (
        <ResultCard
          key={date}
          date={date}
          times={results[date]}
          timezone={timezone}
          generateCopyText={generateCopyText}
        />
      ))}
    </div>
  );
};