'use client';

import { useUnit } from 'effector-react';
import { useRouter } from 'next/navigation';
import { useEffect, type FC } from 'react';

import { type CardType, type SavedWord } from '@/shared/api/types';
import { useProfile } from '@/shared/profile/context';
import { useSpeech } from '@/shared/speech/useSpeech';
import { nextStatus } from './constants';
import {
  $deckSummaries,
  $items,
  $total,
  fetchDeckSummariesFx,
  loadPageFx,
  nextPageRequested,
  queryChanged,
  removeWordFx,
  updateStatusFx,
} from './model';
import { ALL } from './model/query';
import { useDictionaryFilters } from './model/useDictionaryFilters';
import { DeckSwitcherView } from './ui/DeckSwitcherView';
import { DictionaryFiltersView } from './ui/DictionaryFiltersView';
import { DictionaryPanelView } from './ui/DictionaryPanelView';

export const DictionaryPanel: FC = () => {
  const router = useRouter();
  const { selectedLanguage } = useProfile();
  // Profile hydration can leave this null for a tick; the backend default matches.
  const language = selectedLanguage ?? 'jp';
  const { query, setQuery } = useDictionaryFilters();
  const [items, total, decks, loading] = useUnit([
    $items,
    $total,
    $deckSummaries,
    loadPageFx.pending,
  ]);
  const { speak, supported } = useSpeech(language);

  // The query *is* the view, so one effect covers deck, filters, search and language.
  useEffect(() => {
    queryChanged(query);
  }, [query, language]);

  useEffect(() => {
    fetchDeckSummariesFx();
  }, [language]);

  const unfiltered = !query.q && query.level === ALL && query.status === ALL;

  return (
    <>
      <DeckSwitcherView
        decks={decks}
        openDeck={query.deck}
        onOpenDeck={(deck: CardType) => setQuery({ deck })}
        onStudy={(deck: CardType) => router.push(`/study?deck=${deck}`)}
      />
      <DictionaryFiltersView
        deck={query.deck}
        language={language}
        level={query.level}
        status={query.status}
        q={query.q}
        shown={total}
        onLevelChange={(level) => setQuery({ level })}
        onStatusChange={(status) => setQuery({ status })}
        onQueryChange={(q) => setQuery({ q })}
      />
      <DictionaryPanelView
        deck={query.deck}
        items={items}
        total={total}
        loading={loading}
        emptyCollection={total === 0 && unfiltered}
        canSpeak={supported}
        onSpeak={(word: SavedWord) => speak(word.hiragana_full ?? word.kanji_full ?? '')}
        onDelete={(word: SavedWord) => word.id && removeWordFx(word.id)}
        onAdvanceStatus={(word: SavedWord) =>
          word.id && updateStatusFx({ id: word.id, status: nextStatus(word.status) })
        }
        onEndReached={() => nextPageRequested(query)}
      />
    </>
  );
};
