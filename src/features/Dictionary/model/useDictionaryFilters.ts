'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { queryFromParams, queryToParams, type DictionaryQuery } from './query';

/**
 * The dictionary view, read from and written to the URL.
 *
 * This used to filter an in-memory array. Now that the backend does the filtering and
 * the paging, filtering a single page client-side would make «Показано: N» lie — so the
 * hook's job is to own the query, not the rows.
 */
export function useDictionaryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = useMemo(
    () => queryFromParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const setQuery = useCallback(
    (patch: Partial<DictionaryQuery>) => {
      const params = queryToParams({ ...query, ...patch });
      const search = params.toString();
      // `replace`, not `push`: flipping a filter refines one view, and every keystroke
      // of the search box would otherwise land in the back stack.
      router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
    },
    [query, pathname, router],
  );

  return { query, setQuery };
}
