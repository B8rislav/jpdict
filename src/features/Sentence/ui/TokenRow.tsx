'use client';

import { type CSSProperties, type ReactElement } from 'react';
import { Label, Text } from '@gravity-ui/uikit';
import { motion } from 'motion/react';
import { type RowComponentProps } from 'react-window';
import { type SentenceToken } from '@/shared/api/types';
import { FuriganaText } from '@/shared/ui/FuriganaText/FuriganaText';
import { DURATION, EASE, useReducedMotion } from '@/shared/motion';
import { t } from '@/shared/i18n';
import styles from './SentenceCardView.module.css';

export type TokenRowProps = {
  tokens: SentenceToken[];
  selectedTokenIndex: number | null;
  setSelectedTokenIndex: (i: number | null) => void;
  selectedLanguage: 'jp' | 'cn' | null;
  showFurigana: boolean;
  showPinyin: boolean;
  getPosClass: (pos: string) => string;
  onTokenClick: (token: SentenceToken, index: number) => void;
};

export const TokenRow = ({
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
  const reduced = useReducedMotion();
  const token = tokens[index];
  const wrapperStyle: CSSProperties = { ...style, paddingBottom: 16, boxSizing: 'border-box' };

  return (
    // The wrapper's `style` is owned by react-window — animate the inner token,
    // never this virtualized row.
    <div style={wrapperStyle} data-token-index={index} {...ariaAttributes}>
      <motion.div
        className={`${styles.token} ${getPosClass(token.pos)} ${
          selectedTokenIndex === index ? styles.selected : ''
        }`}
        style={{ height: '100%', boxSizing: 'border-box' }}
        whileHover={reduced ? undefined : { y: -2, scale: 1.01 }}
        transition={reduced ? { duration: 0 } : { duration: DURATION.fast, ease: EASE }}
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
            <Text variant="caption-1">{t('fields', 'pos')}</Text>
            <Label>{t('pos', token.pos)}</Label>
          </div>
          {token.pos_detail_1 && (
            <div className={styles.metaItem}>
              <Text variant="caption-1">{t('fields', 'pos_detail_1')}</Text>
              <Text variant="body-3">{t('pos_detail_1', token.pos_detail_1)}</Text>
            </div>
          )}
          {token.conjugated_form && (
            <div className={styles.metaItem}>
              <Text variant="caption-1">{t('fields', 'conjugated_form')}</Text>
              <Text variant="body-3">{token.conjugated_form}</Text>
            </div>
          )}
          {token.reading && (
            <div className={styles.metaItem}>
              <Text variant="caption-1">{t('fields', 'reading')}</Text>
              <Text variant="body-3">{token.reading}</Text>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
