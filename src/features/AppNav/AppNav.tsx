'use client';

import { useUnit } from 'effector-react';
import { type FC, useState } from 'react';

import { AuthModal } from '@/features/Auth/AuthModal';
import { useProfile } from '@/shared/profile/context';
import { $isAuthenticated, $user, logoutFx } from '@/stores/auth';
import {
  setSelectedLanguage,
  setShowFurigana,
  setShowPinyin,
  setUiLocale,
} from '@/stores/userProfile';
import { AppNavView } from './ui/AppNavView';

/**
 * The app's top bar. Lives in its own feature rather than inside `page.tsx`,
 * where it was ~100 lines of the home page and unavailable to every other route.
 */
export const AppNav: FC = () => {
  const { selectedLanguage, showFurigana, showPinyin, uiLocale } = useProfile();
  const isAuthenticated = useUnit($isAuthenticated);
  const user = useUnit($user);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <AppNavView
        selectedLanguage={selectedLanguage}
        uiLocale={uiLocale}
        showFurigana={showFurigana}
        showPinyin={showPinyin}
        isAuthenticated={isAuthenticated}
        userLabel={user?.name ?? user?.email ?? null}
        onSelectLanguage={setSelectedLanguage}
        onSelectLocale={setUiLocale}
        onToggleFurigana={setShowFurigana}
        onTogglePinyin={setShowPinyin}
        onSignIn={() => setAuthOpen(true)}
        onSignOut={() => logoutFx()}
      />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
};
