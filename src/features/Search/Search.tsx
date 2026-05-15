import { FC, useState } from 'react';

import { SearchView } from './ui/SearchView';
import { fetchWordsFx, clearWords } from '../WordCard';
import { fetchKanjiFx, clearKanji } from '../KanjiCard/model';
import { fetchSentenceFx, clearSentences } from '../Sentence';
import { isJapaneseText } from '@/shared/utils/isJapaneseText';
import { useUnit } from 'effector-react';
import { $userProfile } from '@/stores/userProfile';

export const Search: FC = () => {
  const [value, setValue] = useState('');
  const selectedLanguage = useUnit($userProfile).selectedLanguage;

  const placeholder = selectedLanguage === 'jp'
    ? 'Введите слово, кандзи или предложение на японском'
    : selectedLanguage === 'cn'
    ? 'Введите слово, иероглиф или предложение на китайском'
    : 'Выберите язык для поиска';

  const onButtonClick = () => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return;
    }

    if (isJapaneseText(trimmedValue)) {
      // Pure Japanese text: clear other results and fetch only sentence
      clearWords();
      clearKanji();
      clearSentences();
      fetchSentenceFx(trimmedValue).catch((error) => {
        console.log(error);
      });
      return;
    }

    // Non-Japanese or general word query: clear sentence results and fetch words/kanji
    clearSentences();
    Promise.all([fetchWordsFx(trimmedValue), fetchKanjiFx(trimmedValue)]).catch(
      (error) => {
        console.log(error);
      },
    );
  };

  return (
    <SearchView
      inputValue={value}
      setInputValue={setValue}
      onButtonClick={onButtonClick}
      placeholder={placeholder}
    />
  );
};
