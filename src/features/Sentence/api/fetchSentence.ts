import { isJapaneseText } from '@/shared/utils/isJapaneseText';
import type { SentenceToken } from '../model';

export type { SentenceToken };

export type SentenceResponse = {
  sentence: string;
  tokens: SentenceToken[];
};

type FetchSentence = Promise<SentenceResponse>;

export async function fetchSentence(value: string, language: 'jp' | 'cn' | null): FetchSentence {
  if (language === 'cn') {
    // Mock Chinese sentence
    return {
      sentence: value,
      tokens: [
        {
          surface_form: '我',
          pos: 'pronoun',
          pos_detail_1: '',
          pos_detail_2: '',
          pos_detail_3: '',
          conjugated_type: '',
          conjugated_form: '',
          basic_form: '我',
          reading: 'wǒ',
          pronunciation: 'wǒ',
        },
        {
          surface_form: '爱',
          pos: 'verb',
          pos_detail_1: '',
          pos_detail_2: '',
          pos_detail_3: '',
          conjugated_type: '',
          conjugated_form: '',
          basic_form: '爱',
          reading: 'ài',
          pronunciation: 'ài',
        },
        {
          surface_form: '中国',
          pos: 'noun',
          pos_detail_1: '',
          pos_detail_2: '',
          pos_detail_3: '',
          conjugated_type: '',
          conjugated_form: '',
          basic_form: '中国',
          reading: 'Zhōngguó',
          pronunciation: 'Zhōngguó',
        },
      ],
    };
  }

  // Check if the text is valid Japanese before sending to kuromoji
  if (!isJapaneseText(value)) {
    return {
      sentence: value,
      tokens: [],
    };
  }

  const response = await fetch(
    `/api/parse-sentence?sentence=${encodeURIComponent(value)}`,
    {
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error(`Sentence parse failed: ${response.status}`);
  }

  return await response.json();
}
