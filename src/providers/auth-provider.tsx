import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react';

import { USER } from '@/constants/user';
import * as auth from '@/lib/backend/auth';
import { setShareDreams } from '@/lib/backend/kindred-api';
import { backendEnabled, supabase } from '@/lib/backend/supabase';
import { hasOnboarded, setOnboarded } from '@/lib/storage';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

type AuthContextValue = {
  status: AuthStatus;
  user: auth.AuthUser | null;
  /** Real accounts (Supabase) or the local demo user (no .env). */
  backend: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  /** Resolves to true when the user must confirm their email before signing in. */
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  /** Resolves to false when the user closed the Google window. */
  signInWithGoogle: () => Promise<boolean>;
  resendConfirmation: (email: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  setName: (name: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  /** Kindred dreamers on/off (sharing and seeing go together). */
  setShareDreams: (on: boolean) => Promise<void>;
  signOut: () => Promise<void>;
};

type State = { status: AuthStatus; user: auth.AuthUser | null };

const LOCAL_NAME_KEY = 'dreamify.localName';
const LOCAL_SHARE_KEY = 'dreamify.shareDreams';

const AuthContext = createContext<AuthContextValue | null>(null);

function fromSession(session: Session | null): State {
  return session
    ? { status: 'signedIn', user: auth.toAuthUser(session.user) }
    : { status: 'signedOut', user: null };
}

// Who is signed in. With Supabase configured this is a real account (email + password
// or Google); without it, a local demo user so the app still runs on mock data.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ status: 'loading', user: null });

  useEffect(() => {
    if (!supabase) {
      Promise.all([
        hasOnboarded(),
        AsyncStorage.getItem(LOCAL_NAME_KEY).catch(() => null),
        AsyncStorage.getItem(LOCAL_SHARE_KEY).catch(() => null),
      ]).then(([onboarded, name, share]) =>
        setState({
          status: 'signedIn',
          user: {
            id: 'local',
            email: '',
            name: name || USER.name,
            provider: 'email',
            onboarded,
            shareDreams: share !== '0',
          },
        }),
      );
      return;
    }

    const client = supabase;
    // Fires INITIAL_SESSION first (the saved session, if any), then every sign-in/out,
    // token refresh and profile update.
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      // Earlier builds signed people in anonymously; those sessions are not accounts.
      if (session?.user.is_anonymous) {
        setState({ status: 'signedOut', user: null });
        // Don't call Supabase from inside this callback (it can deadlock); defer it.
        setTimeout(() => client.auth.signOut({ scope: 'local' }).catch(() => {}), 0);
        return;
      }
      setState(fromSession(session));
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const patchUser = (p: Partial<auth.AuthUser>) =>
      setState((s) => (s.user ? { ...s, user: { ...s.user, ...p } } : s));

    return {
      ...state,
      backend: backendEnabled,
      signIn: auth.signInWithEmail,
      signUp: auth.signUpWithEmail,
      signInWithGoogle: auth.signInWithGoogle,
      resendConfirmation: auth.resendConfirmation,
      sendPasswordReset: auth.sendPasswordReset,
      updatePassword: auth.updatePassword,

      setName: async (raw) => {
        const name = raw.trim();
        if (!name) return;
        patchUser({ name: name.split(/\s+/)[0] });
        if (backendEnabled) await auth.updateProfile({ display_name: name });
        else await AsyncStorage.setItem(LOCAL_NAME_KEY, name).catch(() => {});
      },

      completeOnboarding: async () => {
        patchUser({ onboarded: true });
        if (backendEnabled) await auth.updateProfile({ onboarded: true });
        else await setOnboarded(true);
      },

      setShareDreams: async (on) => {
        patchUser({ shareDreams: on });
        if (!backendEnabled) {
          await AsyncStorage.setItem(LOCAL_SHARE_KEY, on ? '1' : '0').catch(() => {});
          return;
        }
        try {
          await setShareDreams(on);
        } catch (e) {
          patchUser({ shareDreams: !on });
          throw e;
        }
      },

      signOut: async () => {
        if (backendEnabled) {
          await auth.signOut();
          return;
        }
        // Demo mode has no account: "signing out" resets the device to a first launch.
        await Promise.all([
          setOnboarded(false),
          AsyncStorage.multiRemove([LOCAL_NAME_KEY, LOCAL_SHARE_KEY]),
        ]);
        setState({
          status: 'signedIn',
          user: {
            id: 'local',
            email: '',
            name: USER.name,
            provider: 'email',
            onboarded: false,
            shareDreams: true,
          },
        });
      },
    };
  }, [state]);

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
