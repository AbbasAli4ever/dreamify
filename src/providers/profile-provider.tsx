import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ImageSource } from 'expo-image';
import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react';

import { USER } from '@/constants/user';
import { useAuth } from '@/providers/auth-provider';

export type Reminder = { enabled: boolean; hour: number; minute: number };

type ProfileContextValue = {
  /** First name, used in greetings. */
  name: string;
  /** Google photo, the demo photo, or undefined (initials). */
  avatar?: ImageSource | number;
  reminder: Reminder;
  setName: (name: string) => void;
  setReminder: (reminder: Reminder) => void;
  /** Turns the reminder back to its default (on sign out). */
  reset: () => void;
};

const KEY = 'dreamify.profile';
const DEFAULT_REMINDER: Reminder = { enabled: false, hour: 7, minute: 0 };

const ProfileContext = createContext<ProfileContextValue | null>(null);

// Name and photo come from the signed-in account (AuthProvider). The morning
// reminder is a notification on this phone, so it stays on the device.
export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, backend, setName } = useAuth();
  const [reminder, setReminderState] = useState<Reminder>(DEFAULT_REMINDER);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        const saved = raw ? JSON.parse(raw) : null;
        if (saved?.reminder) setReminderState(saved.reminder);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(KEY, JSON.stringify({ reminder })).catch(() => {});
  }, [reminder, loaded]);

  const value = useMemo<ProfileContextValue>(
    () => ({
      name: user?.name ?? '',
      avatar: backend ? (user?.avatarUrl ? { uri: user.avatarUrl } : undefined) : USER.avatar,
      reminder,
      setName: (name) => {
        setName(name).catch(() => {});
      },
      setReminder: setReminderState,
      reset: () => setReminderState(DEFAULT_REMINDER),
    }),
    [user, backend, reminder, setName],
  );

  return <ProfileContext value={value}>{children}</ProfileContext>;
}

export function useProfile() {
  const ctx = use(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>');
  return ctx;
}
