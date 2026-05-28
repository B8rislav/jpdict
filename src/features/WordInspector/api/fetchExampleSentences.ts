import { fetchData } from '@/shared/api/fetchData';
import { getLocale } from '@/shared/i18n';

export interface ReibunEntry {
  id: number;
  sentence_jp: string;
  reading_jp: string | null;
  translation: string;
  translation_lang: 'ru' | 'en';
}

export interface ExampleSentencesResponse {
  result_count: number;
  pg: number;
  perPage: number;
  reibuns: ReibunEntry[];
}

export async function fetchExampleSentences(wordId: string): Promise<ExampleSentencesResponse> {
  return fetchData(`reibun/search/${wordId}?lang=${getLocale()}`);
}
