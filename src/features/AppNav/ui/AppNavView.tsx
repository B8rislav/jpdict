'use client';

import { Switch, Text } from '@gravity-ui/uikit';
import { Button } from 'designoslav';
import { motion } from 'motion/react';
import Link from 'next/link';
import { type FC } from 'react';

import { type Language } from '@/shared/api/types';
import { LOCALES, useT, type Locale } from '@/shared/i18n';
import { springOrInstant, useReducedMotion } from '@/shared/motion';
import styles from './AppNavView.module.css';

const LANGUAGES: Language[] = ['jp', 'cn'];

export type AppNavViewProps = {
  selectedLanguage: Language | null;
  uiLocale: Locale;
  showFurigana: boolean;
  showPinyin: boolean;
  isAuthenticated: boolean;
  /** Signed-in user's display name or email, or null when signed out. */
  userLabel: string | null;
  onSelectLanguage: (language: Language) => void;
  onSelectLocale: (locale: Locale) => void;
  onToggleFurigana: (value: boolean) => void;
  onTogglePinyin: (value: boolean) => void;
  onSignIn: () => void;
  onSignOut: () => void;
};

/** Sliding indicator behind the active button in a segmented group. */
const ActivePill: FC<{ layoutId: string; reduced: boolean | null }> = ({ layoutId, reduced }) => (
  <motion.span
    layoutId={layoutId}
    className={styles.navPill}
    transition={springOrInstant(reduced)}
  />
);

export const AppNavView: FC<AppNavViewProps> = ({
  selectedLanguage,
  uiLocale,
  showFurigana,
  showPinyin,
  isAuthenticated,
  userLabel,
  onSelectLanguage,
  onSelectLocale,
  onToggleFurigana,
  onTogglePinyin,
  onSignIn,
  onSignOut,
}) => {
  const t = useT();
  const reduced = useReducedMotion();

  return (
    <nav className={styles.nav}>
      {LANGUAGES.map((language) => (
        <span key={language} className={styles.navBtnWrap}>
          <Button
            size="m"
            variant={selectedLanguage === language ? 'primary' : 'secondary'}
            onClick={() => onSelectLanguage(language)}
          >
            {t('ui', language === 'jp' ? 'lang_jp' : 'lang_cn')}
          </Button>
          {selectedLanguage === language && <ActivePill layoutId="langPill" reduced={reduced} />}
        </span>
      ))}

      <div className={styles.navDivider} />

      {LOCALES.map((locale) => (
        <span key={locale} className={styles.navBtnWrap}>
          <Button
            size="m"
            variant={uiLocale === locale ? 'primary' : 'secondary'}
            onClick={() => onSelectLocale(locale)}
          >
            {locale.toUpperCase()}
          </Button>
          {uiLocale === locale && <ActivePill layoutId="localePill" reduced={reduced} />}
        </span>
      ))}

      {selectedLanguage === 'jp' && (
        <>
          <div className={styles.navDivider} />
          <label className={styles.toggleRow}>
            <Switch checked={showFurigana} onUpdate={onToggleFurigana} />
            <Text variant="body-2">{t('ui', 'furigana')}</Text>
          </label>
        </>
      )}

      {selectedLanguage === 'cn' && (
        <>
          <div className={styles.navDivider} />
          <label className={styles.toggleRow}>
            <Switch checked={showPinyin} onUpdate={onTogglePinyin} />
            <Text variant="body-2">{t('ui', 'pinyin_label')}</Text>
          </label>
        </>
      )}

      <div className={styles.navSpacer} />

      {isAuthenticated && (
        <>
          <Link href="/dictionary" className={styles.navLink}>
            <Text variant="body-2">{t('ui', 'nav_my_dictionary')}</Text>
          </Link>
          <Link href="/study" className={styles.navLink}>
            <Text variant="body-2">{t('ui', 'nav_study')}</Text>
          </Link>
        </>
      )}

      <div className={styles.navDivider} />

      {isAuthenticated ? (
        <>
          {userLabel && (
            <Text variant="body-2" color="secondary">
              {userLabel}
            </Text>
          )}
          <Button size="m" variant="secondary" onClick={onSignOut}>
            {t('ui', 'nav_logout')}
          </Button>
        </>
      ) : (
        <Button size="m" variant="primary" onClick={onSignIn}>
          {t('ui', 'nav_login')}
        </Button>
      )}
    </nav>
  );
};
