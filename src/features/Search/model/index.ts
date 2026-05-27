import { createEvent, sample } from 'effector';
import { clearWords } from '../../WordCard';
import { clearKanji } from '../../KanjiCard/model';
import { clearSentences } from '../../Sentence';
import { clearInspectedWord } from '../../WordInspector';

export const resetSearchResults = createEvent();

sample({
  clock: resetSearchResults,
  target: [clearWords, clearKanji, clearSentences, clearInspectedWord],
});
