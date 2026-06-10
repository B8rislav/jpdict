'use client';

import { type FC, type KeyboardEvent } from 'react';
import { Text } from '@gravity-ui/uikit';
import { type SentenceToken } from '@/shared/api/types';
import { getPosColorClass } from '../lib/posColor';
import { segmentSentence } from '../lib/segmentSentence';
import styles from './SentenceCardView.module.css';

export type SentenceHighlightProps = {
  sentence: string;
  tokens: SentenceToken[];
  selectedLanguage: 'jp' | 'cn' | null;
  selectedTokenIndex: number | null;
  onTokenSelect: (index: number) => void;
};

/**
 * Renders the sentence header as POS-tinted, clickable spans. Each token's
 * surface gets a background tint from its part-of-speech; the characters
 * between surfaces are rendered verbatim so the sentence reads naturally.
 * Clicking (or Enter/Space on) a span selects the matching token.
 */
export const SentenceHighlight: FC<SentenceHighlightProps> = ({
  sentence,
  tokens,
  selectedLanguage,
  selectedTokenIndex,
  onTokenSelect,
}) => {
  const segments = segmentSentence(sentence, tokens);

  const onKeyDown = (e: KeyboardEvent<HTMLSpanElement>, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onTokenSelect(index);
    }
  };

  return (
    <Text variant="body-2">
      {segments.map((segment, i) => {
        if (segment.type === 'plain') {
          return <span key={i}>{segment.text}</span>;
        }

        const token = tokens[segment.tokenIndex];
        const posClass = getPosColorClass(token.pos, selectedLanguage, styles);
        const isSelected = selectedTokenIndex === segment.tokenIndex;

        return (
          <span
            key={i}
            className={`${styles.inlineToken} ${posClass} ${isSelected ? styles.inlineSelected : ''}`}
            role="button"
            tabIndex={0}
            data-token-span-index={segment.tokenIndex}
            onClick={() => onTokenSelect(segment.tokenIndex)}
            onKeyDown={(e) => onKeyDown(e, segment.tokenIndex)}
          >
            <span className={styles.inlineLabel}>{segment.text}</span>
          </span>
        );
      })}
    </Text>
  );
};
