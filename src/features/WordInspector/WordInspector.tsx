'use client';

import { FC, ReactNode, useState, useCallback } from 'react';
import { Text, Button, Label, Skeleton } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import { $userProfile } from '@/stores/userProfile';
import { fetchKanjiFx, clearKanji } from '@/features/KanjiCard/model';
import { Word } from '@/features/WordCard/model';
import { fetchExampleSentencesFx, $exampleSentences } from './model';
import { addWordFx, $savedWords } from '@/features/Dictionary';
import { Card } from '@/shared/ui/Card';
import styles from './WordInspector.module.css';

const CJK_REGEX = /[一-龯㐀-䶿]/;

type AccordionSectionProps = {
  title: string;
  defaultOpen?: boolean;
  onFirstExpand?: () => void;
  children: ReactNode;
};

const AccordionSection: FC<AccordionSectionProps> = ({
  title,
  defaultOpen = false,
  onFirstExpand,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [hasExpanded, setHasExpanded] = useState(defaultOpen);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next && !hasExpanded) {
      setHasExpanded(true);
      onFirstExpand?.();
    }
  };

  return (
    <div className={styles.section}>
      <button className={styles.sectionToggle} onClick={handleToggle}>
        <Text variant="subheader-2">{title}</Text>
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>▾</span>
      </button>
      {isOpen && <div className={styles.sectionContent}>{children}</div>}
    </div>
  );
};

export const WordInspector: FC<{ word: Word }> = ({ word }) => {
  const { selectedLanguage } = useUnit($userProfile);
  const exampleSentences = useUnit($exampleSentences);
  const examplesPending = useUnit(fetchExampleSentencesFx.pending);
  const savedWords = useUnit($savedWords);
  const expression = word.kanji_full ?? word.hiragana_full;
  const isSaved = Boolean(expression && savedWords.some((w) => (w.kanji_full ?? w.hiragana_full) === expression));
  const [examplesRequested, setExamplesRequested] = useState(false);

  const kanjiChars = word.kanji_full
    ? [...word.kanji_full].filter((c) => CJK_REGEX.test(c))
    : [];

  const handleExpandExamples = useCallback(() => {
    if (!examplesRequested && word.id) {
      setExamplesRequested(true);
      fetchExampleSentencesFx(word.id);
    }
  }, [examplesRequested, word.id]);

  const handleKanjiClick = (char: string) => {
    clearKanji();
    fetchKanjiFx({ value: char, language: selectedLanguage });
  };

  const readingLabel = selectedLanguage === 'cn' ? 'Pinyin' : 'Hiragana';

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>
          {word.kanji_full && <Text variant="display-4">{word.kanji_full}</Text>}
          <Text variant="subheader-2">
            {readingLabel}: {word.hiragana_full}
          </Text>
        </div>
        {word.markers && word.markers.length > 0 && (
          <div className={styles.badges}>
            {word.markers.map((marker) => (
              <Label key={marker}>{marker}</Label>
            ))}
          </div>
        )}
      </div>

      <AccordionSection title="Перевод" defaultOpen>
        <ol className={styles.definitions}>
          {(word.def_ru?.length ? word.def_ru : word.def_en)?.map((d, i) => (
            <li key={i}>
              <Text variant="body-2">{d}</Text>
            </li>
          ))}
        </ol>
      </AccordionSection>

      <AccordionSection title="Грамматика">
        <div className={styles.grammarGrid}>
          {word.typeofspeech && (
            <div className={styles.grammarRow}>
              <Text variant="caption-1">Часть речи</Text>
              <Text variant="body-2">{word.typeofspeech}</Text>
            </div>
          )}
          {word.pitch && word.pitch.length > 0 && (
            <div className={styles.grammarRow}>
              <Text variant="caption-1">Pitch</Text>
              <Text variant="body-2">{word.pitch.join(', ')}</Text>
            </div>
          )}
        </div>
      </AccordionSection>

      <AccordionSection title="Примеры" onFirstExpand={handleExpandExamples}>
        {examplesPending ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton style={{ height: 20 }} />
            <Skeleton style={{ height: 20 }} />
            <Skeleton style={{ height: 20 }} />
          </div>
        ) : exampleSentences.length > 0 ? (
          <ul className={styles.sentenceList}>
            {exampleSentences.slice(0, 5).map((s) => (
              <li key={s.id} className={styles.sentenceItem}>
                <Text variant="body-2">{s.japanese}</Text>
                {s.meaning?.en && (
                  <Text variant="body-3" className={styles.sentenceMeaning}>
                    {s.meaning.en}
                  </Text>
                )}
              </li>
            ))}
          </ul>
        ) : examplesRequested ? (
          <Text variant="body-3">Примеры не найдены</Text>
        ) : null}
      </AccordionSection>

      {kanjiChars.length > 0 && (
        <AccordionSection title="Иероглифы">
          <div className={styles.kanjiGrid}>
            {kanjiChars.map((char) => (
              <button
                key={char}
                className={styles.kanjiBtn}
                onClick={() => handleKanjiClick(char)}
              >
                <Text variant="display-2">{char}</Text>
              </button>
            ))}
          </div>
        </AccordionSection>
      )}

      <div className={styles.footer}>
        <Button
          view={isSaved ? 'outlined-success' : 'action'}
          disabled={isSaved}
          onClick={() => addWordFx(word)}
        >
          {isSaved ? 'Сохранено' : 'Добавить в словарь'}
        </Button>
      </div>
    </Card>
  );
};
