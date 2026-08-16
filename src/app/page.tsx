'use client';

import { Search } from '@/features/Search';
import { SearchResults } from '@/features/SearchResults';

export default function Home() {
  return (
    <main>
      <Search />
      <SearchResults />
    </main>
  );
}
