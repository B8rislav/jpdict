export type MasteryStatus = 'new' | 'learning' | 'known';

export type Language = 'jp' | 'cn';

export type Word = {
  id?: string;
  kanji_full?: string;
  hiragana_full?: string;
  markers?: string[];
  pitch?: string[];
  def_en?: string[];
  def_ru?: string[];
  typeofspeech?: string;
};

export type Kanji = {
  kanji?: string;
  definition?: string;
  radical?: string;
  radical_name?: string;
  rwords?: { reading?: string; words?: unknown[] }[];
  kunyomi?: string;
  onyomi?: string;
  pinyin?: string;
  parts?: { piece?: string; definition?: string }[];
  markers: string[];
};

export type SentenceToken = {
  surface_form: string;
  pos: string;
  pos_detail_1: string;
  pos_detail_2: string;
  pos_detail_3: string;
  conjugated_type: string;
  conjugated_form: string;
  basic_form: string;
  reading?: string;
  pronunciation?: string;
  jlpt_level?: number | null;
  hsk_level?: number | null;
};

export type SavedWord = Word & { savedAt: string; status: MasteryStatus };

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

export type BackendHanziCard = {
  character: string;
  pinyin: string;
  meanings: string[];
  hsk_level: number | null;
  traditional: string | null;
};
