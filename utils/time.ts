import { Time24h } from '../types';

export function parseTimeTo24h(timeStr: string): Time24h | null {
  const match = timeStr.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = match[3].toUpperCase();

  if (meridiem === "PM" && hour !== 12) {
    hour += 12;
  }
  if (meridiem === "AM" && hour === 12) {
    hour = 0;
  }

  return { hour, minute };
}

export function timeToMinutes(t: string): number | null {
  const parsed = parseTimeTo24h(t);
  if (!parsed) return null;
  return parsed.hour * 60 + parsed.minute;
}

export function selectSpreadOutCadence(slotsByDate: { [dateKey: string]: string[] }): { [dateKey: string]: string[] } {
  const dates = Object.keys(slotsByDate).sort();
  const selected: { [dateKey: string]: string[] } = {};
  let daysChosen = 0;
  const maxDays = 3;
  const maxPerDay = 2;

  for (const dateKey of dates) {
    if (daysChosen >= maxDays) break;

    const times = Array.from(new Set(slotsByDate[dateKey] || []));
    if (times.length === 0) continue;

    const withMinutes = times
      .map((t) => ({ t, m: timeToMinutes(t) }))
      .filter((x) => x.m !== null)
      .sort((a, b) => a.m! - b.m!);

    if (withMinutes.length === 0) continue;

    let chosenTimes: string[];
    if (withMinutes.length <= maxPerDay) {
      chosenTimes = withMinutes.map((x) => x.t);
    } else {
      const earliest = withMinutes[0].t;
      const latest = withMinutes[withMinutes.length - 1].t;
      chosenTimes = [earliest, latest];
    }

    selected[dateKey] = chosenTimes;
    daysChosen += 1;
  }

  return selected;
}