import type { SearchOptionItem } from 'designoslav';

import type { HistoryItem } from '@/features/SearchHistory';
import type { SuggestKind, SuggestOption } from '@/shared/api/types';
import { t } from '@/shared/i18n';

type Unit = SuggestOption['unit'];

const unitLabel = (unit: Unit): string =>
  unit === 'kanji'
    ? t('ui', 'unit_label_kanji')
    : unit === 'phrase'
      ? t('ui', 'unit_label_phrase')
      : t('ui', 'unit_label_word');

const byMeaningHint = (option: SuggestOption): string =>
  option.gloss
    ? `${t('ui', 'suggest_hint_by_meaning')}: ${option.gloss}`
    : t('ui', 'suggest_hint_by_meaning');

/**
 * Compose each kind's visible hint from its enrichment (keeps UI copy in i18n).
 * Keyed by `kind` so adding a kind is a single map entry.
 */
const HINT_BY_KIND: Record<SuggestKind, (option: SuggestOption) => string | undefined> = {
  word: () => t('ui', 'suggest_hint_word'),
  verb: (option) => {
    const verb = t('ui', 'pos_verb').toLocaleLowerCase();
    return option.gloss ? `${option.gloss} · ${verb}` : verb;
  },
  kanji: (option) => [option.gloss, option.level].filter(Boolean).join(' · ') || undefined,
  phrase: () => t('ui', 'suggest_hint_sentence'),
  reverse_word: byMeaningHint,
  reverse_kanji: byMeaningHint,
};

/** A backend parse option → a designoslav SearchOptionList item. */
export const suggestionToItem = (option: SuggestOption): SearchOptionItem => ({
  id: option.id,
  unit: option.unit,
  text: option.text,
  hint: HINT_BY_KIND[option.kind](option),
  unitLabel: unitLabel(option.unit),
});

const historyUnit = (queryType: HistoryItem['query_type']): Unit =>
  queryType === 'kanji' ? 'kanji' : queryType === 'sentence' ? 'phrase' : 'word';

/** A recorded search-history entry → a designoslav SearchOptionList item. */
export const historyToItem = (entry: HistoryItem): SearchOptionItem => {
  const unit = historyUnit(entry.query_type);
  return {
    id: entry.id,
    unit,
    text: entry.query,
    unitLabel: unitLabel(unit),
  };
};
