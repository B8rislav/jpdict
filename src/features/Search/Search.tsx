'use client';

import { FC, useEffect, useMemo, useState } from 'react';

import { SearchView } from './ui/SearchView';
import { fetchWordsFx } from '../WordCard';
import { fetchKanjiFx } from '../KanjiCard/model';
import { fetchSentenceFx } from '../Sentence';
import { useUnit } from 'effector-react';
import { $userProfile } from '@/stores/userProfile';
import { $isAuthenticated } from '@/stores/auth';
import { resetSearchResults } from './model';
import {
  $searchHistory,
  addHistoryFx,
  removeHistoryFx,
  clearHistoryFx,
  loadHistoryFx,
} from '@/features/SearchHistory';
import { classifySearchQuery, type SearchQueryType } from './utils';
import { t } from '@/shared/i18n';

export const Search: FC = () => {
  const [value, setValue] = useState('');
  const [manualQueryType, setManualQueryType] = useState<SearchQueryType | null>(null);
  const [autoQueryType, setAutoQueryType] = useState<SearchQueryType>('word');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedLanguage = useUnit($userProfile).selectedLanguage;
  const historyEntries = useUnit($searchHistory);
  const isAuthenticated = useUnit($isAuthenticated);

  useEffect(() => {
    if (selectedLanguage && isAuthenticated) loadHistoryFx(selectedLanguage);
  }, [selectedLanguage, isAuthenticated]);

  const queryType = manualQueryType ?? autoQueryType;
  const placeholder = selectedLanguage === 'jp'
    ? t('ui', 'search_placeholder_jp')
    : selectedLanguage === 'cn'
    ? t('ui', 'search_placeholder_cn')
    : 'Выберите язык для поиска';

  const typedHint = useMemo(() => {
    if (!value.trim()) {
      return t('ui', 'search_hint_empty');
    }
    if (queryType === 'kanji') return t('ui', 'search_hint_kanji');
    if (queryType === 'sentence') return t('ui', 'search_hint_sentence');
    return t('ui', 'search_hint_word');
  }, [queryType, value]);

  const queryTypeLabel = useMemo(() => {
    switch (queryType) {
      case 'kanji': return t('ui', 'query_type_kanji');
      case 'sentence': return t('ui', 'query_type_sentence');
      default: return t('ui', 'query_type_word');
    }
  }, [queryType]);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setAutoQueryType(classifySearchQuery(value, selectedLanguage));
    }, 300);
    return () => window.clearTimeout(handler);
  }, [value, selectedLanguage]);

  useEffect(() => {
    setManualQueryType(null);
  }, [selectedLanguage]);

  const handleInputChange = (text: string) => {
    setValue(text);
    setManualQueryType(null);
  };

  const executeSearch = async (query: string, type: SearchQueryType) => {
    if (!query.trim() || !selectedLanguage || isSubmitting) return;

    addHistoryFx({ language: selectedLanguage, query: query.trim(), query_type: type });
    setIsSubmitting(true);

    try {
      resetSearchResults();
      if (type === 'kanji') {
        await fetchKanjiFx({ value: query, language: selectedLanguage });
      } else if (type === 'sentence') {
        await fetchSentenceFx({ value: query, language: selectedLanguage });
      } else {
        await fetchWordsFx({ value: query, language: selectedLanguage });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setIsSubmitting(false), 400);
    }
  };

  const onButtonClick = async () => {
    const trimmed = value.trim();
    if (!trimmed || !selectedLanguage || isSubmitting) return;
    await executeSearch(trimmed, queryType);
  };

  const handleSelectHistoryEntry = async (entry: string) => {
    setValue(entry);
    const type = classifySearchQuery(entry, selectedLanguage);
    setManualQueryType(type);
    await executeSearch(entry, type);
  };

  return (
    <SearchView
      inputValue={value}
      setInputValue={handleInputChange}
      onButtonClick={onButtonClick}
      placeholder={placeholder}
      hintText={typedHint}
      isSubmitting={isSubmitting}
      queryTypeLabel={queryTypeLabel}
      queryType={queryType}
      onSetQueryType={setManualQueryType}
      historyEntries={historyEntries}
      onSelectHistoryEntry={handleSelectHistoryEntry}
      onDeleteHistoryEntry={(id) => removeHistoryFx(id)}
      onClearHistory={() => clearHistoryFx()}
    />
  );
};
