'use client';

import { useUnit } from 'effector-react';
import { type FC, useEffect, useMemo, useState } from 'react';

import {
  $searchHistory,
  addHistoryFx,
  clearHistoryFx,
  loadHistoryFx,
} from '@/features/SearchHistory';
import { t } from '@/shared/i18n';
import { $isAuthenticated } from '@/stores/auth';
import { $userProfile } from '@/stores/userProfile';

import { fetchKanjiFx } from '../KanjiCard/model';
import { fetchSentenceFx } from '../Sentence';
import { fetchWordsFx } from '../WordCard';
import { QUERY_TYPE_DEBOUNCE_MS, SUBMIT_RESET_DELAY_MS } from './constants';
import { resetSearchResults } from './model';
import { $suggestions, clearSuggestions, fetchSuggestFx } from './model/suggest';
import { historyToItem, suggestionToItem } from './optionMapping';
import { SearchView } from './ui/SearchView';
import { classifySearchQuery, type SearchQueryType } from './utils';

export const Search: FC = () => {
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedLanguage = useUnit($userProfile).selectedLanguage;
  const isAuthenticated = useUnit($isAuthenticated);
  const historyEntries = useUnit($searchHistory);
  const suggestions = useUnit($suggestions);

  useEffect(() => {
    if (selectedLanguage && isAuthenticated) loadHistoryFx(selectedLanguage);
  }, [selectedLanguage, isAuthenticated]);

  const placeholder =
    selectedLanguage === 'jp'
      ? t('ui', 'search_placeholder_jp')
      : selectedLanguage === 'cn'
        ? t('ui', 'search_placeholder_cn')
        : t('ui', 'search_no_language');

  // Debounced parse-option lookup while typing; empty input clears them.
  useEffect(() => {
    const query = value.trim();
    if (!query || !selectedLanguage) {
      clearSuggestions();
      return;
    }
    const handler = window.setTimeout(() => {
      fetchSuggestFx({ query, language: selectedLanguage });
    }, QUERY_TYPE_DEBOUNCE_MS);
    return () => window.clearTimeout(handler);
  }, [value, selectedLanguage]);

  const showHistory = value.trim() === '';
  const historyItems = useMemo(() => historyEntries.map(historyToItem), [historyEntries]);
  const suggestionItems = useMemo(() => suggestions.map(suggestionToItem), [suggestions]);
  const options = showHistory ? historyItems : suggestionItems;
  const mode = showHistory ? 'history' : 'suggest';

  const executeSearch = async (query: string, type: SearchQueryType) => {
    const trimmed = query.trim();
    if (!trimmed || !selectedLanguage || isSubmitting) return;

    addHistoryFx({ language: selectedLanguage, query: trimmed, query_type: type });
    setIsSubmitting(true);
    try {
      resetSearchResults();
      if (type === 'kanji') {
        await fetchKanjiFx({ value: trimmed, language: selectedLanguage });
      } else if (type === 'sentence') {
        await fetchSentenceFx({ value: trimmed, language: selectedLanguage });
      } else {
        await fetchWordsFx({ value: trimmed, language: selectedLanguage });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setIsSubmitting(false), SUBMIT_RESET_DELAY_MS);
    }
  };

  // Button / Enter with no highlighted option — classify the raw query.
  const handleSubmitRaw = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed || !selectedLanguage) return;
    executeSearch(trimmed, classifySearchQuery(trimmed, selectedLanguage));
  };

  // A chosen parse variant or history entry — run exactly what it points at.
  const handleSelectOption = (id: string) => {
    const suggestion = suggestions.find((option) => option.id === id);
    if (suggestion) {
      setValue(suggestion.text);
      executeSearch(suggestion.text, suggestion.query_type);
      return;
    }
    const entry = historyEntries.find((item) => item.id === id);
    if (entry && selectedLanguage) {
      setValue(entry.query);
      executeSearch(
        entry.query,
        entry.query_type ?? classifySearchQuery(entry.query, selectedLanguage),
      );
    }
  };

  return (
    <SearchView
      inputValue={value}
      onValueChange={setValue}
      onSubmit={handleSubmitRaw}
      onSelectOption={handleSelectOption}
      onClearHistory={() => clearHistoryFx()}
      options={options}
      mode={mode}
      placeholder={placeholder}
      isSubmitting={isSubmitting}
    />
  );
};
