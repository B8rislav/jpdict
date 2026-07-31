'use client';

import { useUnit } from 'effector-react';
import { type FC, useEffect, useMemo, useState } from 'react';

import { $searchHistory, clearHistoryFx, loadHistoryFx } from '@/features/SearchHistory';
import { useT } from '@/shared/i18n';
import { $isAuthenticated } from '@/stores/auth';
import { setShowFurigana, setShowPinyin } from '@/stores/userProfile';

import { SUBMIT_RESET_DELAY_MS } from './constants';
import { runSearch } from './model/runSearch';
import { $suggestions } from './model/suggest';
import { useSuggestionQuery } from './model/useSuggestionQuery';
import { historyToItem, suggestionToItem } from './optionMapping';
import { SearchView } from './ui/SearchView';
import { classifySearchQuery, type SearchQueryType } from './utils';
import { useProfile } from '@/shared/profile/context';

export const Search: FC = () => {
  const t = useT();
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { selectedLanguage, showFurigana, showPinyin } = useProfile();
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

  // The reading toggle moved here from the nav — it belongs beside the query it affects.
  // Which reading it controls follows the study language; with none chosen, there is none.
  const reading =
    selectedLanguage === 'jp'
      ? { label: t('ui', 'furigana'), checked: showFurigana, onChange: setShowFurigana }
      : selectedLanguage === 'cn'
        ? { label: t('ui', 'pinyin_label'), checked: showPinyin, onChange: setShowPinyin }
        : undefined;

  useSuggestionQuery(value, selectedLanguage);

  const showHistory = value.trim() === '';
  const historyItems = useMemo(
    () => historyEntries.map((entry) => historyToItem(entry, t)),
    [historyEntries, t],
  );
  const suggestionItems = useMemo(
    () => suggestions.map((suggestion) => suggestionToItem(suggestion, t)),
    [suggestions, t],
  );
  const options = showHistory ? historyItems : suggestionItems;
  const mode = showHistory ? 'history' : 'suggest';

  const executeSearch = async (query: string, type: SearchQueryType) => {
    const trimmed = query.trim();
    if (!trimmed || !selectedLanguage || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await runSearch(trimmed, type, selectedLanguage);
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
      eyebrow={t('ui', selectedLanguage === 'cn' ? 'band_eyebrow_cn' : 'band_eyebrow_jp')}
      reading={reading}
    />
  );
};
