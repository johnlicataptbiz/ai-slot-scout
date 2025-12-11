import { parseTimeTo24h, timeToMinutes, selectSpreadOutCadence } from '../time';

describe('time utilities', () => {
  test('parseTimeTo24h converts AM/PM correctly', () => {
    expect(parseTimeTo24h('9:00 AM')).toEqual({ hour: 9, minute: 0 });
    expect(parseTimeTo24h('12:30 PM')).toEqual({ hour: 12, minute: 30 });
    expect(parseTimeTo24h('7:45 PM')).toEqual({ hour: 19, minute: 45 });
    expect(parseTimeTo24h('12:00 AM')).toEqual({ hour: 0, minute: 0 });
  });

  test('timeToMinutes returns correct minutes', () => {
    expect(timeToMinutes('1:00 PM')).toBe(13 * 60);
    expect(timeToMinutes('12:30 AM')).toBe(30);
  });

  test('selectSpreadOutCadence chooses up to 3 days and up to 2 times', () => {
    const slotsByDate = {
      '2025-12-01': ['09:00 AM', '10:00 AM', '03:00 PM'],
      '2025-12-02': ['11:00 AM'],
      '2025-12-03': ['08:00 AM', '05:00 PM', '06:00 PM'],
      '2025-12-04': ['09:00 AM']
    };

    const selected = selectSpreadOutCadence(slotsByDate);
    const days = Object.keys(selected);
    expect(days.length).toBeLessThanOrEqual(3);
    for (const d of days) {
      expect(selected[d].length).toBeLessThanOrEqual(2);
    }
  });
});
