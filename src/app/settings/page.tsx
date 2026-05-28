'use client';

import { useUnit } from 'effector-react';
import { type Language } from '@/shared/api/types';
import {
  $userProfile,
  setSelectedLanguage,
  setShowFurigana,
  setShowPinyin,
} from '@/stores/userProfile';
import { $searchHistory, clearHistoryFx } from '@/features/SearchHistory/model';
import { Button, Switch, Text } from '@gravity-ui/uikit';
import Link from 'next/link';
import { t } from '@/shared/i18n';
import styles from './page.module.css';

export default function Settings() {
  const { selectedLanguage, showFurigana, showPinyin } = useUnit($userProfile);
  const searchHistory = useUnit($searchHistory);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/" className={styles.back}>
          {t('ui', 'settings_back')}
        </Link>
        <Text variant="display-1">{t('ui', 'settings_title')}</Text>
      </div>

      <div className={styles.section}>
        <Text variant="subheader-2">{t('ui', 'settings_lang_section')}</Text>
        <div className={styles.languageButtons}>
          {(['jp', 'cn'] as Language[]).map((lang) => (
            <Button
              key={lang}
              view={selectedLanguage === lang ? 'normal' : 'outlined'}
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
        <Text variant="subheader-2">{t('ui', 'settings_history_section')}</Text>
        <Text variant="body-2">{searchHistory.length} {t('ui', 'settings_history_count')}</Text>
        <Button view="outlined-danger" onClick={() => clearHistoryFx()}>
          {t('ui', 'settings_clear_history')}
        </Button>
      </div>
    </div>
  );
}
