import { describe, it, expect } from 'vitest';
import { createTranslate } from '@/shared/i18n';
import { formatInterval } from './srs';

describe('formatInterval', () => {
  const t = createTranslate('en');

  it('renders compact localized units from seconds', () => {
    expect(formatInterval(60, t)).toBe('1m'); // 1 minute
    expect(formatInterval(600, t)).toBe('10m'); // 10 minutes
    expect(formatInterval(7200, t)).toBe('2h'); // 2 hours
    expect(formatInterval(86400, t)).toBe('1d'); // 1 day
    expect(formatInterval(345600, t)).toBe('4d'); // 4 days
    expect(formatInterval(1209600, t)).toBe('2w'); // 14 days
    expect(formatInterval(5184000, t)).toBe('2mo'); // 60 days
    expect(formatInterval(31536000, t)).toBe('1y'); // 365 days
  });

  it('formats the same interval differently per locale', () => {
    // Guards the property that made the module global worth removing: two
    // locales must be usable in the same process without interfering.
    const ru = createTranslate('ru');
    expect(formatInterval(86400, t)).not.toBe(formatInterval(86400, ru));
  });
});
