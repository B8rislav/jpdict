export type MasteryStatus = 'new' | 'learning' | 'known';

export type Language = 'jp' | 'cn';

/** Which deck a saved card belongs to. Mirrors the backend's `card_type`. */
export type CardType = 'word' | 'kanji';

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
  gloss?: string;
};

export type SavedWord = Word & {
  savedAt: string;
  status: MasteryStatus;
  suspended: boolean;
  cardType: CardType;
  /** Kanji cards only — the «7 черт» pill. */
  strokeCount?: number;
};

/** One page of a filtered dictionary listing. `total` counts all matches, not this page. */
export type VocabularyPage = { items: SavedWord[]; total: number };

/** One deck's counts, as the dictionary's deck cards render them. */
export type DeckSummary = {
  cardType: CardType;
  total: number;
  due: number;
  newToday: number;
  doneToday: number;
};

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

/** Semantic kind of a search parse option — drives the frontend hint composition. */
export type SuggestKind = 'word' | 'verb' | 'kanji' | 'phrase' | 'reverse_word' | 'reverse_kanji';

/** One «варианты разбора» parse option, as returned by `/api/search/suggest`. */
export type SuggestOption = {
  id: string;
  kind: SuggestKind;
  unit: 'word' | 'kanji' | 'phrase';
  query_type: 'word' | 'kanji' | 'sentence';
  text: string;
  gloss?: string | null;
  level?: string | null;
};

export type BackendKanjiCard = {
  character: string;
  stroke_count?: number | null;
  radicals: string[];
  components?: { character: string; meanings: string[] }[];
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
