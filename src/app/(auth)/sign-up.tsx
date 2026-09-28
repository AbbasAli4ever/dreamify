import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, Text, TextInput } from 'react-native';

import { AuthField } from '@/components/auth/auth-field';
import { AuthShell } from '@/components/auth/auth-shell';
import { FormMessage } from '@/components/auth/form-message';
import { GoogleButton } from '@/components/auth/google-button';
import { OrDivider } from '@/components/auth/or-divider';
import { PillButton } from '@/components/ui/pill-button';
import { Meta } from '@/components/ui/typography';
import { cleanEmail, isEmail, MIN_PASSWORD } from '@/lib/auth-form';
import { authMessage } from '@/lib/backend/auth';
import { useAuth } from '@/providers/auth-provider';

// A2 Sign up — name, email, password, or Google. New accounts go on to onboarding.
export default function SignUpScreen() {
  const { signUp, signInWithGoogle, resendConfirmation } = useAuth();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<'email' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  /** Set when the project requires email confirmation: we show "check your inbox". */
  const [sentTo, setSentTo] = useState<string | null>(null);

  const emailInvalid = !!email && !isEmail(email);
  const passwordShort = !!password && password.length < MIN_PASSWORD;
  const canSubmit = !!name.trim() && isEmail(email) && password.length >= MIN_PASSWORD;

  async function submit() {
    if (!canSubmit || busy) return;
    setError(null);
    setBusy('email');
    try {
      const needsConfirmation = await signUp(name, cleanEmail(email), password);
      if (needsConfirmation) setSentTo(cleanEmail(email));
      // Otherwise we're signed in and the route guards open onboarding.
    } catch (e) {
      setError(authMessage(e));
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
    if (!sentTo) return;
    try {
      await resendConfirmation(sentTo);
      setNotice('Sent again. It can take a minute to arrive.');
    } catch (e) {
      setNotice(authMessage(e));
    }
  }

  if (sentTo) {
    return (
      <AuthShell
        title="Check your *inbox*."
        subtitle={`We sent a link to ${sentTo}. Open it on this phone to finish creating your account.`}
      >
        <FormMessage tone="info">{notice}</FormMessage>
        <PillButton label="Go to sign in" onPress={() => router.replace('/sign-in')} />
        <PillButton label="Resend link" variant="ghost" onPress={resend} />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Start your *dream world*."
      subtitle="Your dreams stay private to your account."
      footer={
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/sign-in')}
          hitSlop={8}
          className="active:opacity-70"
        >
          <Text className="text-body text-paper/60">
            Already have an account? <Text className="font-display-semibold text-paper">Sign in</Text>
          </Text>
        </Pressable>
      }
    >
      <GoogleButton onPress={google} busy={busy === 'google'} disabled={busy === 'email'} />
      <OrDivider />

      <AuthField
        label="Name"
        value={name}
        onChangeText={setName}
        placeholder="What should we call you?"
        autoCapitalize="words"
        autoComplete="name"
        textContentType="givenName"
        maxLength={40}
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        submitBehavior="submit"
      />
      <AuthField
        ref={emailRef}
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
        placeholder={`At least ${MIN_PASSWORD} characters`}
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={submit}
        invalid={passwordShort}
      />
      {passwordShort ? (
        <Meta className="-mt-2 px-1">Use at least {MIN_PASSWORD} characters.</Meta>
      ) : null}

      <FormMessage>{error}</FormMessage>

      <PillButton
        label="Create account"
        onPress={submit}
        busy={busy === 'email'}
        disabled={!canSubmit || busy === 'google'}
        className="mt-2"
      />
    </AuthShell>
  );
}
