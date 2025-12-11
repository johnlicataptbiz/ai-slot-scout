import { parseScrapedSlots } from '../useSlotScout';

describe('parseScrapedSlots', () => {
  test('parses valid markdown into slot map', () => {
    const md = `## 2025-12-15\n- 09:00 AM\n- 11:30 AM\n\n## 2025-12-16\n- 02:00 PM`;
    const parsed = parseScrapedSlots(md);
    expect(parsed['2025-12-15']).toEqual(['09:00 AM', '11:30 AM']);
    expect(parsed['2025-12-16']).toEqual(['02:00 PM']);
  });

  test('ignores invalid times and malformed headings', () => {
    const md = `## 2025-12-15\n- not a time\n* 10:00 AM\n# 2025-12-16\n- 11:00 AM`;
    const parsed = parseScrapedSlots(md);
    // only the valid bullet under the valid heading should be kept
    expect(parsed['2025-12-15']).toEqual(['10:00 AM']);
    expect(parsed['2025-12-16']).toBeUndefined();
  });
});
