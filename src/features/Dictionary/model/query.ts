import { parseLevelMarkers } from '@/shared/api/mappers/levels';
import { type CardType, type Language, type MasteryStatus } from '@/shared/api/types';

/**
 * The dictionary view is fully described by the URL: which deck is open, the level and
 * status filters, and the search text. That keeps it linkable and reload-stable, and
 * gives the paged store a single value to key off.
 */
export type DictionaryQuery = {
  deck: CardType;
  /** A level marker suffix (`N5`, `HSK 3`) or `all`. */
  level: string;
  /** A mastery status or `all`. */
  status: string;
  q: string;
};

/** The «Все» option — a real value rather than `null`, so ToggleGroup stays single-select. */
export const ALL = 'all';

export const DEFAULT_QUERY: DictionaryQuery = {
  deck: 'word',
  level: ALL,
  status: ALL,
  q: '',
};

const DECKS: CardType[] = ['word', 'kanji'];
const STATUSES: MasteryStatus[] = ['new', 'learning', 'known'];

/** Read the view out of the URL, falling back to defaults for anything absent or bogus. */
export function queryFromParams(params: URLSearchParams): DictionaryQuery {
  const deck = params.get('deck');
  const status = params.get('status');

  return {
    deck: DECKS.includes(deck as CardType) ? (deck as CardType) : DEFAULT_QUERY.deck,
    level: params.get('level') || ALL,
    status: STATUSES.includes(status as MasteryStatus) ? status! : ALL,
    q: params.get('q') ?? '',
  };
}

/** Serialise back to the URL, omitting defaults so the common case stays a clean path. */
export function queryToParams(query: DictionaryQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.deck !== DEFAULT_QUERY.deck) params.set('deck', query.deck);
  if (query.level !== ALL) params.set('level', query.level);
  if (query.status !== ALL) params.set('status', query.status);
  if (query.q) params.set('q', query.q);
  return params;
}

/**
 * Translate the view into backend filters. `level` is carried as a marker suffix
 * because that is what the UI shows; `parseLevelMarkers` turns it back into whichever
 * integer column the language uses, reusing the mapping the save path already relies on.
 */
export function queryToRequestParams(
  query: DictionaryQuery,
  language: Language,
  offset: number,
  limit: number,
): URLSearchParams {
  const params = new URLSearchParams({
    language,
    card_type: query.deck,
    limit: String(limit),
    offset: String(offset),
  });

  if (query.q) params.set('q', query.q);
  if (query.status !== ALL) params.set('status', query.status);

  if (query.level !== ALL) {
    const marker = query.level.startsWith('HSK') ? query.level : `JLPT ${query.level}`;
    const { jlpt_level: jlpt, hsk_level: hsk } = parseLevelMarkers([marker]);
    if (jlpt) params.set('jlpt_level', String(jlpt));
    if (hsk) params.set('hsk_level', String(hsk));
  }

  return params;
}
