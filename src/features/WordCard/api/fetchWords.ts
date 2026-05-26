import { fetchData } from '@/shared/api/fetchData';
import { DictEntry } from '@/shared/api/types';
import { Word } from '../model';

type SearchPage = {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  items: DictEntry[];
};

export type WordsResponse = {
  result_count?: number;
  total_pg?: number;
  per_pg?: number;
  pg?: number;
  query?: string;
  words?: Word[];
};

function dictEntryToWord(entry: DictEntry): Word {
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

export async function fetchWords(value: string, language: 'jp' | 'cn' | null): Promise<WordsResponse> {
  if (!language) return {};
  const page = await fetchData<SearchPage>(
    `search?q=${encodeURIComponent(value)}&lang=${language}`,
  );
  return {
    result_count: page.total,
    pg: page.page,
    per_pg: page.per_page,
    words: page.items.map(dictEntryToWord),
  };
}
