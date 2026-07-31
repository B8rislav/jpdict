'use client';

import { AppHeader, Brand, Button, NavLink, SegmentedControl } from 'designoslav';
import Link from 'next/link';
import { type FC } from 'react';

import { type Language } from '@/shared/api/types';
import { useT } from '@/shared/i18n';
import { BRAND_MARK, BRAND_SUBTITLE, BRAND_WORDMARK } from '../constants';
import { GearIcon } from './GearIcon';
import styles from './AppNavView.module.css';

export type AppNavViewProps = {
  selectedLanguage: Language | null;
  isAuthenticated: boolean;
  /** Route the user is on, so the matching link can mark itself current. */
  pathname: string;
  onSelectLanguage: (language: Language) => void;
  onSignIn: () => void;
  onSignOut: () => void;
};

export const AppNavView: FC<AppNavViewProps> = ({
  selectedLanguage,
  isAuthenticated,
  pathname,
  onSelectLanguage,
  onSignIn,
  onSignOut,
}) => {
  const t = useT();

  return (
    <AppHeader
      sticky
      navLabel={t('ui', 'nav_aria_label')}
      brand={
        <Brand
          as={Link}
          href="/"
          mark={BRAND_MARK}
          wordmark={BRAND_WORDMARK}
          subtitle={BRAND_SUBTITLE}
        />
      }
      center={
        <SegmentedControl
          aria-label={t('ui', 'lang_switch_aria')}
          options={[
            { value: 'jp', label: t('ui', 'lang_jp_native') },
            { value: 'cn', label: t('ui', 'lang_cn_native') },
          ]}
          // No language chosen yet: pass a value no segment owns, so none reads as active.
          value={selectedLanguage ?? ('' as Language)}
          onChange={onSelectLanguage}
        />
      }
      nav={
        <>
          <NavLink as={Link} href="/" active={pathname === '/'}>
            {t('ui', 'nav_parse')}
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink as={Link} href="/dictionary" active={pathname === '/dictionary'}>
                {t('ui', 'nav_my_dictionary')}
              </NavLink>
              <NavLink as={Link} href="/study" active={pathname === '/study'}>
                {t('ui', 'nav_study')}
              </NavLink>
            </>
          )}
        </>
      }
      actions={
        <>
          <Link href="/settings" className={styles.settings} aria-label={t('ui', 'nav_settings')}>
            <GearIcon />
          </Link>
          {isAuthenticated ? (
            <Button size="m" variant="secondary" onClick={onSignOut}>
              {t('ui', 'nav_logout')}
            </Button>
          ) : (
            <Button size="m" variant="primary" onClick={onSignIn}>
              {t('ui', 'nav_login')}
            </Button>
          )}
        </>
      }
    />
  );
};
