import { describe, it, expect } from 'vitest';
import { isJapaneseText } from './isJapaneseText';

describe('isJapaneseText', () => {
  it('empty string → false', () => {
    expect(isJapaneseText('')).toBe(false);
  });

  it('whitespace only → false', () => {
    expect(isJapaneseText('   ')).toBe(false);
  });

  it('pure ASCII → false', () => {
    expect(isJapaneseText('hello')).toBe(false);
  });

  it('numbers only → false', () => {
    expect(isJapaneseText('12345')).toBe(false);
  });

  it('hiragana text → true', () => {
    expect(isJapaneseText('てすと')).toBe(true);
  });

  it('katakana text → true', () => {
    expect(isJapaneseText('テスト')).toBe(true);
  });

  it('kanji text → true', () => {
    expect(isJapaneseText('漢字')).toBe(true);
  });

  it('mixed Japanese + ASCII → true', () => {
    expect(isJapaneseText('hello日本語')).toBe(true);
  });

  it('single space between Japanese words → true (one space is allowed)', () => {
    expect(isJapaneseText('日本語 テスト')).toBe(true);
  });

  it('double spaces inside → false', () => {
    expect(isJapaneseText('日本語  テスト')).toBe(false);
  });

  it('spaces on both sides of content → false', () => {
    expect(isJapaneseText('日本 語 テスト')).toBe(false);
  });

  it('leading/trailing spaces are trimmed and ignored', () => {
    expect(isJapaneseText('  漢字  ')).toBe(true);
  });
});
