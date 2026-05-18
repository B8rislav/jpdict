'use client';

import { Button, TextInput } from '@gravity-ui/uikit';
import { type FC, type MouseEventHandler, useRef } from 'react';

import styles from './SearchView.module.css';
import ruTranslations from '@/shared/i18n/ru.json';

const getTranslation = (category: keyof typeof ruTranslations, key: string) => {
  return (ruTranslations[category] as Record<string, string>)?.[key] || key;
};

type QueryType = 'kanji' | 'word' | 'sentence';

type SearchViewProps = {
  inputValue: string;
  setInputValue: (value: string) => void;
  onButtonClick: MouseEventHandler;
  placeholder?: string;
  hintText?: string;
  isSubmitting?: boolean;
  queryType?: QueryType;
  queryTypeLabel?: string;
  onSetQueryType?: (type: QueryType) => void;
};

export const SearchView: FC<SearchViewProps> = (props) => {
  const {
    inputValue,
    setInputValue,
    onButtonClick,
    placeholder,
    hintText,
    isSubmitting,
    queryType,
    queryTypeLabel,
    onSetQueryType,
  } = props;
  const button = useRef<HTMLButtonElement>(null);

  return (
    <div className={styles.searchRoot}>
      <div className={styles.searchPanel}>
        <div className={styles.inputWrapper}>
          <TextInput
            type="search"
            value={inputValue}
            placeholder={placeholder}
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                button.current?.click();
              }
            }}
          />
        </div>
        <Button
          view="action"
          ref={button}
          onClick={onButtonClick}
          disabled={isSubmitting || inputValue.trim().length === 0}
        >
          {isSubmitting ? getTranslation('ui', 'search_button_loading') : getTranslation('ui', 'search_button')}
        </Button>
      </div>

      <div className={styles.statusRow}>
        <span className={styles.hintText}>{hintText || 'Одиночный иероглиф, слово или предложение'}</span>
        {queryTypeLabel && <span className={styles.queryType}>{queryTypeLabel}</span>}
      </div>

      <div className={styles.tips}>
        {(['kanji', 'word', 'sentence'] as QueryType[]).map((type) => {
          const label = type === 'kanji'
            ? getTranslation('ui', 'query_type_kanji')
            : type === 'sentence'
            ? getTranslation('ui', 'query_type_sentence')
            : getTranslation('ui', 'query_type_word');

          return (
            <button
              key={type}
              type="button"
              className={`${styles.tipItem} ${queryType === type ? styles.activeTip : ''}`}
              onClick={() => onSetQueryType?.(type)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
