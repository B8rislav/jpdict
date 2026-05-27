import { fetchData } from '@/shared/api/fetchData';
import { type paths } from '@/shared/api/generatedTypes';

export type ExampleSentencesResponse =
  paths['/reibun/search/{word_id}']['get']['responses']['200']['content']['application/json'];

export type SimpleSentence = NonNullable<ExampleSentencesResponse['reibuns']>[number];

export async function fetchExampleSentences(wordId: string): Promise<ExampleSentencesResponse> {
  return fetchData(`reibun/search/${wordId}`);
}
