import { isJapaneseText } from '@/shared/utils/isJapaneseText';

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
};

export type SentenceResponse = {
  sentence: string;
  tokens: SentenceToken[];
};

type FetchSentence = Promise<SentenceResponse>;

export async function fetchSentence(value: string): FetchSentence {
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
