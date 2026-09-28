import type { User } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { supabase } from '@/lib/backend/supabase';

// Supabase Auth: email + password and Google (OAuth in the system browser, PKCE).
// Supabase issues the JWT; the client stores and refreshes it, and every request
// (Postgres RLS, Storage, Edge Functions) is made as that user.

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'email' | 'google';
  onboarded: boolean;
  /** Kindred dreamers: share an anonymous overview of each dream, and see others'. On unless turned off. */
  shareDreams: boolean;
};

function client() {
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
}

/** Where OAuth and email links send the user back: exp://…/--/auth/callback in Expo Go. */
export function redirectUrl(next?: string) {
  return Linking.createURL('/auth/callback', next ? { queryParams: { next } } : undefined);
}

/**
 * Where Google sends the user back. Supabase rejects redirect URLs whose host is a LAN IP
 * (Expo Go's `exp://192.168.x.x:8081/…`) and silently falls back to the Site URL, which
 * left the sign-in sheet spinning. The app scheme has no host, so it is always allowed,
 * and iOS's auth session catches it itself, even in Expo Go where the scheme isn't installed.
 */
function oauthRedirectUrl() {
  if (Platform.OS === 'web') return redirectUrl();
  const scheme = Constants.expoConfig?.scheme;
  return `${Array.isArray(scheme) ? scheme[0] : (scheme ?? 'dreamifyapp')}://auth/callback`;
}

export function toAuthUser(user: User): AuthUser {
  const meta = user.user_metadata ?? {};
  const email = user.email ?? '';
  // `display_name` is ours (sign-up form, Settings). Google's `full_name` is refreshed
  // on every Google sign-in, so an edited name must live under a separate key.
  const name = meta.display_name || meta.full_name || meta.name || email.split('@')[0] || 'Dreamer';
  return {
    id: user.id,
    email,
    name: String(name).trim().split(/\s+/)[0],
    avatarUrl: meta.avatar_url || meta.picture || undefined,
    provider: user.app_metadata?.provider === 'google' ? 'google' : 'email',
    onboarded: meta.onboarded === true,
    shareDreams: meta.share_dreams !== false,
  };
}

/** Maps Supabase Auth errors to calm, human copy. */
export function authMessage(e: unknown) {
  const raw = e instanceof Error ? e.message : String(e);
  const m = raw.toLowerCase();
  if (m.includes('invalid login credentials')) return "That email and password don't match.";
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'An account with this email already exists. Sign in instead.';
  if (m.includes('email not confirmed'))
    return 'Confirm your email first. The link is in your inbox.';
  if (m.includes('password should be') || m.includes('weak password'))
    return 'Choose a stronger password (at least 8 characters).';
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Too many attempts. Wait a minute and try again.';
  if (m.includes('not authorized') && m.includes('email'))
    return "This project can't send email to that address yet. Ask the admin to set up SMTP.";
  if (m.includes('network') || m.includes('fetch')) return 'No connection. Check your internet.';
  if (m.includes('provider is not enabled') || m.includes('unsupported provider'))
    return 'Google sign-in is not set up for this project yet.';
  return raw || 'Something went wrong. Try again.';
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await client().auth.signInWithPassword({ email, password });
  if (error) throw error;
}

/** Returns true when the project requires email confirmation (no session yet). */
export async function signUpWithEmail(name: string, email: string, password: string) {
  const { data, error } = await client().auth.signUp({
    email,
    password,
    options: { data: { display_name: name.trim() }, emailRedirectTo: redirectUrl() },
  });
  if (error) throw error;
  // Supabase hides "already registered" when confirmations are on: it returns a user with no identities.
  if (data.user && data.user.identities?.length === 0) throw new Error('User already registered');
  return !data.session;
}

export async function resendConfirmation(email: string) {
  const { error } = await client().auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: redirectUrl() },
  });
  if (error) throw error;
}

export async function sendPasswordReset(email: string) {
  const { error } = await client().auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl('reset-password'),
  });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { error } = await client().auth.updateUser({ password });
  if (error) throw error;
}

export async function updateProfile(data: { display_name?: string; onboarded?: boolean }) {
  const { error } = await client().auth.updateUser({ data });
  if (error) throw error;
}

// A code can arrive twice on Android (auth session result + deep link), but it is single use.
const exchanges = new Map<string, Promise<void>>();

/** Turns the one-time `code` from an OAuth / email redirect into a session. */
export function exchangeCode(code: string) {
  let job = exchanges.get(code);
  if (!job) {
    job = client()
      .auth.exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) throw error;
      });
    exchanges.set(code, job);
  }
  return job;
}

/** Reads `code` / `error_description` from a redirect URL (query or fragment). */
export function parseRedirect(url: string) {
  const params: Record<string, string> = {};
  const parts = url.split(/[?#]/).slice(1).join('&');
  for (const pair of parts.split('&')) {
    const [k, v = ''] = pair.split('=');
    if (k) params[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' '));
  }
  return params;
}

/** Google sign-in. Returns false if the user closed the browser. */
export async function signInWithGoogle() {
  const redirectTo = oauthRedirectUrl();
  const web = Platform.OS === 'web';
  const { data, error } = await client().auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: !web, queryParams: { prompt: 'select_account' } },
  });
  if (error) throw error;
  // Web: the page itself goes to Google and comes back to /auth/callback.
  if (web) return true;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return false;
  const params = parseRedirect(result.url);
  if (params.error_description || params.error)
    throw new Error(params.error_description || params.error);
  if (!params.code) throw new Error('Google did not return a sign-in code.');
  await exchangeCode(params.code);
  return true;
}

export async function signOut() {
  await client().auth.signOut({ scope: 'local' });
}
