import type { SentenceToken } from '@/shared/api/types';
import { type Locale } from '@/shared/i18n';

export type { SentenceToken };

export type SentenceResponse = {
  sentence: string;
  tokens: SentenceToken[];
};

export async function fetchSentence(
  value: string,
  language: 'jp' | 'cn',
  defLang: Locale,
): Promise<SentenceResponse> {
  const response = await fetch(
    `/api/parse-sentence?sentence=${encodeURIComponent(value)}&language=${language}&def_lang=${defLang}`,
    { cache: 'no-store' },
  );

  if (!response.ok) {
    throw new Error(`Sentence parse failed: ${response.status}`);
  }

  return response.json();
}
