'use client';

import { type FC, useCallback, useEffect, useState } from 'react';
import { type EntryListItem } from 'designoslav';
import { type SentenceResult } from './model';
import { fetchAIOverview } from './api/fetchAIOverview';
import { firstContentTokenIndex } from './lib/firstContentToken';
import { posToEntry } from './lib/posToEntry';
import { fetchWordsFx, clearWords } from '../WordCard';
import { clearKanji } from '../KanjiCard/model';
import { useLocale, useT } from '@/shared/i18n';
import { SentenceCardView, type StripToken } from './ui/SentenceCardView';
import { useProfile } from '@/shared/profile/context';

const tokenId = (index: number) => `t${index}`;

export const SentenceCard: FC<SentenceResult> = ({ sentence, tokens }) => {
  const t = useT();
  const locale = useLocale();
  const { selectedLanguage, showFurigana, showPinyin } = useProfile();
  const [selectedId, setSelectedId] = useState<string>();

  const showReading = selectedLanguage === 'cn' ? showPinyin : showFurigana;

  const items: EntryListItem[] = tokens.map((token, i) => ({
    id: tokenId(i),
    headword: token.surface_form,
    reading: showReading && token.reading ? token.reading : undefined,
    pos: posToEntry(token, selectedLanguage),
    posLabel: t('pos', token.pos),
    posTag: token.pos,
    gloss: token.gloss?.trim()
      ? token.gloss
      : token.pos_detail_1
        ? t('pos_detail_1', token.pos_detail_1)
        : '—',
  }));

  const stripTokens: StripToken[] = tokens.map((token, i) => ({
    id: tokenId(i),
    text: token.surface_form,
    pos: posToEntry(token, selectedLanguage),
  }));

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      const token = tokens[Number(id.slice(1))];
      const query = token?.basic_form || token?.surface_form;
      if (query) {
        clearWords();
        clearKanji();
        fetchWordsFx({ value: query, language: selectedLanguage }).catch((error) => {
          console.error(`Failed to fetch word info for ${query}:`, error);
        });
      }
    },
    [tokens, selectedLanguage],
  );

  // A freshly parsed sentence selects nothing, which would leave the detail column blank
  // until the user clicks — so open on the first content word.
  useEffect(() => {
    if (tokens.length === 0) return;
    handleSelect(tokenId(firstContentTokenIndex(tokens, selectedLanguage)));
    // Re-runs only on a genuinely new parse, not on every render of the same one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentence, selectedLanguage]);

  const title = t('ui', 'sentence_title');

  return (
    <SentenceCardView
      title={title}
      ariaLabel={title}
      stripTokens={stripTokens}
      items={items}
      selectedId={selectedId}
      onSelect={handleSelect}
      sentence={sentence}
      tokens={tokens}
      onFetchOverview={(onChunk) => fetchAIOverview(sentence, tokens, onChunk, locale)}
    />
  );
};
