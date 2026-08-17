import {
  type BackendReviewActivity,
  type BackendReviewCard,
} from '@/features/Review/api/types';
import { type BackendDeckSummary, type BackendReviewStats } from '@/shared/api/mappers';
import { type CardType } from '@/shared/api/types';
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

const DAY_MS = 86_400_000;
/** Mirrors the backend's `users.daily_goal` server default. */
const DAILY_GOAL = 10;
/**
 * Reviews graded in this session — every grade, `again` included, since the heatmap
 * counts reviews rather than finished cards. Stands in for the backend's
 * `review_logs` rows so today's cell moves as you study under `npm run dev:mock`
 * instead of sitting frozen. `done_today` is *not* read from here: that counts cards
 * finished for today and is derived from card state, exactly as the backend does it.
 */
let gradedToday = 4;

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
  reviewStats: (language: string | null): BackendReviewStats => {
    const now = Date.now();
    const cards = language ? reviewCards.filter((c) => c.language === language) : reviewCards;
    // snake_case: these handlers stand in for the *backend*, and the BFF does the
    // camelCase translation. Returning `doneToday` here would silently map to 0.
    const stats: BackendReviewStats = {
      new: 0,
      due: 0,
      learned: 0,
      suspended: 0,
      decks: [],
      done_today: 0,
      daily_goal: DAILY_GOAL,
    };
    // Per-deck rows, mirroring the backend's GROUP BY card_type. Without these the
    // dictionary's deck cards render all-zero under `dev:mock`, which reads as a bug
    // in the page rather than as missing fixture data.
    const decks = new Map<string, BackendDeckSummary>();
    const deckFor = (cardType: string): BackendDeckSummary => {
      let deck = decks.get(cardType);
      if (!deck) {
        deck = { card_type: cardType as CardType, total: 0, due: 0, new_today: 0, done_today: 0 };
        decks.set(cardType, deck);
      }
      return deck;
    };
    for (const cardType of ['word', 'kanji']) deckFor(cardType);

    for (const c of cards) {
      const deck = deckFor(c.card_type);
      deck.total += 1;
      if (c.suspended) stats.suspended += 1;
      else if (c.repetitions === 0) {
        stats.new += 1;
        deck.new_today += 1;
      } else if (c.due_at !== null && new Date(c.due_at).getTime() <= now) {
        stats.due += 1;
        deck.due += 1;
      } else {
        stats.learned += 1;
        // "Finished for today" is exactly the card that's been reviewed and is now
        // scheduled beyond today — the same rule the backend applies.
        if (c.last_reviewed_at !== null) {
          deck.done_today += 1;
          stats.done_today = (stats.done_today ?? 0) + 1;
        }
      }
    }
    stats.decks = [...decks.values()];
    return stats;
  },

  /**
   * A plausible seven-week history ending today, so `npm run dev:mock` shows a
   * populated heatmap rather than an empty grid that looks like a bug.
   *
   * Generated relative to *today* (not a fixed date) so the last cell is always
   * today's, and Monday-aligned to match what the real endpoint returns.
   */
  reviewActivity: (weeks = 7): BackendReviewActivity => {
    const today = new Date();
    const midnight = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    // Back to the Monday starting the earliest requested week.
    const mondayOffset = (today.getDay() + 6) % 7;
    const start = midnight - (mondayOffset + (weeks - 1) * 7) * DAY_MS;

    const days: BackendReviewActivity['days'] = [];
    for (let time = start; time <= midnight; time += DAY_MS) {
      const index = Math.round((time - start) / DAY_MS);
      const weekday = index % 7;
      // Weekends lighter, one dead day a fortnight, otherwise a rising rhythm.
      const base = weekday >= 5 ? 3 : 9 + ((index * 7) % 17);
      const reviews = index % 13 === 4 ? 0 : base;
      days.push({
        date: new Date(time).toISOString().slice(0, 10),
        reviews,
        new: reviews === 0 ? 0 : Math.min(reviews, 2 + (index % 4)),
        // Older rows are untimed, mirroring reviews graded before elapsed tracking.
        seconds: reviews === 0 || index < 14 ? null : reviews * 45,
      });
    }

    const lastDay = days[days.length - 1];
    if (lastDay) lastDay.reviews = Math.max(lastDay.reviews, gradedToday);

    // Streak: walk back from today (or yesterday, if today is still empty).
    let streak = 0;
    for (let i = days.length - (lastDay && lastDay.reviews > 0 ? 1 : 2); i >= 0; i -= 1) {
      if ((days[i]?.reviews ?? 0) === 0) break;
      streak += 1;
    }

    return { days, streak };
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
    // Stands in for the backend's appended `review_logs` row.
    gradedToday += 1;
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
