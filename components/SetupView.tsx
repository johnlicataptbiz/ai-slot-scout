import React, { useState } from 'react';
import { LogoIcon } from './icons';

interface SetupViewProps {
  onSave: (url: string) => void;
}

export const SetupView: React.FC<SetupViewProps> = ({ onSave }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      onSave(url);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-black">
      <div className="w-full max-w-md text-center p-8 bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-700">
        <div className="flex items-center justify-center gap-3 mb-4">
          <LogoIcon className="w-10 h-10 text-primary-400" />
          <h1 className="text-3xl font-bold text-white">AI Slot Scout</h1>
        </div>
        <p className="text-slate-400 mb-8">
          Enter your public Calendly or HubSpot link once to get started.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://calendly.com/your-name/30min"
            required
            className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg shadow-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            type="submit"
            disabled={!url}
            className="w-full px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
};