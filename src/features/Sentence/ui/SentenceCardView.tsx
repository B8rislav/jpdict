'use client';

import { type CSSProperties, type FC, useRef, useState } from 'react';
import { Text } from '@gravity-ui/uikit';
import { List, useListRef } from 'react-window';
import { type SentenceToken } from '@/shared/api/types';
import { Card } from '@/shared/ui/Card';
import { t } from '@/shared/i18n';
import { getPosColorClass } from '../lib/posColor';
import { TokenRow, type TokenRowProps } from './TokenRow';
import { SentenceHighlight } from './SentenceHighlight';
import { AIOverviewAccordion } from './AIOverviewAccordion';
import styles from './SentenceCardView.module.css';
import { ITEM_SIZE, MAX_VISIBLE_ITEMS } from '../constants';

type PlainRowProps = {
  index: number;
  style: CSSProperties;
  ariaAttributes: Record<string, unknown>;
} & TokenRowProps;
const PlainTokenRow = TokenRow as unknown as FC<PlainRowProps>;

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
  const listRef = useListRef(null);
  const plainListRef = useRef<HTMLDivElement>(null);

  const needsVirtualization = tokens.length > MAX_VISIBLE_ITEMS;

  const scrollToTokenRow = (index: number) => {
    if (needsVirtualization) {
      listRef.current?.scrollToRow({ index, align: 'smart', behavior: 'smooth' });
    } else {
      plainListRef.current
        ?.querySelector<HTMLElement>(`[data-token-index="${index}"]`)
        ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  };

  const selectToken = (index: number) => {
    setSelectedTokenIndex(index);
    onTokenClick(tokens[index]);
    scrollToTokenRow(index);
  };

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
          <SentenceHighlight
            sentence={sentence}
            tokens={tokens}
            selectedLanguage={selectedLanguage}
            selectedTokenIndex={selectedTokenIndex}
            onTokenSelect={selectToken}
          />
        </div>
        {needsVirtualization ? (
          <List
            listRef={listRef}
            className={styles.tokenList}
            rowCount={tokens.length}
            rowHeight={ITEM_SIZE}
            rowComponent={TokenRow}
            rowProps={rowProps}
            style={{ height: MAX_VISIBLE_ITEMS * ITEM_SIZE }}
          />
        ) : (
          <div ref={plainListRef} style={{ display: 'grid' }}>
            {tokens.map((_, i) => (
              <PlainTokenRow key={i} index={i} style={{}} ariaAttributes={{}} {...rowProps} />
            ))}
          </div>
        )}
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
