'use client';

import { type FC } from 'react';
import {
  EntryList,
  SectionHeading,
  SentenceView,
  type EntryListItem,
  type EntryPartOfSpeech,
} from 'designoslav';
import { type SentenceToken } from '@/shared/api/types';
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
  <section className={styles.column}>
    <SectionHeading>{title}</SectionHeading>

    <div className={styles.strip}>
      <SentenceView
        aria-label={ariaLabel}
        tokens={stripTokens}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </div>

    {/* Directly under the sentence it describes. It used to sit below every token card,
        which put it ~1400px down on a seven-token parse — present but unfindable. */}
    <div className={styles.overview}>
      <AIOverviewAccordion sentence={sentence} tokens={tokens} onFetchOverview={onFetchOverview} />
    </div>

    <EntryList aria-label={ariaLabel} items={items} selectedId={selectedId} onSelect={onSelect} />
  </section>
);
