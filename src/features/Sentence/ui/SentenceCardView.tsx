'use client';

import { FC, useState } from 'react';
import { Text } from '@gravity-ui/uikit';
import { List } from 'react-window';
import { SentenceToken } from '@/shared/api/types';
import { Card } from '@/shared/ui/Card';
import { t } from '@/shared/i18n';
import { getPosColorClass } from '../lib/posColor';
import { TokenRow, TokenRowProps } from './TokenRow';
import { AIOverviewAccordion } from './AIOverviewAccordion';
import styles from './SentenceCardView.module.css';

const ITEM_SIZE = 110;
const MAX_VISIBLE_ITEMS = 8;

type SentenceCardViewProps = {
  sentence: string;
  tokens: SentenceToken[];
  selectedLanguage: 'jp' | 'cn' | null;
  showFurigana: boolean;
  showPinyin: boolean;
  onTokenClick: (token: SentenceToken) => void;
  onFetchOverview: (onChunk: (chunk: string) => void) => Promise<void>;
};

export const SentenceCardView: FC<SentenceCardViewProps> = ({
  sentence,
  tokens,
  selectedLanguage,
  showFurigana,
  showPinyin,
  onTokenClick,
  onFetchOverview,
}) => {
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null);
  const listHeight = Math.min(tokens.length, MAX_VISIBLE_ITEMS) * ITEM_SIZE;

  const rowProps: TokenRowProps = {
    tokens,
    selectedTokenIndex,
    setSelectedTokenIndex,
    selectedLanguage,
    showFurigana,
    showPinyin,
    getPosClass: (pos) => getPosColorClass(pos, selectedLanguage, styles),
    onTokenClick: (token, index) => {
      setSelectedTokenIndex(selectedTokenIndex === index ? null : index);
      onTokenClick(token);
    },
  };

  return (
    <>
      <Card className={styles.sentenceCard}>
        <div className={styles.header}>
          <Text variant="display-4">{t('ui', 'sentence_title')}</Text>
          <Text variant="body-2">{sentence}</Text>
        </div>
        <List
          rowCount={tokens.length}
          rowHeight={ITEM_SIZE}
          rowComponent={TokenRow}
          rowProps={rowProps}
          style={{ height: listHeight }}
        />
      </Card>
      <Card className={styles.aiCard}>
        <AIOverviewAccordion
          sentence={sentence}
          tokens={tokens}
          onFetchOverview={onFetchOverview}
        />
      </Card>
    </>
  );
};
