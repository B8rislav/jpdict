'use client';

import { FC } from 'react';
import { Card } from '@/shared/ui/Card';
import { Kanji } from './model';
import { StrokeOrder } from './ui/StrokeOrder';

import styles from './KanjiCard.module.css';
import { Label, Text } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import { $userProfile } from '@/stores/userProfile';
import ruTranslations from '@/shared/i18n/ru.json';

const getTranslation = (category: keyof typeof ruTranslations, key: string) => {
  return (ruTranslations[category] as Record<string, string>)?.[key] || key;
};

type KanjiCardProps = Kanji;

export const KanjiCard: FC<KanjiCardProps> = (props) => {
  const {
    kanji,
    definition,
    radical,
    radical_name,
    markers,
    kunyomi,
    onyomi,
    parts,
  } = props;
  const selectedLanguage = useUnit($userProfile).selectedLanguage;
  return (
    <Card>
      <div className={styles.main}>
        <div className={styles.name}>
          <Text variant="display-4">{kanji}</Text>
          <ul className={styles.markers}>
            {markers.map((marker) => (
              <li key={marker}>
                <Label>{marker}</Label>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.secondary}>
          {selectedLanguage === 'jp' ? (
            <>
              <div className={styles.kunyomi}>
                <Text variant="subheader-3">{getTranslation('ui', 'kanji_kunyomi')}: </Text>
                <Text variant="body-2">{kunyomi}</Text>
              </div>
              <div className={styles.onyomi}>
                <Text variant="subheader-3">{getTranslation('ui', 'kanji_onyomi')}: </Text>
                <Text variant="body-2">{onyomi}</Text>
              </div>
            </>
          ) : selectedLanguage === 'cn' ? (
            <div className={styles.pinyin}>
              <Text variant="subheader-3">{getTranslation('ui', 'kanji_pinyin')}: </Text>
              <Text variant="body-2">{radical_name}</Text>
            </div>
          ) : null}
          <div className={styles.radicalBlock}>
            <Text variant="subheader-3">{getTranslation('ui', 'kanji_radical')}</Text>
            <div className={styles.radical}>
              <Text variant="display-2">{radical}</Text>
              <Text variant="body-2">{radical_name}</Text>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.definitionBlock}>
        <Text variant="subheader-3">{getTranslation('ui', 'kanji_definition')}: </Text>
        <Text variant="body-3">{definition}</Text>
      </div>
      {parts && parts.length > 0 && (
        <div className={styles.partsBlock}>
          <Text variant="subheader-3">{getTranslation('ui', 'kanji_parts')}</Text>
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
    </Card>
  );
};
