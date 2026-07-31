'use client';

import { useUnit } from 'effector-react';
import { usePathname } from 'next/navigation';
import { type FC, useState } from 'react';

import { AuthModal } from '@/features/Auth/AuthModal';
import { useProfile } from '@/shared/profile/context';
import { $isAuthenticated, logoutFx } from '@/stores/auth';
import { setSelectedLanguage } from '@/stores/userProfile';
import { AppNavView } from './ui/AppNavView';

/**
 * The app's top bar, mounted in `src/app/layout.tsx` so every route carries it.
 *
 * The furigana/pinyin toggle used to live here; it now sits in the search band, beside
 * the query it affects. The RU/EN switcher moved to `/settings`, which the gear links to.
 */
export const AppNav: FC = () => {
  const { selectedLanguage } = useProfile();
  const isAuthenticated = useUnit($isAuthenticated);
  const pathname = usePathname();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <AppNavView
        selectedLanguage={selectedLanguage}
        isAuthenticated={isAuthenticated}
        pathname={pathname}
        onSelectLanguage={setSelectedLanguage}
        onSignIn={() => setAuthOpen(true)}
        onSignOut={() => logoutFx()}
      />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
};
