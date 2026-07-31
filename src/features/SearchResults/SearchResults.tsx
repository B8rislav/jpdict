'use client';

import { EntryList } from 'designoslav';
import { useUnit } from 'effector-react';
import { type FC, useMemo } from 'react';

import { $kanji, fetchKanjiFx } from '@/features/KanjiCard/model';
import { KanjiCard } from '@/features/KanjiCard/KanjiCard';
import { runSearch } from '@/features/Search/model/runSearch';
import { classifySearchQuery } from '@/features/Search/utils';
import { $sentences, fetchSentenceFx, SentenceCard } from '@/features/Sentence';
import { $words, fetchWordsFx } from '@/features/WordCard';
import { wordEntryId, wordToEntry } from '@/features/WordCard/lib/wordToEntry';
import { $inspectedWord, inspectWord, WordInspector } from '@/features/WordInspector';
import { useT } from '@/shared/i18n';
import { useProfile } from '@/shared/profile/context';
import { useExamples } from './lib/useExamples';
import { EmptyState } from './ui/EmptyState';
import { SearchResultsView } from './ui/SearchResultsView';

/**
 * Chooses what the results area shows. The search classifier picks one of three lookups
 * and each fills the shell differently, so the mode is derived from which store landed
 * results rather than tracked separately — one less thing to keep in sync.
 *
 * Sentence wins over word because clicking a token in a breakdown also populates `$words`.
 */
export const SearchResults: FC = () => {
  const t = useT();
  const { selectedLanguage, showFurigana, showPinyin } = useProfile();
  const [sentences, words, kanji, inspectedWord] = useUnit([
    $sentences,
    $words,
    $kanji,
    $inspectedWord,
  ]);
  const [sentencePending, wordsPending, kanjiPending] = useUnit([
    fetchSentenceFx.pending,
    fetchWordsFx.pending,
    fetchKanjiFx.pending,
  ]);
  const examples = useExamples();

  const showReading = selectedLanguage === 'cn' ? showPinyin : showFurigana;

  /**
   * A pending *word* is not a pending *page*. Clicking a token in a breakdown — including
   * the automatic first selection — fetches a word, and if that were allowed to blank the
   * results area it would unmount the breakdown, whose remount fires the same fetch again.
   * That loop ran until the backend answered 429. So the full-page skeleton is reserved
   * for the case where there is genuinely nothing to show yet.
   */
  const hasResults = sentences.length > 0 || words.length > 0 || kanji.length > 0;
  const isPending = sentencePending || wordsPending || kanjiPending;
  const showPageSkeleton = isPending && !hasResults;

  const wordItems = useMemo(
    () => words.map((word, index) => wordToEntry(word, index, showReading)),
    [words, showReading],
  );

  const detail = inspectedWord ? <WordInspector word={inspectedWord} /> : null;

  if (sentences.length > 0) {
    return (
      <SearchResultsView
        results={<SentenceCard {...sentences[0]} />}
        detail={detail}
        detailLoading={wordsPending}
      />
    );
  }

  if (kanji.length > 0 && words.length === 0) {
    return <SearchResultsView layout="single" detail={<KanjiCard {...kanji[0]} />} />;
  }

  if (words.length > 0) {
    return (
      <SearchResultsView
        detailLoading={wordsPending}
        results={
          <EntryList
            aria-label={t('ui', 'results_words_title')}
            items={wordItems}
            selectedId={
              inspectedWord ? wordEntryId(inspectedWord, words.indexOf(inspectedWord)) : undefined
            }
            onSelect={(id) => {
              const picked = words.find((word, index) => wordEntryId(word, index) === id);
              if (picked) inspectWord(picked);
            }}
          />
        }
        detail={detail}
      />
    );
  }

  if (showPageSkeleton) return <SearchResultsView loading />;

  return (
    <EmptyState
      examples={examples}
      onRun={(query) => {
        if (!selectedLanguage) return;
        runSearch(query, classifySearchQuery(query, selectedLanguage), selectedLanguage);
      }}
    />
  );
};
