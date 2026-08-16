import { describe, it, expect } from 'vitest';
import { createTranslate } from '@/shared/i18n';
import { formatInterval } from './srs';

describe('formatInterval', () => {
  const t = createTranslate('en');

  it('renders localized units from seconds, spaced off the number', () => {
    expect(formatInterval(60, t)).toBe('1 m'); // 1 minute
    expect(formatInterval(600, t)).toBe('10 m'); // 10 minutes
    expect(formatInterval(7200, t)).toBe('2 h'); // 2 hours
    expect(formatInterval(1209600, t)).toBe('2 w'); // 14 days
    expect(formatInterval(5184000, t)).toBe('2 mo'); // 60 days
    expect(formatInterval(31536000, t)).toBe('1 y'); // 365 days
  });

  it('spells days out and picks the right plural form', () => {
    // The grade buttons show days more than any other unit, and the mock spells
    // them in full. Russian needs all three forms; English collapses two of them.
    const ru = createTranslate('ru');
    expect(formatInterval(86400, t)).toBe('1 day');
    expect(formatInterval(345600, t)).toBe('4 days');
    expect(formatInterval(86400, ru)).toBe('1 день');
    expect(formatInterval(345600, ru)).toBe('4 дня');
    expect(formatInterval(432000, ru)).toBe('5 дней');
  });

  it('formats the same interval differently per locale', () => {
    // Guards the property that made the module global worth removing: two
    // locales must be usable in the same process without interfering.
    const ru = createTranslate('ru');
    expect(formatInterval(86400, t)).not.toBe(formatInterval(86400, ru));
  });
});
