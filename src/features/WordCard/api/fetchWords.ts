import { fetchData } from '@/shared/api/fetchData';
import { paths } from '@/shared/api/generatedTypes';

export type WordsResponse =
  paths['/word/search']['get']['responses']['200']['content']['application/json'];
type GetWords = Promise<WordsResponse>;

export async function fetchWords(value: string, language: 'jp' | 'cn' | null): GetWords {
  if (language === 'cn') {
    // Mock Chinese words
    return {
      result_count: 2,
      pg: 1,
      per_pg: 10,
      words: [
        {
          id: '1',
          kanji_full: '中国',
          hiragana_full: 'Zhōngguó',
          pitch: ['zhōng guó'],
          markers: ['HSK 1'],
          def: ['Китай'],
        },
        {
          id: '2',
          kanji_full: '国家',
          hiragana_full: 'Guójiā',
          pitch: ['guó jiā'],
          markers: ['HSK 2'],
          def: ['государство, страна'],
        },
      ],
    };
  }

  return fetchData(`word/search?value=${value}&pg=1`);
}
