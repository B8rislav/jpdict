import { addHistoryFx } from '@/features/SearchHistory';
import { type Language } from '@/shared/api/types';
import { fetchKanjiFx } from '../../KanjiCard/model';
import { fetchSentenceFx } from '../../Sentence';
import { fetchWordsFx } from '../../WordCard';
import { type SearchQueryType } from '../utils';
import { resetSearchResults } from './index';

/**
 * Dispatch a search: record it in history, clear the previous results, and run
 * whichever lookup the query type calls for.
 *
 * Lives in the model rather than the container because it's pure effect
 * orchestration — no JSX, no component state.
 */
export async function runSearch(
  query: string,
  type: SearchQueryType,
  language: Language,
): Promise<void> {
  addHistoryFx({ language, query, query_type: type });
  resetSearchResults();

  if (type === 'kanji') {
    await fetchKanjiFx({ value: query, language });
  } else if (type === 'sentence') {
    await fetchSentenceFx({ value: query, language });
  } else {
    await fetchWordsFx({ value: query, language });
  }
}
