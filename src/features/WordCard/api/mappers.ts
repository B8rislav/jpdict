import { type DictEntry, type Word } from '@/shared/api/types';

export function dictEntryToWord(entry: DictEntry): Word {
  const markers: string[] = [];
  if (entry.jlpt_level != null) markers.push(`JLPT N${entry.jlpt_level}`);
  if (entry.hsk_level != null) markers.push(`HSK ${entry.hsk_level}`);

  return {
    id: entry.id,
    kanji_full: entry.headword ?? entry.simplified ?? entry.traditional,
    hiragana_full: entry.reading ?? entry.pinyin,
    def_en: entry.definitions,
    typeofspeech: entry.part_of_speech ?? undefined,
    markers,
  };
}
