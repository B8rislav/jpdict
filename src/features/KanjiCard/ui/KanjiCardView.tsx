'use client';

import { type FC } from 'react';
import { Text } from '@gravity-ui/uikit';
import { Button } from 'designoslav';
import { MarkerList } from '@/shared/ui/MarkerList/MarkerList';
import { type Kanji } from '@/shared/api/types';
import { Card } from '@/shared/ui/Card';
import { StrokeOrder } from './StrokeOrder';
import { useT } from '@/shared/i18n';
import styles from './KanjiCardView.module.css';

type KanjiCardViewProps = Kanji & {
  selectedLanguage: 'jp' | 'cn' | null;
  /** Whether this character is already in the kanji deck. */
  isSaved?: boolean;
  /** Adds it to the kanji deck. Omit to hide the affordance entirely. */
  onSave?: () => void;
};

export const KanjiCardView: FC<KanjiCardViewProps> = ({
  kanji,
  definition,
  radical,
  radical_name,
  markers,
  kunyomi,
  onyomi,
  pinyin,
  parts,
  selectedLanguage,
  isSaved = false,
  onSave,
}) => {
  const t = useT();

  return (
    <Card>
      <div className={styles.main}>
        <div className={styles.name}>
          <Text variant="display-4">{kanji}</Text>
          <MarkerList markers={markers} />
        </div>
        <div className={styles.secondary}>
          {selectedLanguage === 'jp' ? (
            <>
              <div className={styles.kunyomi}>
                <Text variant="subheader-3">{t('ui', 'kanji_kunyomi')}: </Text>
                <Text variant="body-2">{kunyomi}</Text>
              </div>
              <div className={styles.onyomi}>
                <Text variant="subheader-3">{t('ui', 'kanji_onyomi')}: </Text>
                <Text variant="body-2">{onyomi}</Text>
              </div>
            </>
          ) : selectedLanguage === 'cn' ? (
            <div className={styles.pinyin}>
              <Text variant="subheader-3">{t('ui', 'kanji_pinyin')}: </Text>
              <Text variant="body-2">{pinyin}</Text>
            </div>
          ) : null}
          <div className={styles.radicalBlock}>
            <Text variant="subheader-3">{t('ui', 'kanji_radical')}</Text>
            <div className={styles.radical}>
              <Text variant="display-2">{radical}</Text>
              <Text variant="body-2">{radical_name}</Text>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.definitionBlock}>
        <Text variant="subheader-3">{t('ui', 'kanji_definition')}: </Text>
        <Text variant="body-3">{definition}</Text>
      </div>
      {parts && parts.length > 0 && (
        <div className={styles.partsBlock}>
          <Text variant="subheader-3">{t('ui', 'kanji_parts')}</Text>
          <div className={styles.parts}>
            {parts.map((part) => (
              <div key={part.piece} className={styles.part}>
                <Text variant="display-2">{part.piece}</Text>
                <Text variant="body-2">{part.definition}</Text>
              </div>
            ))}
          </div>
        </div>
      )}
      {kanji && <StrokeOrder kanji={kanji} />}
      {onSave && (
        <Button
          className={styles.save}
          variant={isSaved ? 'secondary' : 'primary'}
          disabled={isSaved}
          onClick={onSave}
          fullWidth
        >
          {t('ui', isSaved ? 'dict_added_kanji' : 'dict_add_kanji')}
        </Button>
      )}
    </Card>
  );
};
