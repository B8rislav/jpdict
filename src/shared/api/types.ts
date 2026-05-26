import { Word } from '@/features/WordCard/model';

export type MasteryStatus = 'new' | 'learning' | 'known';

export type WordEntry = Word;

export type SavedWord = WordEntry & { savedAt: string; status: MasteryStatus };

export type DictEntry = {
  id: string;
  lang: string;
  headword?: string;
  reading?: string;
  traditional?: string;
  simplified?: string;
  pinyin?: string;
  definitions: string[];
  part_of_speech?: string;
  jlpt_level?: number | null;
  hsk_level?: number | null;
  is_common: boolean;
};

export type BackendKanjiCard = {
  character: string;
  stroke_count?: number | null;
  radicals: string[];
  on_readings: string[];
  kun_readings: string[];
  meanings: string[];
  jlpt_level?: string | null;
};
