'use client';

import { useUnit } from 'effector-react';
import { $userProfile, setSelectedLanguage, setShowFurigana, setShowPinyin, type Language } from '@/stores/userProfile';
import { $searchHistory, clearHistoryFx } from '@/features/SearchHistory/model';
import { Button, Switch, Text } from '@gravity-ui/uikit';
import Link from 'next/link';
import styles from './page.module.css';

export default function Settings() {
  const { selectedLanguage, showFurigana, showPinyin } = useUnit($userProfile);
  const searchHistory = useUnit($searchHistory);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/" className={styles.back}>← Назад</Link>
        <Text variant="display-1">Настройки</Text>
      </div>

      <div className={styles.section}>
        <Text variant="subheader-2">Язык</Text>
        <div className={styles.languageButtons}>
          {(['jp', 'cn'] as Language[]).map((lang) => (
            <Button
              key={lang}
              view={selectedLanguage === lang ? 'normal' : 'outlined'}
              onClick={() => setSelectedLanguage(lang)}
            >
              {lang === 'jp' ? 'Японский' : 'Китайский'}
            </Button>
          ))}
        </div>
      </div>

      {selectedLanguage === 'jp' && (
        <div className={styles.section}>
          <Text variant="subheader-2">Фуригана</Text>
          <Switch checked={showFurigana} onUpdate={setShowFurigana} />
        </div>
      )}

      {selectedLanguage === 'cn' && (
        <div className={styles.section}>
          <Text variant="subheader-2">Пиньинь</Text>
          <Switch checked={showPinyin} onUpdate={setShowPinyin} />
        </div>
      )}

      <div className={styles.section}>
        <Text variant="subheader-2">История поиска</Text>
        <Text variant="body-2">{searchHistory.length} записей</Text>
        <Button view="outlined-danger" onClick={() => clearHistoryFx()}>
          Очистить историю
        </Button>
      </div>
    </div>
  );
}
