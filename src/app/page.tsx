'use client';

import { Button, Switch, Text } from '@gravity-ui/uikit';
import { useList, useUnit } from 'effector-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { $kanji, fetchKanjiFx } from '@/features/KanjiCard/model';
import { KanjiCard } from '@/features/KanjiCard/KanjiCard';
import { loadDictionaryFx } from '@/features/Dictionary';
import { Search } from '@/features/Search';
import { $words, fetchWordsFx, WordCard } from '@/features/WordCard';
import { $sentences, fetchSentenceFx, SentenceCard } from '@/features/Sentence';
import { $inspectedWord, WordInspector } from '@/features/WordInspector';
import { AuthModal } from '@/features/Auth/AuthModal';
import { CardList } from '@/shared/ui/CardList';
import { type Language } from '@/shared/api/types';
import { t } from '@/shared/i18n';
import {
  $userProfile,
  loadUserProfile,
  setSelectedLanguage,
  setShowFurigana,
  setShowPinyin,
  setUiLocale,
} from '@/stores/userProfile';
import { $isAuthenticated, $user, logoutFx, refreshFx } from '@/stores/auth';

import styles from './page.module.css';

const LANGUAGES: Language[] = ['jp', 'cn'];

export default function Home() {
  const { selectedLanguage, showFurigana, showPinyin, uiLocale } = useUnit($userProfile);
  const sentencePending = useUnit(fetchSentenceFx.pending);
  const wordsPending = useUnit(fetchWordsFx.pending);
  const kanjiPending = useUnit(fetchKanjiFx.pending);
  const inspectedWord = useUnit($inspectedWord);
  const isAuthenticated = useUnit($isAuthenticated);
  const user = useUnit($user);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    loadUserProfile();
    loadDictionaryFx();
    refreshFx();
  }, []);

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
      <nav className={styles.nav}>
        {LANGUAGES.map((value) => (
          <Button
            key={value}
            size="s"
            view={selectedLanguage === value ? 'normal' : 'outlined'}
            onClick={() => setSelectedLanguage(value)}
          >
            {t('ui', value === 'jp' ? 'lang_jp' : 'lang_cn')}
          </Button>
        ))}

        <div className={styles.navDivider} />

        {(['ru', 'en'] as const).map(locale => (
          <Button
            key={locale}
            size="s"
            view={uiLocale === locale ? 'normal' : 'outlined'}
            onClick={() => setUiLocale(locale)}
          >
            {locale.toUpperCase()}
          </Button>
        ))}

        {selectedLanguage === 'jp' && (
          <>
            <div className={styles.navDivider} />
            <label className={styles.toggleRow}>
              <Switch checked={showFurigana} onUpdate={setShowFurigana} />
              <Text variant="body-2">{t('ui', 'furigana')}</Text>
            </label>
          </>
        )}

        {selectedLanguage === 'cn' && (
          <>
            <div className={styles.navDivider} />
            <label className={styles.toggleRow}>
              <Switch checked={showPinyin} onUpdate={setShowPinyin} />
              <Text variant="body-2">{t('ui', 'pinyin_label')}</Text>
            </label>
          </>
        )}

        <div className={styles.navSpacer} />

        {isAuthenticated && (
          <Link
            href="/dictionary"
            style={{ textDecoration: 'none', color: 'var(--g-color-text-secondary)' }}
          >
            <Text variant="body-2">{t('ui', 'nav_my_dictionary')}</Text>
          </Link>
        )}

        <div className={styles.navDivider} />

        {isAuthenticated ? (
          <>
            {user && (
              <Text variant="body-2" color="secondary">
                {user.email}
              </Text>
            )}
            <Button size="s" view="outlined" onClick={() => logoutFx()}>
              {t('ui', 'nav_logout')}
            </Button>
          </>
        ) : (
          <Button size="s" view="action" onClick={() => setAuthOpen(true)}>
            {t('ui', 'nav_login')}
          </Button>
        )}
      </nav>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />

      <Search />

      <div className={styles.lists}>
        <CardList loading={sentencePending} listWidth={1000}>
          {sentences}
        </CardList>
        <CardList loading={wordsPending || kanjiPending} listWidth={600}>
          {kanji}
          {inspectedWord ? (
            <li key={inspectedWord.id ?? inspectedWord.hiragana_full}>
              <WordInspector word={inspectedWord} />
            </li>
          ) : (
            words
          )}
        </CardList>
      </div>
    </div>
  );
}
