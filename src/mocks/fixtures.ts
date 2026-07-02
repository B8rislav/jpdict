import { type BackendReviewCard } from '@/features/Review/api/types';

/**
 * Seed data for the mock backend, written in the **backend's snake_case contract**
 * (the BFF does the camelCase translation). Cloned into the in-memory store on
 * module load (see db.ts) and reset whenever the dev server restarts.
 */

/** A saved vocabulary row as FastAPI returns it (`GET /api/vocabulary`). */
export type BackendWord = {
  id: string;
  language: 'jp' | 'cn';
  expression: string;
  reading: string;
  meaning: string;
  jlpt_level: number | null;
  hsk_level: number | null;
  status: string;
  added_at: string;
  suspended: boolean;
};

/** A search-history row (`GET /api/history`). The frontend only reads `id` + `query`. */
export type BackendHistoryItem = {
  id: string;
  language: 'jp' | 'cn';
  query: string;
  query_type: string;
  created_at: string;
};

/** One analyzer lexicon entry, in the snake_case token shape `POST /api/analyze` returns. */
export type LexiconEntry = {
  dictionary_form: string | null;
  reading: string | null;
  pos: string;
  jlpt_level: number | null;
  hsk_level: number | null;
  pinyin: string | null;
};

const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 86_400_000).toISOString();
const dueIn = (seconds: number) => new Date(Date.now() + seconds * 1000).toISOString();

export const seedVocabulary: BackendWord[] = [
  // Japanese — mixed JLPT levels and mastery statuses.
  { id: 'v-jp-1', language: 'jp', expression: '食べる', reading: 'たべる', meaning: 'to eat', jlpt_level: 5, hsk_level: null, status: 'new', added_at: iso(1), suspended: false },
  { id: 'v-jp-2', language: 'jp', expression: '図書館', reading: 'としょかん', meaning: 'library', jlpt_level: 4, hsk_level: null, status: 'learning', added_at: iso(3), suspended: false },
  { id: 'v-jp-3', language: 'jp', expression: '経済', reading: 'けいざい', meaning: 'economy', jlpt_level: 3, hsk_level: null, status: 'known', added_at: iso(8), suspended: false },
  { id: 'v-jp-4', language: 'jp', expression: '難しい', reading: 'むずかしい', meaning: 'difficult', jlpt_level: 4, hsk_level: null, status: 'new', added_at: iso(2), suspended: false },
  { id: 'v-jp-5', language: 'jp', expression: '約束', reading: 'やくそく', meaning: 'promise', jlpt_level: 3, hsk_level: null, status: 'learning', added_at: iso(5), suspended: false },
  { id: 'v-jp-6', language: 'jp', expression: '環境', reading: 'かんきょう', meaning: 'environment', jlpt_level: 2, hsk_level: null, status: 'known', added_at: iso(12), suspended: false },
  { id: 'v-jp-7', language: 'jp', expression: '影響', reading: 'えいきょう', meaning: 'influence', jlpt_level: 2, hsk_level: null, status: 'new', added_at: iso(0), suspended: true },
  // Chinese — the hanzi path. `reading` carries the pinyin (matching the analyzer's CN branch).
  { id: 'v-cn-1', language: 'cn', expression: '你好', reading: 'nǐ hǎo', meaning: 'hello', jlpt_level: null, hsk_level: 1, status: 'learning', added_at: iso(4), suspended: false },
  { id: 'v-cn-2', language: 'cn', expression: '谢谢', reading: 'xiè xie', meaning: 'thank you', jlpt_level: null, hsk_level: 1, status: 'known', added_at: iso(9), suspended: false },
  { id: 'v-cn-3', language: 'cn', expression: '经济', reading: 'jīng jì', meaning: 'economy', jlpt_level: null, hsk_level: 4, status: 'new', added_at: iso(1), suspended: false },
];

export const seedHistory: BackendHistoryItem[] = [
  { id: 'h-1', language: 'jp', query: '図書館', query_type: 'word', created_at: iso(0) },
  { id: 'h-2', language: 'jp', query: '私は毎日日本語を勉強します', query_type: 'sentence', created_at: iso(1) },
  { id: 'h-3', language: 'jp', query: '難しい', query_type: 'word', created_at: iso(2) },
  { id: 'h-4', language: 'cn', query: '你好', query_type: 'word', created_at: iso(0) },
  { id: 'h-5', language: 'cn', query: '我每天在图书馆学习中文', query_type: 'sentence', created_at: iso(3) },
];

const intervals = { again: 60, hard: 600, good: 86_400, easy: 345_600 } as const;

export const seedReviewCards: BackendReviewCard[] = [
  // New (never reviewed): repetitions 0, no due date.
  { id: 'r-jp-1', language: 'jp', expression: '食べる', reading: 'たべる', meaning: 'to eat', jlpt_level: 5, hsk_level: null, status: 'new', due_at: null, interval_days: 0, ease_factor: 2.5, repetitions: 0, lapses: 0, last_reviewed_at: null, suspended: false, projected_intervals: { ...intervals } },
  { id: 'r-jp-2', language: 'jp', expression: '難しい', reading: 'むずかしい', meaning: 'difficult', jlpt_level: 4, hsk_level: null, status: 'new', due_at: null, interval_days: 0, ease_factor: 2.5, repetitions: 0, lapses: 0, last_reviewed_at: null, suspended: false, projected_intervals: { ...intervals } },
  // Due now (reviewed before, due date in the past).
  { id: 'r-jp-3', language: 'jp', expression: '図書館', reading: 'としょかん', meaning: 'library', jlpt_level: 4, hsk_level: null, status: 'learning', due_at: dueIn(-3600), interval_days: 1, ease_factor: 2.4, repetitions: 2, lapses: 0, last_reviewed_at: iso(1), suspended: false, projected_intervals: { ...intervals } },
  { id: 'r-jp-4', language: 'jp', expression: '約束', reading: 'やくそく', meaning: 'promise', jlpt_level: 3, hsk_level: null, status: 'learning', due_at: dueIn(-7200), interval_days: 1, ease_factor: 2.3, repetitions: 1, lapses: 1, last_reviewed_at: iso(2), suspended: false, projected_intervals: { ...intervals } },
  // Chinese cards (the hanzi path) — `reading` holds the pinyin.
  { id: 'r-cn-1', language: 'cn', expression: '你好', reading: 'nǐ hǎo', meaning: 'hello', jlpt_level: null, hsk_level: 1, status: 'new', due_at: null, interval_days: 0, ease_factor: 2.5, repetitions: 0, lapses: 0, last_reviewed_at: null, suspended: false, projected_intervals: { ...intervals } },
  { id: 'r-cn-2', language: 'cn', expression: '经济', reading: 'jīng jì', meaning: 'economy', jlpt_level: null, hsk_level: 4, status: 'learning', due_at: dueIn(-1800), interval_days: 1, ease_factor: 2.4, repetitions: 1, lapses: 0, last_reviewed_at: iso(1), suspended: false, projected_intervals: { ...intervals } },
];

/**
 * Tiny analyzer lexicons for longest-match segmentation in the analyze handler.
 * Keyed by surface form. Covers the two demo sentences plus common particles;
 * anything unmatched falls back to a single-character token.
 */
export const jpLexicon: Record<string, LexiconEntry> = {
  私: { dictionary_form: '私', reading: 'わたし', pos: '代名詞', jlpt_level: 5, hsk_level: null, pinyin: null },
  は: { dictionary_form: 'は', reading: 'は', pos: '助詞', jlpt_level: null, hsk_level: null, pinyin: null },
  毎日: { dictionary_form: '毎日', reading: 'まいにち', pos: '名詞', jlpt_level: 5, hsk_level: null, pinyin: null },
  図書館: { dictionary_form: '図書館', reading: 'としょかん', pos: '名詞', jlpt_level: 4, hsk_level: null, pinyin: null },
  で: { dictionary_form: 'で', reading: 'で', pos: '助詞', jlpt_level: null, hsk_level: null, pinyin: null },
  日本語: { dictionary_form: '日本語', reading: 'にほんご', pos: '名詞', jlpt_level: 5, hsk_level: null, pinyin: null },
  を: { dictionary_form: 'を', reading: 'を', pos: '助詞', jlpt_level: null, hsk_level: null, pinyin: null },
  勉強: { dictionary_form: '勉強', reading: 'べんきょう', pos: '名詞', jlpt_level: 5, hsk_level: null, pinyin: null },
  します: { dictionary_form: 'する', reading: 'します', pos: '動詞', jlpt_level: 5, hsk_level: null, pinyin: null },
  食べる: { dictionary_form: '食べる', reading: 'たべる', pos: '動詞', jlpt_level: 5, hsk_level: null, pinyin: null },
  難しい: { dictionary_form: '難しい', reading: 'むずかしい', pos: '形容詞', jlpt_level: 4, hsk_level: null, pinyin: null },
  '。': { dictionary_form: '。', reading: '。', pos: '記号', jlpt_level: null, hsk_level: null, pinyin: null },
};

export const cnLexicon: Record<string, LexiconEntry> = {
  我: { dictionary_form: '我', reading: null, pos: 'pronoun', jlpt_level: null, hsk_level: 1, pinyin: 'wǒ' },
  每天: { dictionary_form: '每天', reading: null, pos: 'adverb', jlpt_level: null, hsk_level: 2, pinyin: 'měi tiān' },
  在: { dictionary_form: '在', reading: null, pos: 'preposition', jlpt_level: null, hsk_level: 1, pinyin: 'zài' },
  图书馆: { dictionary_form: '图书馆', reading: null, pos: 'noun', jlpt_level: null, hsk_level: 3, pinyin: 'tú shū guǎn' },
  学习: { dictionary_form: '学习', reading: null, pos: 'verb', jlpt_level: null, hsk_level: 1, pinyin: 'xué xí' },
  中文: { dictionary_form: '中文', reading: null, pos: 'noun', jlpt_level: null, hsk_level: 2, pinyin: 'zhōng wén' },
  你好: { dictionary_form: '你好', reading: null, pos: 'phrase', jlpt_level: null, hsk_level: 1, pinyin: 'nǐ hǎo' },
  谢谢: { dictionary_form: '谢谢', reading: null, pos: 'phrase', jlpt_level: null, hsk_level: 1, pinyin: 'xiè xie' },
  经济: { dictionary_form: '经济', reading: null, pos: 'noun', jlpt_level: null, hsk_level: 4, pinyin: 'jīng jì' },
  '。': { dictionary_form: '。', reading: null, pos: 'punctuation', jlpt_level: null, hsk_level: null, pinyin: null },
};
