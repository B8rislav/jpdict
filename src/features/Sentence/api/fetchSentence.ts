import type { SentenceToken } from '../model';

export type { SentenceToken };

export type SentenceResponse = {
  sentence: string;
  tokens: SentenceToken[];
};

export async function fetchSentence(
  value: string,
  language: 'jp' | 'cn',
): Promise<SentenceResponse> {
  const response = await fetch(
    `/api/parse-sentence?sentence=${encodeURIComponent(value)}&language=${language}`,
    { cache: 'no-store' },
  );

  if (!response.ok) {
    throw new Error(`Sentence parse failed: ${response.status}`);
  }

  return response.json();
}
