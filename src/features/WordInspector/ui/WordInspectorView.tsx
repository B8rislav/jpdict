'use client';

import { Skeleton } from '@gravity-ui/uikit';
import { Button, WordCard, type KanjiInWord, type WordSection } from 'designoslav';
import { motion } from 'motion/react';
import { type FC, useMemo } from 'react';

import { type Word } from '@/shared/api/types';
import { useT, type Translate } from '@/shared/i18n';
import { DURATION, EASE, TAP_SCALE, useReducedMotion } from '@/shared/motion';
import { SECTION_EXAMPLES, SECTION_GRAMMAR, SECTION_TRANSLATION } from '../constants';
import { type ReibunEntry } from '../api/fetchExampleSentences';
import styles from './WordInspectorView.module.css';

const MAX_EXAMPLES = 5;

export type WordInspectorViewProps = {
  word: Word;
  /** Characters of the word, already mapped for the design-system card. */
  kanji: KanjiInWord[];
  exampleSentences: ReibunEntry[];
  examplesPending: boolean;
  /** True once the examples section has been opened at least once. */
  examplesRequested: boolean;
  openSections: Record<string, boolean>;
  expandedKanjiId?: string;
  isSaved: boolean;
  /** Localized label for the reading line ("Хирагана" / "Пиньинь"). */
  readingLabel: string;
  /** Localized heading for the character list. */
  kanjiLabel: string;
  onToggleSection: (id: string) => void;
  onExpandKanji: (id: string) => void;
  onSave: () => void;
};

export const WordInspectorView: FC<WordInspectorViewProps> = ({
  word,
  kanji,
  exampleSentences,
  examplesPending,
  examplesRequested,
  openSections,
  expandedKanjiId,
  isSaved,
  readingLabel,
  kanjiLabel,
  onToggleSection,
  onExpandKanji,
  onSave,
}) => {
  const t = useT();
  const reduced = useReducedMotion();

  const definitions = word.def_ru?.length ? word.def_ru : word.def_en;

  const sections = useMemo<WordSection[]>(
    () => [
      {
        id: SECTION_TRANSLATION,
        title: t('ui', 'inspector_translation'),
        open: openSections[SECTION_TRANSLATION],
        content: definitions?.length ? (
          <ol>
            {definitions.map((definition, index) => (
              <li key={index}>{definition}</li>
            ))}
          </ol>
        ) : undefined,
      },
      {
        id: SECTION_GRAMMAR,
        title: t('ui', 'inspector_grammar'),
        open: openSections[SECTION_GRAMMAR],
        content: <GrammarRows word={word} t={t} />,
      },
      {
        id: SECTION_EXAMPLES,
        title: t('ui', 'inspector_examples'),
        open: openSections[SECTION_EXAMPLES],
        content: (
          <ExamplesContent
            pending={examplesPending}
            requested={examplesRequested}
            sentences={exampleSentences}
            t={t}
          />
        ),
      },
    ],
    [definitions, examplesPending, examplesRequested, exampleSentences, openSections, t, word],
  );

  return (
    <WordCard
      word={word.kanji_full ?? word.hiragana_full}
      pos={word.typeofspeech}
      reading={`${readingLabel}: ${word.hiragana_full}`}
      sections={sections}
      onToggleSection={onToggleSection}
      kanjiLabel={kanjiLabel}
      kanji={kanji}
      expandedKanjiId={expandedKanjiId}
      onExpandKanji={onExpandKanji}
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
            onClick={onSave}
          >
            {isSaved ? `✓ ${t('ui', 'inspector_saved')}` : t('ui', 'inspector_save')}
          </Button>
        </motion.span>
      }
    />
  );
};

const GrammarRows: FC<{ word: Word; t: Translate }> = ({ word, t }) => (
  <div className={styles.grammarGrid}>
    {word.typeofspeech && (
      <div className={styles.grammarRow}>
        <span className={styles.grammarLabel}>{t('ui', 'inspector_pos')}</span>
        <span>{word.typeofspeech}</span>
      </div>
    )}
    {word.pitch && word.pitch.length > 0 && (
      <div className={styles.grammarRow}>
        <span className={styles.grammarLabel}>{t('ui', 'inspector_pitch')}</span>
        <span>{word.pitch.join(', ')}</span>
      </div>
    )}
  </div>
);

const ExamplesContent: FC<{
  pending: boolean;
  requested: boolean;
  sentences: ReibunEntry[];
  t: Translate;
}> = ({ pending, requested, sentences, t }) => {
  if (pending) {
    return (
      <div className={styles.examplesLoading}>
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} style={{ height: 20 }} />
        ))}
      </div>
    );
  }

  if (sentences.length > 0) {
    return (
      <ul className={styles.sentenceList}>
        {sentences.slice(0, MAX_EXAMPLES).map((sentence) => (
          <li key={sentence.id} className={styles.sentenceItem}>
            <span>{sentence.sentence_jp}</span>
            {sentence.translation && (
              <span className={styles.sentenceMeaning}>{sentence.translation}</span>
            )}
          </li>
        ))}
      </ul>
    );
  }

  return requested ? <p>{t('ui', 'inspector_no_examples')}</p> : null;
};
