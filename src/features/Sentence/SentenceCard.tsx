import { Card } from '@/shared/ui/Card';
import { FuriganaText } from '@/shared/ui/FuriganaText/FuriganaText';
import { Label, Text } from '@gravity-ui/uikit';
import { CSSProperties, FC, ReactElement, useState } from 'react';
import { List, RowComponentProps } from 'react-window';
import { fetchWordsFx, clearWords } from '../WordCard';
import { clearKanji } from '../KanjiCard/model';
import { SentenceResult, SentenceToken } from './model';
import { fetchAIOverview } from './api/fetchAIOverview';
import { AIOverviewAccordion } from './ui/AIOverviewAccordion';
import ruTranslations from '@/shared/i18n/ru.json';
import { useUnit } from 'effector-react';
import { $userProfile } from '@/stores/userProfile';

import styles from './SentenceCard.module.css';

const ITEM_SIZE = 110; // card (~94px) + gap (16px)
const MAX_VISIBLE_ITEMS = 8;

const getTranslation = (category: keyof typeof ruTranslations, key: string) => {
  return (ruTranslations[category] as Record<string, string>)?.[key] || key;
};

const getPosColorClass = (pos: string, language: 'jp' | 'cn' | null): string => {
  if (language === 'cn') {
    if (pos === 'r' || pos === 'rr' || pos === 'rz' || pos === 'rg') return styles.pronoun;
    if (pos.startsWith('v')) return styles.verb;
    if (pos.startsWith('n')) return styles.noun;
    if (pos === 'a' || pos === 'ad' || pos === 'an' || pos === 'ag' || pos === 'b') return styles.adjective;
    if (pos === 'd' || pos === 'dg' || pos === 'df' || pos === 'z' || pos === 'zg') return styles.adverb;
    if (pos === 'p' || pos.startsWith('u') || pos === 'y') return styles.particle;
    if (pos === 'c') return styles.auxiliary;
    return styles.other;
  }
  switch (pos) {
    case '助詞': return styles.particle;
    case '名詞': return styles.noun;
    case '動詞': return styles.verb;
    case '形容詞': return styles.adjective;
    case '助動詞': return styles.auxiliary;
    case '副詞': return styles.adverb;
    default: return styles.other;
  }
};

type TokenRowProps = {
  tokens: SentenceToken[];
  selectedTokenIndex: number | null;
  setSelectedTokenIndex: (i: number | null) => void;
  selectedLanguage: 'jp' | 'cn' | null;
  showFurigana: boolean;
  showPinyin: boolean;
  getPosClass: (pos: string) => string;
  onTokenClick: (token: SentenceToken, index: number) => void;
};

const TokenRow = ({
  ariaAttributes,
  index,
  style,
  tokens,
  selectedTokenIndex,
  setSelectedTokenIndex,
  selectedLanguage,
  showFurigana,
  showPinyin,
  getPosClass,
  onTokenClick,
}: RowComponentProps<TokenRowProps>): ReactElement | null => {
  const token = tokens[index];
  const wrapperStyle: CSSProperties = { ...style, paddingBottom: 16, boxSizing: 'border-box' };

  return (
    <div style={wrapperStyle} {...ariaAttributes}>
      <div
        className={`${styles.token} ${getPosClass(token.pos)} ${
          selectedTokenIndex === index ? styles.selected : ''
        }`}
        style={{ height: '100%', boxSizing: 'border-box' }}
        onMouseEnter={() => setSelectedTokenIndex(index)}
        onMouseLeave={() => setSelectedTokenIndex(null)}
        onClick={() => {
          setSelectedTokenIndex(selectedTokenIndex === index ? null : index);
          onTokenClick(token, index);
        }}
      >
        <div className={styles.tokenContent}>
          <span className={`${styles.marker} ${getPosClass(token.pos)}`} />
          <div className={styles.surface}>
            <Text variant="subheader-3">
              <FuriganaText
                surface={token.surface_form}
                reading={token.reading}
                show={selectedLanguage === 'jp' ? showFurigana : showPinyin}
              />
            </Text>
          </div>
        </div>
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <Text variant="caption-1">{getTranslation('fields', 'pos')}</Text>
            <Label>{getTranslation('pos', token.pos)}</Label>
          </div>
          {token.pos_detail_1 && (
            <div className={styles.metaItem}>
              <Text variant="caption-1">{getTranslation('fields', 'pos_detail_1')}</Text>
              <Text variant="body-3">{getTranslation('pos_detail_1', token.pos_detail_1)}</Text>
            </div>
          )}
          {token.conjugated_form && (
            <div className={styles.metaItem}>
              <Text variant="caption-1">{getTranslation('fields', 'conjugated_form')}</Text>
              <Text variant="body-3">{token.conjugated_form}</Text>
            </div>
          )}
          {token.reading && (
            <div className={styles.metaItem}>
              <Text variant="caption-1">{getTranslation('fields', 'reading')}</Text>
              <Text variant="body-3">{token.reading}</Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

type SentenceCardProps = SentenceResult;

export const SentenceCard: FC<SentenceCardProps> = ({ sentence, tokens }) => {
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null);
  const { selectedLanguage, showFurigana, showPinyin } = useUnit($userProfile);

  const handleFetchOverview = (onChunk: (chunk: string) => void): Promise<void> => {
    return fetchAIOverview(sentence, tokens, onChunk);
  };

  const handleTokenClick = (token: SentenceToken, index: number) => {
    const query = token.basic_form || token.surface_form;
    if (query) {
      clearWords();
      clearKanji();
      fetchWordsFx({ value: query, language: selectedLanguage }).catch((error) => {
        console.error(`Failed to fetch word info for ${query}:`, error);
      });
    }
  };

  const listHeight = Math.min(tokens.length, MAX_VISIBLE_ITEMS) * ITEM_SIZE;

  return (
    <>
      <Card className={styles.sentenceCard}>
        <div className={styles.header}>
          <Text variant="display-4">{getTranslation('ui', 'sentence_title')}</Text>
          <Text variant="body-2">{sentence}</Text>
        </div>
        <List
          rowCount={tokens.length}
          rowHeight={ITEM_SIZE}
          rowComponent={TokenRow}
          rowProps={{
            tokens,
            selectedTokenIndex,
            setSelectedTokenIndex,
            selectedLanguage,
            showFurigana,
            showPinyin,
            getPosClass: (pos: string) => getPosColorClass(pos, selectedLanguage),
            onTokenClick: handleTokenClick,
          }}
          style={{ height: listHeight }}
        />
      </Card>
      <Card className={styles.aiCard}>
        <AIOverviewAccordion
          sentence={sentence}
          tokens={tokens}
          onFetchOverview={handleFetchOverview}
        />
      </Card>
    </>
  );
};
