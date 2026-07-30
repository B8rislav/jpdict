import { useEffect } from 'react';

import { type Language } from '@/shared/api/types';
import { QUERY_TYPE_DEBOUNCE_MS } from '../constants';
import { clearSuggestions, fetchSuggestFx } from './suggest';

/**
 * Keep the parse-option list in step with what's being typed, debounced.
 * An empty query clears the list rather than firing a request.
 */
export function useSuggestionQuery(value: string, language: Language | null): void {
  useEffect(() => {
    const query = value.trim();
    if (!query || !language) {
      clearSuggestions();
      return;
    }

    const handle = window.setTimeout(() => {
      fetchSuggestFx({ query, language });
    }, QUERY_TYPE_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [value, language]);
}
