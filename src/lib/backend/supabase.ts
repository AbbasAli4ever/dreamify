import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { authStorage } from '@/lib/backend/auth-storage';
import '@/lib/backend/crypto-polyfill';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * True when Supabase is configured (.env). Without it the app runs on the local
 * sample data + mock AI, so it always works for a demo.
 */
export const backendEnabled = !!(url && key);

export const supabase: SupabaseClient | null = backendEnabled
  ? createClient(url!, key!, {
      auth: {
        storage: authStorage,
        autoRefreshToken: true,
        persistSession: true,
        // PKCE: OAuth and email links come back with a one-time `code` that the
        // /auth/callback route exchanges for a session (see lib/backend/auth.ts).
        flowType: 'pkce',
        detectSessionInUrl: false,
      },
    })
  : null;

// Refresh the session only while the app is in the foreground (Expo guide).
if (supabase && Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
