import { useState, useCallback, useEffect } from 'react';
import { CadenceSlots, SlotsByDate } from '../types';
import { selectSpreadOutCadence } from '../utils/time';

// Helper to parse the markdown response from Gemini
export const parseScrapedSlots = (markdown: string): SlotsByDate => {
    const slots: SlotsByDate = {};
    const lines = markdown.split('\n');
    let currentDate: string | null = null;

    for (const line of lines) {
        const dateMatch = line.match(/^##\s*(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
            currentDate = dateMatch[1];
            if (!slots[currentDate]) {
                slots[currentDate] = [];
            }
            continue;
        }

        // If we encounter any other markdown heading (e.g. '#', '###')
        // treat it as a break in the current date context so bullets
        // that follow are not attributed to the previous valid date.
        if (line.trim().startsWith('#')) {
            currentDate = null;
            continue;
        }

        const timeMatch = line.match(/^[*-]\s*(.+)/);
        if (timeMatch && currentDate) {
            const time = timeMatch[1].trim();
            // Basic validation for time format
            if (time.match(/\d{1,2}:\d{2}\s*(AM|PM)/i)) {
                slots[currentDate].push(time);
            }
        }
    }
    return slots;
};

export const useSlotScout = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<CadenceSlots | null>(null);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [rawSlots, setRawSlots] = useState<string[]>([]);

    // Listen for slot data from content script
    useEffect(() => {
        function handleSlotScoutResults(event: MessageEvent) {
            if (event.data?.type === 'SLOT_SCOUT_RESULTS') {
                setRawSlots(event.data.slots || []);
            }
        }
        window.addEventListener('message', handleSlotScoutResults);
        return () => window.removeEventListener('message', handleSlotScoutResults);
    }, []);

    const findSlots = useCallback((url: string, timezone: string) => {
        setIsLoading(true);
        setError(null);
        setResults(null);
        setLoadingMessage('Scanning slots from page...');

        // Trigger content script slot scan (if needed)
        // In popup, content script should already be injected and posting results

        setTimeout(() => {
            if (!rawSlots.length) {
                setResults({});
                setLoadingMessage('No slots found.');
                setIsLoading(false);
                return;
            }
            // Group slots by date (assume today for demo)
            const today = new Date().toLocaleDateString('en-CA');
            const slotsByDate: SlotsByDate = { [today]: rawSlots };
            const cadenceSlots = selectSpreadOutCadence(slotsByDate);
            setResults(cadenceSlots);
            setLoadingMessage('');
            setIsLoading(false);
        }, 1000);
    }, [rawSlots]);

    const generateCopyText = useCallback(async (date: string, times: string[], timezone: string): Promise<string> => {
        // Local-only: generate a simple message
        return `${date} (${timezone}): ${times.join(', ')}`;
    }, []);

    return { isLoading, loadingMessage, error, results, findSlots, generateCopyText };
};
