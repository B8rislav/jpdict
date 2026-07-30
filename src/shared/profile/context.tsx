'use client';

import { createContext, useContext, type ReactNode } from 'react';

import { DEFAULT_PROFILE, type UserProfile } from '@/shared/api/profile';

const ProfileContext = createContext<UserProfile>(DEFAULT_PROFILE);

/**
 * The active profile, as React context rather than a store subscription.
 *
 * Effector stores can't carry this through SSR: they're module-level
 * singletons shared by every concurrent request in the Node process, so seeding
 * one server-side would leak a user's language into another user's HTML.
 * Context is per-render-tree and has no such problem, and it keeps `ui/`
 * components free of `effector-react` imports.
 */
export function ProfileProvider({
  profile,
  children,
}: {
  profile: UserProfile;
  children: ReactNode;
}) {
  return <ProfileContext.Provider value={profile}>{children}</ProfileContext.Provider>;
}

export function useProfile(): UserProfile {
  return useContext(ProfileContext);
}
