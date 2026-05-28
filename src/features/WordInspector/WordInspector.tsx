'use client';

import { type FC, useState, useCallback } from 'react';
import { Text, Button, Skeleton } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import { $userProfile } from '@/stores/userProfile';
import { fetchKanjiFx, clearKanji } from '@/features/KanjiCard/model';
import { type Word } from '@/shared/api/types';
import { fetchExampleSentencesFx, $exampleSentences } from './model';
import { addWordFx, $savedWords } from '@/features/Dictionary';
import { CJK_REGEX } from '@/shared/utils/cjk';
import { Card } from '@/shared/ui/Card';
import { MarkerList } from '@/shared/ui/MarkerList/MarkerList';
import { DefinitionList } from '@/shared/ui/DefinitionList/DefinitionList';
import { AccordionSection } from '@/shared/ui/Accordion/AccordionSection';
import { t } from '@/shared/i18n';
import styles from './WordInspector.module.css';

export const WordInspector: FC<{ word: Word }> = ({ word }) => {
  const { selectedLanguage } = useUnit($userProfile);
  const exampleSentences = useUnit($exampleSentences);
  const examplesPending = useUnit(fetchExampleSentencesFx.pending);
  const savedWords = useUnit($savedWords);
  const expression = word.kanji_full ?? word.hiragana_full;
  const isSaved = Boolean(
    expression && savedWords.some((w) => (w.kanji_full ?? w.hiragana_full) === expression),
  );
  const [examplesRequested, setExamplesRequested] = useState(false);

  const kanjiChars = word.kanji_full ? [...word.kanji_full].filter((c) => CJK_REGEX.test(c)) : [];

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
        <MarkerList markers={word.markers} />
      </div>

      <AccordionSection title={t('ui', 'inspector_translation')} defaultOpen>
        <DefinitionList items={word.def_ru?.length ? word.def_ru : word.def_en} />
      </AccordionSection>

      <AccordionSection title={t('ui', 'inspector_grammar')}>
        <div className={styles.grammarGrid}>
          {word.typeofspeech && (
            <div className={styles.grammarRow}>
              <Text variant="caption-1">{t('ui', 'inspector_pos')}</Text>
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

      <AccordionSection title={t('ui', 'inspector_examples')} onFirstExpand={handleExpandExamples}>
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
                <Text variant="body-2">{s.sentence_jp}</Text>
                {s.translation && (
                  <Text variant="body-3" className={styles.sentenceMeaning}>
                    {s.translation}
                  </Text>
                )}
              </li>
            ))}
          </ul>
        ) : examplesRequested ? (
          <Text variant="body-3">{t('ui', 'inspector_no_examples')}</Text>
        ) : null}
      </AccordionSection>

      {kanjiChars.length > 0 && (
        <AccordionSection title={t('ui', 'inspector_kanji')}>
          <div className={styles.kanjiGrid}>
            {kanjiChars.map((char) => (
              <button key={char} className={styles.kanjiBtn} onClick={() => handleKanjiClick(char)}>
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
          {isSaved ? t('ui', 'inspector_saved') : t('ui', 'inspector_save')}
        </Button>
      </div>
    </Card>
  );
};
