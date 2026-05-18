import { components } from './generatedTypes';

export type MasteryStatus = 'new' | 'learning' | 'known';

export type WordEntry = Pick<
  components['schemas']['Word'],
  'id' | 'kanji_full' | 'pitch' | 'hiragana_full' | 'markers' | 'def' | 'typeofspeech'
>;

export type SavedWord = WordEntry & { savedAt: string; status: MasteryStatus };
