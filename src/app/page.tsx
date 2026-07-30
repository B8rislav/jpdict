'use client';

import { useUnit } from 'effector-react';
import { motion } from 'motion/react';
import { useEffect } from 'react';

import { AppNav } from '@/features/AppNav';
import { loadDictionaryFx } from '@/features/Dictionary';
import { $kanji, fetchKanjiFx } from '@/features/KanjiCard/model';
import { KanjiCard } from '@/features/KanjiCard/KanjiCard';
import { Search } from '@/features/Search';
import { $sentences, fetchSentenceFx, SentenceCard } from '@/features/Sentence';
import { $words, fetchWordsFx, WordCard } from '@/features/WordCard';
import { $inspectedWord, WordInspector } from '@/features/WordInspector';
import { cardEnter } from '@/shared/motion';
import { CardList } from '@/shared/ui/CardList';
import { $isAuthenticated } from '@/stores/auth';

import styles from './page.module.css';

export default function Home() {
  const isAuthenticated = useUnit($isAuthenticated);
  const sentencePending = useUnit(fetchSentenceFx.pending);
  const wordsPending = useUnit(fetchWordsFx.pending);
  const kanjiPending = useUnit(fetchKanjiFx.pending);
  const inspectedWord = useUnit($inspectedWord);
  const sentenceList = useUnit($sentences);
  const wordList = useUnit($words);
  const kanjiList = useUnit($kanji);

  // Profile hydration and the session lookup belong to Providers; this page only
  // needs the saved-word list, and only once there's a session to load it for.
  useEffect(() => {
    if (isAuthenticated) loadDictionaryFx();
  }, [isAuthenticated]);

  // Stable, domain-derived keys (not array index) so AnimatePresence can tell
  // an outgoing result set from the next one and animate the swap.
  const sentences = sentenceList.map((sentence) => (
    <motion.li key={sentence.sentence} variants={cardEnter} exit="exit" layout>
      <SentenceCard {...sentence} />
    </motion.li>
  ));

  const words = wordList.map((word) => (
    <motion.li
      key={word.id ?? word.kanji_full ?? word.hiragana_full}
      variants={cardEnter}
      exit="exit"
      layout
    >
      <WordCard {...word} />
    </motion.li>
  ));

  const kanji = kanjiList.map((entry) => (
    <motion.li key={entry.kanji} variants={cardEnter} exit="exit" layout>
      <KanjiCard {...entry} />
    </motion.li>
  ));

  return (
    <div className={styles.page}>
      <AppNav />
      <Search />

      <div className={styles.lists}>
        <CardList loading={sentencePending} listWidth={1000} className={styles.sentenceColumn}>
          {sentences}
        </CardList>
        <CardList
          loading={wordsPending || kanjiPending}
          listWidth={600}
          className={styles.wordColumn}
        >
          {kanji}
          {inspectedWord ? (
            <motion.li
              key={inspectedWord.id ?? inspectedWord.hiragana_full}
              variants={cardEnter}
              exit="exit"
              layout
            >
              <WordInspector word={inspectedWord} />
            </motion.li>
          ) : (
            words
          )}
        </CardList>
      </div>
    </div>
  );
}
