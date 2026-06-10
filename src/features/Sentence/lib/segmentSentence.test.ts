import { describe, it, expect } from 'vitest';
import { segmentSentence } from './segmentSentence';
import { type SentenceToken } from '@/shared/api/types';

const tok = (surface_form: string, pos = '名詞'): SentenceToken => ({
  surface_form,
  pos,
  pos_detail_1: '',
  pos_detail_2: '',
  pos_detail_3: '',
  conjugated_type: '',
  conjugated_form: '',
  basic_form: surface_form,
});

const joined = (sentence: string, tokens: SentenceToken[]) =>
  segmentSentence(sentence, tokens)
    .map((s) => s.text)
    .join('');

describe('segmentSentence', () => {
  it('maps contiguous surfaces to token segments with their indices', () => {
    const sentence = '私は学生';
    const tokens = [tok('私'), tok('は', '助詞'), tok('学生')];
    const segments = segmentSentence(sentence, tokens);

    expect(segments).toEqual([
      { type: 'token', text: '私', tokenIndex: 0 },
      { type: 'token', text: 'は', tokenIndex: 1 },
      { type: 'token', text: '学生', tokenIndex: 2 },
    ]);
  });

  it('preserves trailing punctuation as a plain segment', () => {
    const sentence = 'この本はとても面白いです。';
    const tokens = [
      tok('この'),
      tok('本'),
      tok('は', '助詞'),
      tok('とても', '副詞'),
      tok('面白い', '形容詞'),
      tok('です', '助動詞'),
    ];
    const segments = segmentSentence(sentence, tokens);

    expect(joined(sentence, tokens)).toBe(sentence);
    expect(segments.at(-1)).toEqual({ type: 'plain', text: '。' });
    // 面白い is the 5th token (index 4) and keeps its index after the walk.
    expect(segments.find((s) => s.type === 'token' && s.text === '面白い')).toEqual({
      type: 'token',
      text: '面白い',
      tokenIndex: 4,
    });
  });

  it('keeps spacing between surfaces (non-concatenated sentence)', () => {
    const sentence = 'wǒ ài Zhōngguó';
    const tokens = [tok('wǒ', 'pronoun'), tok('ài', 'verb'), tok('Zhōngguó', 'noun')];

    expect(joined(sentence, tokens)).toBe(sentence);
    expect(segmentSentence(sentence, tokens).filter((s) => s.type === 'plain')).toEqual([
      { type: 'plain', text: ' ' },
      { type: 'plain', text: ' ' },
    ]);
  });

  it('never drops characters when a surface does not line up', () => {
    const sentence = '私は学生です';
    // 猫 does not appear in the sentence; it must be skipped without consuming.
    const tokens = [tok('私'), tok('猫'), tok('学生'), tok('です', '助動詞')];

    expect(joined(sentence, tokens)).toBe(sentence);
  });

  it('handles repeated surfaces by advancing the cursor each match', () => {
    const sentence = '本本';
    const tokens = [tok('本'), tok('本')];

    expect(segmentSentence(sentence, tokens)).toEqual([
      { type: 'token', text: '本', tokenIndex: 0 },
      { type: 'token', text: '本', tokenIndex: 1 },
    ]);
  });

  it('returns the whole sentence as plain when there are no tokens', () => {
    expect(segmentSentence('テスト', [])).toEqual([{ type: 'plain', text: 'テスト' }]);
  });
});
