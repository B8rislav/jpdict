'use client';

import { useUnit } from 'effector-react';
import { type FC, useEffect, useMemo, useState } from 'react';

import { Button } from 'designoslav';

import { addWordFx, useSavedExpressions } from '@/features/Dictionary';
import { kanjiToPayload } from '@/features/Dictionary/lib/kanjiToPayload';
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
  const inspectorKanji = useUnit($inspectorKanji);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    [SECTION_TRANSLATION]: true,
  });
  const [expandedKanjiId, setExpandedKanjiId] = useState<string>();
  const [examplesRequested, setExamplesRequested] = useState(false);

  const expression = word.kanji_full ?? word.hiragana_full;
  const saved = useSavedExpressions(expression ? [expression] : []);
  const isSaved = Boolean(expression && saved.has(expression));

  // The word's constituent characters, checked against the kanji deck in one request
  // rather than one per character.
  const kanjiChars = useMemo(
    () => inspectorKanji.map((entry) => entry.kanji ?? '').filter(Boolean),
    [inspectorKanji],
  );
  const savedKanji = useSavedExpressions(kanjiChars, 'kanji');

  // Load the characters making up the word.
  useEffect(() => {
    setExpandedKanjiId(undefined);
    if (word.kanji_full) {
      fetchInspectorKanjiFx({ value: word.kanji_full, language: selectedLanguage });
    }
  }, [word.kanji_full, selectedLanguage]);

  // Each character carries its own add-to-deck button in KanjiCard's footer slot.
  // The mapper stays pure; only the container knows what saving means.
  const kanji = useMemo(
    () =>
      inspectorKanji.map((entry) => {
        const character = entry.kanji ?? '';
        const alreadySaved = savedKanji.has(character);
        return {
          ...kanjiToInWord(entry, t),
          action: (
            <Button
              variant={alreadySaved ? 'secondary' : 'primary'}
              disabled={alreadySaved}
              onClick={() => addWordFx(kanjiToPayload(entry))}
              fullWidth
            >
              {t('ui', alreadySaved ? 'dict_added_kanji' : 'dict_add_kanji')}
            </Button>
          ),
        };
      }),
    [inspectorKanji, savedKanji, t],
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
