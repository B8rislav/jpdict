import { fetchData } from '@/shared/api/fetchData';
import { type DictEntry } from '@/shared/api/types';
import { type Word } from '@/shared/api/types';
import { dictEntryToWord } from './mappers';
import { getLocale } from '@/shared/i18n';

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

export async function fetchWords(
  value: string,
  language: 'jp' | 'cn' | null,
): Promise<WordsResponse> {
  if (!language) return {};
  const page = await fetchData<SearchPage>(
    `search?q=${encodeURIComponent(value)}&lang=${language}&def_lang=${getLocale()}`,
  );
  return {
    result_count: page.total,
    pg: page.page,
    per_pg: page.per_page,
    words: page.items.map(dictEntryToWord),
  };
}
