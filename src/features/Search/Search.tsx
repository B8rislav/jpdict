'use client';

import { FC, useEffect, useMemo, useState } from 'react';

import { SearchView } from './ui/SearchView';
import { fetchWordsFx, clearWords } from '../WordCard';
import { fetchKanjiFx, clearKanji } from '../KanjiCard/model';
import { fetchSentenceFx, clearSentences } from '../Sentence';
import { useUnit } from 'effector-react';
import { $userProfile } from '@/stores/userProfile';
import { clearInspectedWord } from '@/features/WordInspector';
import { classifySearchQuery, type SearchQueryType } from './utils';
import ruTranslations from '@/shared/i18n/ru.json';

const getTranslation = (category: keyof typeof ruTranslations, key: string) => {
  return (ruTranslations[category] as Record<string, string>)?.[key] || key;
};

export const Search: FC = () => {
  const [value, setValue] = useState('');
  const [manualQueryType, setManualQueryType] = useState<SearchQueryType | null>(null);
  const [autoQueryType, setAutoQueryType] = useState<SearchQueryType>('word');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedLanguage = useUnit($userProfile).selectedLanguage;

  const queryType = manualQueryType ?? autoQueryType;
  const placeholder = selectedLanguage === 'jp'
    ? getTranslation('ui', 'search_placeholder_jp')
    : selectedLanguage === 'cn'
    ? getTranslation('ui', 'search_placeholder_cn')
    : 'Выберите язык для поиска';

  const typedHint = useMemo(() => {
    if (!value.trim()) {
      return getTranslation('ui', 'search_hint_empty');
    }

    if (queryType === 'kanji') {
      return getTranslation('ui', 'search_hint_kanji');
    }

    if (queryType === 'sentence') {
      return getTranslation('ui', 'search_hint_sentence');
    }

    return getTranslation('ui', 'search_hint_word');
  }, [queryType, value]);

  const queryTypeLabel = useMemo(() => {
    switch (queryType) {
      case 'kanji':
        return getTranslation('ui', 'query_type_kanji');
      case 'sentence':
        return getTranslation('ui', 'query_type_sentence');
      default:
        return getTranslation('ui', 'query_type_word');
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

  const isReadyToSearch = value.trim().length > 0 && !!selectedLanguage && !isSubmitting;

  const onButtonClick = async () => {
    const trimmedValue = value.trim();
    if (!isReadyToSearch || !trimmedValue) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (queryType === 'kanji') {
        clearWords();
        clearSentences();
        clearInspectedWord();
        await fetchKanjiFx({ value: trimmedValue, language: selectedLanguage });
      } else if (queryType === 'sentence') {
        clearWords();
        clearKanji();
        clearInspectedWord();
        await fetchSentenceFx({ value: trimmedValue, language: selectedLanguage });
      } else {
        clearSentences();
        await fetchWordsFx({ value: trimmedValue, language: selectedLanguage });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setIsSubmitting(false), 400);
    }
  };

  const handleSetQueryType = (type: SearchQueryType) => {
    setManualQueryType(type);
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
      onSetQueryType={handleSetQueryType}
    />
  );
};
