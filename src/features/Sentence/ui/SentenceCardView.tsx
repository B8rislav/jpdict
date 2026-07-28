'use client';

import { type FC } from 'react';
import { Text } from '@gravity-ui/uikit';
import { EntryList, SentenceView, type EntryListItem, type EntryPartOfSpeech } from 'designoslav';
import { type SentenceToken } from '@/shared/api/types';
import { Card } from '@/shared/ui/Card';
import { AIOverviewAccordion } from './AIOverviewAccordion';
import styles from './SentenceCardView.module.css';

export type StripToken = {
  id: string;
  text: string;
  pos?: EntryPartOfSpeech;
};

type SentenceCardViewProps = {
  title: string;
  ariaLabel: string;
  stripTokens: StripToken[];
  items: EntryListItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  sentence: string;
  tokens: SentenceToken[];
  onFetchOverview: (onChunk: (chunk: string) => void) => Promise<void>;
};

export const SentenceCardView: FC<SentenceCardViewProps> = ({
  title,
  ariaLabel,
  stripTokens,
  items,
  selectedId,
  onSelect,
  sentence,
  tokens,
  onFetchOverview,
}) => (
  <>
    <div className={styles.sentenceCard}>
      <div className={styles.header}>
        <Text variant="display-4">{title}</Text>
        <SentenceView
          aria-label={ariaLabel}
          tokens={stripTokens}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      </div>
      <EntryList aria-label={ariaLabel} items={items} selectedId={selectedId} onSelect={onSelect} />
    </div>
    <Card className={styles.aiCard}>
      <AIOverviewAccordion sentence={sentence} tokens={tokens} onFetchOverview={onFetchOverview} />
    </Card>
  </>
);
