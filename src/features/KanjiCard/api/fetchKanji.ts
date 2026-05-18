import { fetchData } from '@/shared/api/fetchData';
import { paths } from '@/shared/api/generatedTypes';

type KanjiSearchResponse =
  paths['/kanji/search']['get']['responses']['200']['content']['application/json'];
export type KanjiResponse =
  paths['/kanji/{kanji}']['get']['responses']['200']['content']['application/json'][];
type GetKanji = Promise<KanjiResponse>;

export async function fetchKanji(value: string, language: 'jp' | 'cn' | null): GetKanji {
  if (language === 'cn') {
    // Mock Chinese kanji
    return [
      {
        id: '1',
        kanji: '中',
        scount: '4',
        definition: 'середина, центр, Китай',
        radical: '丨',
        radical_name: 'zhōng',
        onyomi: '', // Not used for Chinese
        kunyomi: '', // Not used for Chinese
        kanken: '', // Not used for Chinese
        jlpt: '', // Not used for Chinese
        rwords: [],
        parts: [],
        presence: {},
        user_data: {},
      },
      {
        id: '2',
        kanji: '国',
        scount: '8',
        definition: 'страна, государство',
        radical: '囗',
        radical_name: 'guó',
        onyomi: '',
        kunyomi: '',
        kanken: '',
        jlpt: '',
        rwords: [],
        parts: [],
        presence: {},
        user_data: {},
      },
    ];
  }

  const kanjisResponse: KanjiSearchResponse = await fetchData(
    `kanji/search?value=${value}`,
  );
  const kanjis = kanjisResponse.kanjis;
  if (!kanjis?.length) {
    return [];
  }
  const requests = kanjis.map((kanji) =>
    fetchData<KanjiResponse[number]>(`kanji/${kanji.kanji}`),
  );
  const kanjiDetails: KanjiResponse = await Promise.all(requests);
  return kanjiDetails;
}
