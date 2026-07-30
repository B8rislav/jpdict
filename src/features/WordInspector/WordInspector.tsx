'use client';

import { useUnit } from 'effector-react';
import { type FC, useEffect, useMemo, useState } from 'react';

import { addWordFx, $savedWords } from '@/features/Dictionary';
import { type Word } from '@/shared/api/types';
import { useT } from '@/shared/i18n';
import { useProfile } from '@/shared/profile/context';
import { SECTION_EXAMPLES, SECTION_TRANSLATION } from './constants';
import { kanjiToInWord } from './lib/kanjiToInWord';
import {
  $exampleSentences,
  $inspectorKanji,
  fetchExampleSentencesFx,
  fetchInspectorKanjiFx,
} from './model';
import { WordInspectorView } from './ui/WordInspectorView';

export const WordInspector: FC<{ word: Word }> = ({ word }) => {
  const t = useT();
  const { selectedLanguage } = useProfile();
  const exampleSentences = useUnit($exampleSentences);
  const examplesPending = useUnit(fetchExampleSentencesFx.pending);
  const savedWords = useUnit($savedWords);
  const inspectorKanji = useUnit($inspectorKanji);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    [SECTION_TRANSLATION]: true,
  });
  const [expandedKanjiId, setExpandedKanjiId] = useState<string>();
  const [examplesRequested, setExamplesRequested] = useState(false);

  const expression = word.kanji_full ?? word.hiragana_full;
  const isSaved = Boolean(
    expression &&
    savedWords.some((saved) => (saved.kanji_full ?? saved.hiragana_full) === expression),
  );

  // Load the characters making up the word.
  useEffect(() => {
    setExpandedKanjiId(undefined);
    if (word.kanji_full) {
      fetchInspectorKanjiFx({ value: word.kanji_full, language: selectedLanguage });
    }
  }, [word.kanji_full, selectedLanguage]);

  const kanji = useMemo(
    () => inspectorKanji.map((entry) => kanjiToInWord(entry, t)),
    [inspectorKanji, t],
  );

  // Examples are fetched lazily, the first time their section is opened.
  const handleToggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
    if (id === SECTION_EXAMPLES && !examplesRequested && word.id) {
      setExamplesRequested(true);
      fetchExampleSentencesFx(word.id);
    }
  };

  return (
    <WordInspectorView
      word={word}
      kanji={kanji}
      exampleSentences={exampleSentences}
      examplesPending={examplesPending}
      examplesRequested={examplesRequested}
      openSections={openSections}
      expandedKanjiId={expandedKanjiId}
      isSaved={isSaved}
      readingLabel={t('ui', selectedLanguage === 'cn' ? 'reading_label_cn' : 'reading_label_jp')}
      kanjiLabel={t('ui', selectedLanguage === 'cn' ? 'inspector_chars_cn' : 'inspector_chars_jp')}
      onToggleSection={handleToggleSection}
      onExpandKanji={(id) => setExpandedKanjiId((current) => (current === id ? undefined : id))}
      onSave={() => addWordFx(word)}
    />
  );
};
