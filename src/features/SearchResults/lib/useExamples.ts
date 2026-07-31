import { useMemo } from 'react';

import { useT } from '@/shared/i18n';
import { useProfile } from '@/shared/profile/context';
import { type ExampleQuery } from '../ui/EmptyState';

/**
 * The starter queries for the empty state — one per lookup the classifier can pick, so a
 * first-time visitor can see all three result layouts without knowing the heuristic.
 *
 * The queries themselves are locale files rather than constants because they change with
 * the *study* language, not the interface language.
 */
export const useExamples = (): ExampleQuery[] => {
  const t = useT();
  const { selectedLanguage } = useProfile();

  return useMemo(() => {
    const cn = selectedLanguage === 'cn';
    return [
      {
        query: t('ui', cn ? 'empty_example_sentence_cn' : 'empty_example_sentence'),
        label: t('ui', 'query_type_sentence'),
      },
      {
        query: t('ui', cn ? 'empty_example_word_cn' : 'empty_example_word'),
        label: t('ui', 'query_type_word'),
      },
      {
        query: t('ui', cn ? 'empty_example_kanji_cn' : 'empty_example_kanji'),
        label: t('ui', 'query_type_kanji'),
      },
    ];
  }, [selectedLanguage, t]);
};
