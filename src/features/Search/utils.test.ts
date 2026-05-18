import { describe, it, expect } from 'vitest';
import { classifySearchQuery } from './utils';

describe('classifySearchQuery', () => {
  // ── empty ────────────────────────────────────────────────────────────────────
  it('empty string → word', () => {
    expect(classifySearchQuery('', null)).toBe('word');
  });

  // ── JP mode ──────────────────────────────────────────────────────────────────
  it('JP: single kanji → kanji', () => {
    expect(classifySearchQuery('食', 'jp')).toBe('kanji');
  });

  it('JP: short Japanese word (≤6 chars, no space) → word', () => {
    expect(classifySearchQuery('たべる', 'jp')).toBe('word');
  });

  it('JP: Japanese text with space → sentence', () => {
    expect(classifySearchQuery('私は 食べる', 'jp')).toBe('sentence');
  });

  it('JP: Japanese text longer than 6 chars without space → sentence', () => {
    // 'たべていますよ' = 7 chars, triggers the > 6 rule
    expect(classifySearchQuery('たべていますよ', 'jp')).toBe('sentence');
  });

  it('JP: short non-Japanese string → word', () => {
    expect(classifySearchQuery('hello', 'jp')).toBe('word');
  });

  // ── CN mode ──────────────────────────────────────────────────────────────────
  it('CN: single Chinese character → kanji', () => {
    expect(classifySearchQuery('中', 'cn')).toBe('kanji');
  });

  it('CN: short Chinese word → word', () => {
    expect(classifySearchQuery('中国語', 'cn')).toBe('word');
  });

  it('CN: Chinese text with space → sentence', () => {
    expect(classifySearchQuery('这是 一句', 'cn')).toBe('sentence');
  });

  it('CN: Chinese text longer than 6 chars → sentence', () => {
    expect(classifySearchQuery('中国語を勉強して', 'cn')).toBe('sentence');
  });

  // ── null mode ─────────────────────────────────────────────────────────────────
  it('null: single character → kanji', () => {
    expect(classifySearchQuery('a', null)).toBe('kanji');
  });

  it('null: text with space → sentence', () => {
    expect(classifySearchQuery('hello world', null)).toBe('sentence');
  });
});
