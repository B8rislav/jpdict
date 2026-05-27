import { FC } from 'react';
import { useUnit } from 'effector-react';
import { SentenceToken } from '@/shared/api/types';
import { SentenceResult } from './model';
import { fetchAIOverview } from './api/fetchAIOverview';
import { fetchWordsFx, clearWords } from '../WordCard';
import { clearKanji } from '../KanjiCard/model';
import { $userProfile } from '@/stores/userProfile';
import { SentenceCardView } from './ui/SentenceCardView';

export const SentenceCard: FC<SentenceResult> = ({ sentence, tokens }) => {
  const { selectedLanguage, showFurigana, showPinyin } = useUnit($userProfile);

  const handleTokenClick = (token: SentenceToken) => {
    const query = token.basic_form || token.surface_form;
    if (query) {
      clearWords();
      clearKanji();
      fetchWordsFx({ value: query, language: selectedLanguage }).catch((error) => {
        console.error(`Failed to fetch word info for ${query}:`, error);
      });
    }
  };

  return (
    <SentenceCardView
      sentence={sentence}
      tokens={tokens}
      selectedLanguage={selectedLanguage}
      showFurigana={showFurigana}
      showPinyin={showPinyin}
      onTokenClick={handleTokenClick}
      onFetchOverview={(onChunk) => fetchAIOverview(sentence, tokens, onChunk)}
    />
  );
};
