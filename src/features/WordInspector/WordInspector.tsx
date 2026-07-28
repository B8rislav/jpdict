'use client';

import { type FC, useEffect, useMemo, useState } from 'react';
import { Skeleton } from '@gravity-ui/uikit';
import { Button, WordCard, type KanjiInWord, type WordSection } from 'designoslav';
import { motion } from 'motion/react';
import { useUnit } from 'effector-react';
import { $userProfile } from '@/stores/userProfile';
import { type Kanji, type Word } from '@/shared/api/types';
import {
  fetchExampleSentencesFx,
  $exampleSentences,
  fetchInspectorKanjiFx,
  $inspectorKanji,
} from './model';
import { addWordFx, $savedWords } from '@/features/Dictionary';
import { DURATION, EASE, TAP_SCALE, useReducedMotion } from '@/shared/motion';
import { t } from '@/shared/i18n';
import styles from './WordInspector.module.css';

const SECTION_TRANSLATION = 'translation';
const SECTION_GRAMMAR = 'grammar';
const SECTION_EXAMPLES = 'examples';

function kanjiToInWord(k: Kanji): KanjiInWord {
  const readings = [k.onyomi, k.kunyomi].filter(Boolean).join('・');
  return {
    id: k.kanji ?? '',
    kanji: k.kanji ?? '',
    meaning: k.definition ?? '',
    readings: readings || undefined,
    jlpt: k.markers.find((m) => /^(JLPT|HSK)/.test(m)),
    strokeCount: k.markers.find((m) => /черт|stroke/i.test(m)),
    onyomi: k.onyomi ? { label: t('ui', 'kanji_onyomi'), readings: k.onyomi } : undefined,
    kunyomi: k.kunyomi ? { label: t('ui', 'kanji_kunyomi'), readings: k.kunyomi } : undefined,
    radical: k.radical ? { char: k.radical, gloss: k.radical_name } : undefined,
    radicalLabel: t('ui', 'kanji_radical'),
    parts: k.parts?.filter((p) => p.piece).map((p) => ({ char: p.piece, gloss: p.definition })),
    partsLabel: t('ui', 'kanji_parts'),
    strokeOrderLabel: t('ui', 'kanji_stroke_order'),
  };
}

export const WordInspector: FC<{ word: Word }> = ({ word }) => {
  const reduced = useReducedMotion();
  const { selectedLanguage } = useUnit($userProfile);
  const exampleSentences = useUnit($exampleSentences);
  const examplesPending = useUnit(fetchExampleSentencesFx.pending);
  const savedWords = useUnit($savedWords);
  const inspectorKanji = useUnit($inspectorKanji);

  const expression = word.kanji_full ?? word.hiragana_full;
  const isSaved = Boolean(
    expression && savedWords.some((w) => (w.kanji_full ?? w.hiragana_full) === expression),
  );

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    [SECTION_TRANSLATION]: true,
  });
  const [expandedKanjiId, setExpandedKanjiId] = useState<string>();
  const [examplesRequested, setExamplesRequested] = useState(false);

  // Load the word's kanji details for the "кандзи в слове" list.
  useEffect(() => {
    setExpandedKanjiId(undefined);
    if (word.kanji_full) {
      fetchInspectorKanjiFx({ value: word.kanji_full, language: selectedLanguage });
    }
  }, [word.kanji_full, selectedLanguage]);

  const kanji = useMemo(() => inspectorKanji.map(kanjiToInWord), [inspectorKanji]);

  const def = word.def_ru?.length ? word.def_ru : word.def_en;
  const readingLabel = t('ui', selectedLanguage === 'cn' ? 'reading_label_cn' : 'reading_label_jp');

  const grammarRows = (
    <div className={styles.grammarGrid}>
      {word.typeofspeech && (
        <div className={styles.grammarRow}>
          <span className={styles.grammarLabel}>{t('ui', 'inspector_pos')}</span>
          <span>{word.typeofspeech}</span>
        </div>
      )}
      {word.pitch && word.pitch.length > 0 && (
        <div className={styles.grammarRow}>
          <span className={styles.grammarLabel}>Pitch</span>
          <span>{word.pitch.join(', ')}</span>
        </div>
      )}
    </div>
  );

  const examplesContent = examplesPending ? (
    <div className={styles.examplesLoading}>
      <Skeleton style={{ height: 20 }} />
      <Skeleton style={{ height: 20 }} />
      <Skeleton style={{ height: 20 }} />
    </div>
  ) : exampleSentences.length > 0 ? (
    <ul className={styles.sentenceList}>
      {exampleSentences.slice(0, 5).map((s) => (
        <li key={s.id} className={styles.sentenceItem}>
          <span>{s.sentence_jp}</span>
          {s.translation && <span className={styles.sentenceMeaning}>{s.translation}</span>}
        </li>
      ))}
    </ul>
  ) : examplesRequested ? (
    <p>{t('ui', 'inspector_no_examples')}</p>
  ) : null;

  const sections: WordSection[] = [
    {
      id: SECTION_TRANSLATION,
      title: t('ui', 'inspector_translation'),
      open: openSections[SECTION_TRANSLATION],
      content: def?.length ? (
        <ol>
          {def.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ol>
      ) : undefined,
    },
    {
      id: SECTION_GRAMMAR,
      title: t('ui', 'inspector_grammar'),
      open: openSections[SECTION_GRAMMAR],
      content: grammarRows,
    },
    {
      id: SECTION_EXAMPLES,
      title: t('ui', 'inspector_examples'),
      open: openSections[SECTION_EXAMPLES],
      content: examplesContent,
    },
  ];

  const handleToggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
    if (id === SECTION_EXAMPLES && !examplesRequested && word.id) {
      setExamplesRequested(true);
      fetchExampleSentencesFx(word.id);
    }
  };

  return (
    <WordCard
      word={word.kanji_full ?? word.hiragana_full}
      pos={word.typeofspeech}
      reading={`${readingLabel}: ${word.hiragana_full}`}
      sections={sections}
      onToggleSection={handleToggleSection}
      kanjiLabel={t('ui', selectedLanguage === 'cn' ? 'inspector_chars_cn' : 'inspector_chars_jp')}
      kanji={kanji}
      expandedKanjiId={expandedKanjiId}
      onExpandKanji={(id) => setExpandedKanjiId((cur) => (cur === id ? undefined : id))}
      action={
        <motion.span
          style={{ display: 'block' }}
          animate={reduced ? undefined : { scale: isSaved ? [1, 1.18, 1] : 1 }}
          transition={reduced ? { duration: 0 } : { duration: DURATION.base, ease: EASE }}
          whileTap={reduced || isSaved ? undefined : { scale: TAP_SCALE }}
        >
          <Button
            fullWidth
            variant={isSaved ? 'secondary' : 'primary'}
            disabled={isSaved}
            onClick={() => addWordFx(word)}
          >
            {isSaved ? `✓ ${t('ui', 'inspector_saved')}` : t('ui', 'inspector_save')}
          </Button>
        </motion.span>
      }
    />
  );
};
