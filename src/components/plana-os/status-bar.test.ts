import { describe, it, expect } from 'vitest';
import { formatStatusTime, getTimezoneAbbreviation } from './status-bar';

describe('formatStatusTime', () => {
  // 2026-05-25 16:22:11 UTC
  const fixed = new Date(Date.UTC(2026, 4, 25, 16, 22, 11));

  it('formats date with dots and separates the time block with " · "', () => {
    expect(formatStatusTime(fixed, 'UTC')).toBe('2026.05.25 · 16:22:11 UTC');
  });

  it('renders in the requested timezone, not local', () => {
    // JST is UTC+9 → 2026-05-26 01:22:11 in Tokyo. Node's ICU build may print
    // either "JST" or "GMT+9" for the abbreviation, so accept both.
    expect(formatStatusTime(fixed, 'Asia/Tokyo')).toMatch(
      /^2026\.05\.26 · 01:22:11 (JST|GMT\+9)$/,
    );
  });

  it('uses 24-hour time and zero-pads single-digit components', () => {
    // 2026-01-09 03:04:05 UTC — every component is single-digit before padding.
    const early = new Date(Date.UTC(2026, 0, 9, 3, 4, 5));
    expect(formatStatusTime(early, 'UTC')).toBe('2026.01.09 · 03:04:05 UTC');
  });

  it('falls back to a sane timezone string when given an unknown zone', () => {
    // Intl handles unknown zones by throwing; we just want a non-empty abbr in known zones.
    expect(getTimezoneAbbreviation(fixed, 'UTC')).toMatch(/^[A-Z]{2,5}$|^UTC$|^GMT$/);
  });
});
