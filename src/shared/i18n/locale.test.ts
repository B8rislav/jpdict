import { describe, expect, it } from 'vitest';
import { detectLocale } from './locale';

describe('detectLocale', () => {
  it('picks the highest-quality supported language, not merely a present one', () => {
    // Stock Chrome on a Russian system with English installed second. The old
    // implementation tested /\ben[-_]/ against the whole header and served
    // these users English.
    expect(detectLocale('ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7')).toBe('ru');
    expect(detectLocale('ja-JP,ja;q=0.9,en-US;q=0.8')).toBe('en');
  });

  it('honours an explicit English preference', () => {
    expect(detectLocale('en-US,en;q=0.9')).toBe('en');
    expect(detectLocale('en-US,en;q=0.9,ru;q=0.8')).toBe('en');
  });

  it('treats a missing q as q=1', () => {
    expect(detectLocale('en,ru;q=0.9')).toBe('en');
    expect(detectLocale('ru,en;q=0.9')).toBe('ru');
  });

  it('ignores q=0, which explicitly rejects a language', () => {
    expect(detectLocale('en;q=0,ru;q=0.5')).toBe('ru');
  });

  it('normalises region and case', () => {
    expect(detectLocale('EN-GB')).toBe('en');
    expect(detectLocale('en_US')).toBe('en');
  });

  it('falls back to ru for unsupported or absent headers', () => {
    expect(detectLocale('de-DE,de;q=0.9')).toBe('ru');
    expect(detectLocale(null)).toBe('ru');
    expect(detectLocale('')).toBe('ru');
  });

  it('survives a malformed header rather than throwing', () => {
    expect(detectLocale(';;;,,,')).toBe('ru');
    expect(detectLocale('en;q=notanumber')).toBe('ru');
  });
});
