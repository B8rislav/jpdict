import { describe, it, expect } from 'vitest';
import { setLocale } from '@/shared/i18n';
import { formatInterval } from './srs';

describe('formatInterval', () => {
  it('renders compact localized units from seconds', () => {
    setLocale('en');
    expect(formatInterval(60)).toBe('1m'); // 1 minute
    expect(formatInterval(600)).toBe('10m'); // 10 minutes
    expect(formatInterval(7200)).toBe('2h'); // 2 hours
    expect(formatInterval(86400)).toBe('1d'); // 1 day
    expect(formatInterval(345600)).toBe('4d'); // 4 days
    expect(formatInterval(1209600)).toBe('2w'); // 14 days
    expect(formatInterval(5184000)).toBe('2mo'); // 60 days
    expect(formatInterval(31536000)).toBe('1y'); // 365 days
  });
});
