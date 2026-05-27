'use client';

import { type CSSProperties, type ReactElement } from 'react';
import { Label, Text } from '@gravity-ui/uikit';
import { type RowComponentProps } from 'react-window';
import { type SentenceToken } from '@/shared/api/types';
import { FuriganaText } from '@/shared/ui/FuriganaText/FuriganaText';
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
      </div>
    </div>
  );
};
