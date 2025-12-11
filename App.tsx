import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SlotFinder } from './components/SlotFinder';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useSlotScout } from './hooks/useSlotScout';
import { SetupView } from './components/SetupView';

const App: React.FC = () => {
  const [calendlyUrl, setCalendlyUrl] = useState<string | null>(null);
  const { isLoading, loadingMessage, error, results, findSlots, generateCopyText } = useSlotScout();
  const [submittedTimezone, setSubmittedTimezone] = useState('');

  useEffect(() => {
    const savedUrl = localStorage.getItem('calendlyUrl');
    if (savedUrl) {
      setCalendlyUrl(savedUrl);
    }
  }, []);

  const handleSaveUrl = (url: string) => {
    localStorage.setItem('calendlyUrl', url);
    setCalendlyUrl(url);
  };

  const handleReset = () => {
    localStorage.removeItem('calendlyUrl');
    setCalendlyUrl(null);
  };

  const handleSearch = (timezone: string) => {
    if (!calendlyUrl) return;
    setSubmittedTimezone(timezone);
    findSlots(calendlyUrl, timezone);
  };

  if (!calendlyUrl) {
    return <SetupView onSave={handleSaveUrl} />;
  }

  return (
    <div className="min-h-screen text-slate-200 antialiased">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Header onReset={handleReset} calendlyUrl={calendlyUrl} />
        
        <SlotFinder onSubmit={handleSearch} isLoading={isLoading} />

        <div className="mt-8">
          {isLoading && <LoadingSpinner message={loadingMessage || 'Loading...'} />}
          {error && (
            <div className="p-4 text-center bg-red-900/50 border border-red-600 text-red-200 rounded-lg">
              <h3 className="font-bold">An Error Occurred</h3>
              <p className="text-sm">{error}</p>
            </div>
          )}
          {results && (
            <ResultsDisplay 
              results={results} 
              timezone={submittedTimezone}
              generateCopyText={generateCopyText}
            />
          )}
        </div>
        
        <footer className="text-center mt-12 text-xs text-slate-500">
            <p>Powered by Google Gemini. This is a demo application.</p>
            <p>Ensure the provided URL is a public Calendly or HubSpot scheduling page.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;