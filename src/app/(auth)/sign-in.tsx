import { Link, router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { AuthField } from '@/components/auth/auth-field';
import { AuthShell } from '@/components/auth/auth-shell';
import { FormMessage } from '@/components/auth/form-message';
import { GoogleButton } from '@/components/auth/google-button';
import { OrDivider } from '@/components/auth/or-divider';
import { PillButton } from '@/components/ui/pill-button';
import { cleanEmail, isEmail } from '@/lib/auth-form';
import { authMessage } from '@/lib/backend/auth';
import { useAuth } from '@/providers/auth-provider';

// A1 Sign in — email + password, or Google.
export default function SignInScreen() {
  const { signIn, signInWithGoogle, resendConfirmation } = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<'email' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [unconfirmed, setUnconfirmed] = useState(false);

  const emailInvalid = !!email && !isEmail(email);
  const canSubmit = isEmail(email) && password.length > 0;

  async function submit() {
    if (!canSubmit || busy) return;
    setError(null);
    setNotice(null);
    setBusy('email');
    try {
      await signIn(cleanEmail(email), password);
      // Signed in: the route guards move on to onboarding or Home.
    } catch (e) {
      const msg = authMessage(e);
      setUnconfirmed(msg.startsWith('Confirm your email'));
      setError(msg);
    } finally {
      setBusy(null);
    }
  }

  async function google() {
    setError(null);
    setBusy('google');
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(authMessage(e));
    } finally {
      setBusy(null);
    }
  }

  async function resend() {
    try {
      await resendConfirmation(cleanEmail(email));
      setError(null);
      setUnconfirmed(false);
      setNotice(`We sent a new link to ${cleanEmail(email)}.`);
    } catch (e) {
      setError(authMessage(e));
    }
  }

  return (
    <AuthShell
      title="Welcome *back*."
      subtitle="Sign in to open your dream world."
      footer={
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/sign-up')}
          hitSlop={8}
          className="active:opacity-70"
        >
          <Text className="text-body text-paper/60">
            New to Dreamify? <Text className="font-display-semibold text-paper">Create an account</Text>
          </Text>
        </Pressable>
      }
    >
      <GoogleButton onPress={google} busy={busy === 'google'} disabled={busy === 'email'} />
      <OrDivider />

      <AuthField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        submitBehavior="submit"
        invalid={emailInvalid}
      />
      <AuthField
        ref={passwordRef}
        label="Password"
        password
        value={password}
        onChangeText={setPassword}
        placeholder="Your password"
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={submit}
      />

      <View className="items-end">
        <Link
          href={{ pathname: '/forgot-password', params: email ? { email: cleanEmail(email) } : {} }}
          className="py-1 text-label font-medium text-paper/70"
        >
          Forgot password?
        </Link>
      </View>

      <FormMessage>{error}</FormMessage>
      <FormMessage tone="info">{notice}</FormMessage>
      {unconfirmed ? (
        <PillButton label="Resend confirmation link" variant="ghost" onPress={resend} />
      ) : null}

      <PillButton
        label="Sign in"
        onPress={submit}
        busy={busy === 'email'}
        disabled={!canSubmit || busy === 'google'}
        className="mt-2"
      />
    </AuthShell>
  );
}
