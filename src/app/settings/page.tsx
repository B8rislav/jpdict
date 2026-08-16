'use client';

import { useUnit } from 'effector-react';
import { type Language } from '@/shared/api/types';
import {
  setDailyGoal,
  setSelectedLanguage,
  setShowFurigana,
  setShowPinyin,
  setUiLocale,
} from '@/stores/userProfile';
import { $searchHistory, clearHistoryFx } from '@/features/SearchHistory/model';
import { Switch, Text } from '@gravity-ui/uikit';
import { Button, SegmentedControl } from 'designoslav';
import Link from 'next/link';
import { LOCALES, useT } from '@/shared/i18n';
import styles from './page.module.css';
import { useProfile } from '@/shared/profile/context';

export default function Settings() {
  const t = useT();
  const { dailyGoal, selectedLanguage, showFurigana, showPinyin, uiLocale } = useProfile();
  const searchHistory = useUnit($searchHistory);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/" className={styles.back}>
          {t('ui', 'settings_back')}
        </Link>
        <Text variant="display-1">{t('ui', 'settings_title')}</Text>
      </div>

      {/* The interface language lives here now: the redesigned header has no room for a
          locale switcher, and this page never had one — so it was unreachable. */}
      <div className={styles.section}>
        <Text variant="subheader-2">{t('ui', 'settings_ui_lang_section')}</Text>
        <SegmentedControl
          aria-label={t('ui', 'settings_ui_lang_section')}
          options={LOCALES.map((locale) => ({ value: locale, label: locale.toUpperCase() }))}
          value={uiLocale}
          onChange={setUiLocale}
        />
      </div>

      <div className={styles.section}>
        <Text variant="subheader-2">{t('ui', 'settings_lang_section')}</Text>
        <div className={styles.languageButtons}>
          {(['jp', 'cn'] as Language[]).map((lang) => (
            <Button
              key={lang}
              variant={selectedLanguage === lang ? 'primary' : 'secondary'}
              onClick={() => setSelectedLanguage(lang)}
            >
              {t('ui', lang === 'jp' ? 'lang_jp' : 'lang_cn')}
            </Button>
          ))}
        </div>
      </div>

      {selectedLanguage === 'jp' && (
        <div className={styles.section}>
          <Text variant="subheader-2">{t('ui', 'furigana')}</Text>
          <Switch checked={showFurigana} onUpdate={setShowFurigana} />
        </div>
      )}

      {selectedLanguage === 'cn' && (
        <div className={styles.section}>
          <Text variant="subheader-2">{t('ui', 'pinyin_label')}</Text>
          <Switch checked={showPinyin} onUpdate={setShowPinyin} />
        </div>
      )}

      <div className={styles.section}>
        <Text variant="subheader-2">{t('review', 'settings_daily_goal')}</Text>
        <Text variant="body-2" color="secondary">
          {t('review', 'settings_daily_goal_hint')}
        </Text>
        {/* Bounds match the backend's validation (1–500), so the control can't
            offer a value the API would reject. */}
        <input
          className={styles.goalInput}
          type="number"
          min={1}
          max={500}
          step={1}
          value={dailyGoal}
          aria-label={t('review', 'settings_daily_goal')}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isFinite(next) && next >= 1) setDailyGoal(next);
          }}
        />
      </div>

      <div className={styles.section}>
        <Text variant="subheader-2">{t('ui', 'settings_history_section')}</Text>
        <Text variant="body-2">
          {searchHistory.length} {t('ui', 'settings_history_count')}
        </Text>
        <Button variant="accent" onClick={() => clearHistoryFx()}>
          {t('ui', 'settings_clear_history')}
        </Button>
      </div>
    </div>
  );
}
