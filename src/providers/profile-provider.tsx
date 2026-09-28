import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react';

import { USER } from '@/constants/user';

export type Reminder = { enabled: boolean; hour: number; minute: number };

type Profile = {
  name: string;
  avatar: number;
  reminder: Reminder;
};

type ProfileContextValue = Profile & {
  setName: (name: string) => void;
  setReminder: (reminder: Reminder) => void;
  /** Back to defaults (used by Sign out until real auth exists). */
  reset: () => void;
};

const KEY = 'dreamify.profile';
const DEFAULTS: Profile = {
  name: USER.name,
  avatar: USER.avatar,
  reminder: { enabled: false, hour: 7, minute: 0 },
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

// The user's name and preferences, saved on the device. Supabase auth replaces this later.
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setProfile((p) => ({ ...p, ...JSON.parse(raw), avatar: USER.avatar }));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const { name, reminder } = profile;
    AsyncStorage.setItem(KEY, JSON.stringify({ name, reminder })).catch(() => {});
  }, [profile, loaded]);

  const value = useMemo<ProfileContextValue>(
    () => ({
      ...profile,
      setName: (name) => setProfile((p) => ({ ...p, name: name.trim() || DEFAULTS.name })),
      setReminder: (reminder) => setProfile((p) => ({ ...p, reminder })),
      reset: () => setProfile(DEFAULTS),
    }),
    [profile],
  );

  return <ProfileContext value={value}>{children}</ProfileContext>;
}

export function useProfile() {
  const ctx = use(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>');
  return ctx;
}
