'use client';

import { Search } from '@/features/Search';
import { $words, fetchWordsFx, WordCard } from '@/features/WordCard';
import { $sentences, fetchSentenceFx, SentenceCard } from '@/features/Sentence';
import { CardList } from '@/shared/ui/CardList';
import { useList, useUnit } from 'effector-react';

import styles from './page.module.css';
import { $kanji, fetchKanjiFx } from '@/features/KanjiCard/model';
import { KanjiCard } from '@/features/KanjiCard/KanjiCard';
import dynamic from 'next/dynamic';

const LanguageSelect = dynamic(() => import('@/features/LanguageSelect'), { ssr: false });

export default function Home() {
  const sentencePending = useUnit(fetchSentenceFx.pending);
  const wordsPending = useUnit(fetchWordsFx.pending);
  const kanjiPending = useUnit(fetchKanjiFx.pending);

  const sentences = useList($sentences, (sentence, key) => (
    <li key={key}>
      <SentenceCard {...sentence} />
    </li>
  ));

  const words = useList($words, (word, key) => (
    <li key={key}>
      <WordCard {...word} />
    </li>
  ));

  const kanji = useList($kanji, (kanji, key) => (
    <li key={key}>
      <KanjiCard {...kanji} />
    </li>
  ));

  return (
    <div className={styles.page}>
      <LanguageSelect />
      <Search />
      <div className={styles.lists}>
        <CardList loading={sentencePending} listHeight={800} listWidth={1000}>
          {sentences}
        </CardList>
        <CardList loading={wordsPending || kanjiPending} listHeight={800} listWidth={600}>
          {kanji}
          {words}
        </CardList>
      </div>
    </div>
  );
}
