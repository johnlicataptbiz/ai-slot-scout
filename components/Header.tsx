import React from 'react';
import { LogoIcon, ResetIcon } from './icons';

interface HeaderProps {
  onReset: () => void;
  calendlyUrl: string;
}

export const Header: React.FC<HeaderProps> = ({ onReset, calendlyUrl }) => {
  return (
    <header className="relative text-center p-4 sm:p-6 mb-8">
      <div className="flex items-center justify-center gap-3 mb-2">
        <LogoIcon className="w-8 h-8 text-primary-400" />
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          AI Slot Scout
        </h1>
      </div>
      <p className="max-w-2xl mx-auto text-sm text-slate-400 truncate">
        Scanning: <span className="font-mono text-slate-300">{calendlyUrl}</span>
      </p>
      <button 
        onClick={onReset}
        title="Reset Calendly Link"
        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
        aria-label="Reset scheduling URL"
      >
        <ResetIcon className="w-5 h-5" />
      </button>
    </header>
  );
};