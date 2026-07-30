'use client';

import { useEffect, useState, type FC, type PropsWithChildren } from 'react';
import { useUnit } from 'effector-react';

import { type UserProfile } from '@/shared/api/profile';
import { LocaleProvider } from '@/shared/i18n';
import { ProfileProvider } from '@/shared/profile/context';
import { fetchCurrentUserFx } from '@/stores/auth';
import { $userProfile, profileHydrated } from '@/stores/userProfile';
import { ThemeProvider } from './ui/ThemeProvider';

interface ProvidersProps {
  /** Profile resolved server-side from the cookie, or Accept-Language on a first visit. */
  initialProfile: UserProfile;
}

/**
 * The one place the app bootstraps.
 *
 * Before hydration the profile comes from `initialProfile` — a prop, so the
 * server never writes an effector store. Module-level stores are shared by
 * every concurrent request in the Node process; seeding one during SSR would
 * leak a user's language into somebody else's HTML. After mount the store takes
 * over so preference changes propagate.
 *
 * The session lookup lives here too. It previously ran in both `page.tsx` and
 * `AuthGate`, which raced each other on every load of `/study` and `/dictionary`.
 */
export const Providers: FC<PropsWithChildren<ProvidersProps>> = ({ initialProfile, children }) => {
  const storedProfile = useUnit($userProfile);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    profileHydrated(initialProfile);
    setHydrated(true);
    fetchCurrentUserFx();
    // Bootstrap runs once; later profile changes flow through the store.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // First client render must match the server byte-for-byte, so it reads the
  // same prop the server did rather than the still-unseeded store.
  const profile = hydrated ? storedProfile : initialProfile;

  return (
    <ProfileProvider profile={profile}>
      <LocaleProvider locale={profile.uiLocale}>
        <ThemeProvider>{children}</ThemeProvider>
      </LocaleProvider>
    </ProfileProvider>
  );
};
