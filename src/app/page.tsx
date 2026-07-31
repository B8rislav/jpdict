'use client';

import { useUnit } from 'effector-react';
import { useEffect } from 'react';

import { loadDictionaryFx } from '@/features/Dictionary';
import { Search } from '@/features/Search';
import { SearchResults } from '@/features/SearchResults';
import { $isAuthenticated } from '@/stores/auth';

export default function Home() {
  const isAuthenticated = useUnit($isAuthenticated);

  // Profile hydration and the session lookup belong to Providers; this page only
  // needs the saved-word list, and only once there's a session to load it for.
  useEffect(() => {
    if (isAuthenticated) loadDictionaryFx();
  }, [isAuthenticated]);

  return (
    <main>
      <Search />
      <SearchResults />
    </main>
  );
}
