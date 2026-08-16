import { type BackendReviewCard, type ReviewStats } from '@/features/Review/api/types';
import { type Grade } from '@/features/Review/constants';
import {
  type BackendHistoryItem,
  type BackendWord,
  seedHistory,
  seedReviewCards,
  seedVocabulary,
} from './fixtures';

/**
 * The mock backend's in-memory store. Seeded from fixtures (deep-cloned so
 * mutations never touch the fixture objects) and mutated by POST/PATCH/DELETE.
 * State lives for the lifetime of the dev server — restarting resets it.
 */
const vocabulary: BackendWord[] = structuredClone(seedVocabulary);
const history: BackendHistoryItem[] = structuredClone(seedHistory);
const reviewCards: BackendReviewCard[] = structuredClone(seedReviewCards);

// ── Vocabulary ────────────────────────────────────────────────────────────────

type NewWordPayload = {
  language?: 'jp' | 'cn';
  expression: string;
  reading: string;
  meaning: string;
  jlpt_level: number | null;
  hsk_level: number | null;
  status?: string;
};

export const db = {
  listVocabulary: (): BackendWord[] => vocabulary,

  /** Returns the created row, or `null` when the expression is already saved (→ 409). */
  addVocabulary: (payload: NewWordPayload): BackendWord | null => {
    if (vocabulary.some((w) => w.expression === payload.expression)) return null;
    const word: BackendWord = {
      id: crypto.randomUUID(),
      language: payload.language ?? 'jp',
      expression: payload.expression,
      reading: payload.reading,
      meaning: payload.meaning,
      jlpt_level: payload.jlpt_level,
      hsk_level: payload.hsk_level,
      status: payload.status ?? 'new',
      added_at: new Date().toISOString(),
      suspended: false,
    };
    vocabulary.unshift(word);
    return word;
  },

  deleteVocabulary: (id: string): void => {
    const i = vocabulary.findIndex((w) => w.id === id);
    if (i !== -1) vocabulary.splice(i, 1);
  },

  setVocabularyStatus: (id: string, status: string): BackendWord | null => {
    const word = vocabulary.find((w) => w.id === id);
    if (!word) return null;
    word.status = status;
    return word;
  },

  // ── History ───────────────────────────────────────────────────────────────

  listHistory: (language: string | null, limit: number | null): BackendHistoryItem[] => {
    let items = language ? history.filter((h) => h.language === language) : history;
    items = [...items].sort((a, b) => b.created_at.localeCompare(a.created_at));
    return limit ? items.slice(0, limit) : items;
  },

  addHistory: (payload: {
    language: 'jp' | 'cn';
    query: string;
    query_type: string;
  }): BackendHistoryItem => {
    // De-dupe by query within a language — most-recent wins.
    const existing = history.findIndex(
      (h) => h.language === payload.language && h.query === payload.query,
    );
    if (existing !== -1) history.splice(existing, 1);
    const item: BackendHistoryItem = {
      id: crypto.randomUUID(),
      language: payload.language,
      query: payload.query,
      query_type: payload.query_type,
      created_at: new Date().toISOString(),
    };
    history.unshift(item);
    return item;
  },

  deleteHistory: (id: string): void => {
    const i = history.findIndex((h) => h.id === id);
    if (i !== -1) history.splice(i, 1);
  },

  clearHistory: (): void => {
    history.length = 0;
  },

  // ── Review (SRS) ────────────────────────────────────────────────────────────

  /** Studyable cards now: not suspended, and either never-seen (new) or past due. */
  reviewQueue: (language: string | null, limit: number | null): BackendReviewCard[] => {
    const now = Date.now();
    let cards = reviewCards.filter((c) => {
      if (c.suspended) return false;
      if (language && c.language !== language) return false;
      const isNew = c.repetitions === 0;
      const isDue = c.due_at !== null && new Date(c.due_at).getTime() <= now;
      return isNew || isDue;
    });
    cards = [...cards].sort((a, b) => a.repetitions - b.repetitions);
    return limit ? cards.slice(0, limit) : cards;
  },

  /** Non-overlapping partition mirroring the backend's dashboard counts. */
  reviewStats: (language: string | null): ReviewStats => {
    const now = Date.now();
    const cards = language ? reviewCards.filter((c) => c.language === language) : reviewCards;
    const stats: ReviewStats = { new: 0, due: 0, learned: 0, suspended: 0, decks: [] };
    for (const c of cards) {
      if (c.suspended) stats.suspended += 1;
      else if (c.repetitions === 0) stats.new += 1;
      else if (c.due_at !== null && new Date(c.due_at).getTime() <= now) stats.due += 1;
      else stats.learned += 1;
    }
    return stats;
  },

  /** Apply a grade: reschedule from the card's projected intervals. Returns the new schedule. */
  gradeReviewCard: (id: string, grade: Grade) => {
    const card = reviewCards.find((c) => c.id === id);
    if (!card) return null;
    const seconds = card.projected_intervals[grade] ?? 86_400;
    const dueAt = new Date(Date.now() + seconds * 1000).toISOString();
    card.due_at = dueAt;
    card.last_reviewed_at = new Date().toISOString();
    card.repetitions += 1;
    if (grade === 'again') {
      card.lapses += 1;
      card.ease_factor = Math.max(1.3, card.ease_factor - 0.2);
    } else if (grade === 'easy') {
      card.ease_factor += 0.15;
    }
    card.interval_days = seconds / 86_400;
    card.status = card.interval_days >= 21 ? 'known' : 'learning';
    return {
      due_at: dueAt,
      interval_days: card.interval_days,
      repetitions: card.repetitions,
      ease_factor: card.ease_factor,
    };
  },

  setReviewSuspended: (id: string, suspended: boolean): BackendReviewCard | null => {
    const card = reviewCards.find((c) => c.id === id);
    if (!card) return null;
    card.suspended = suspended;
    return card;
  },
};
