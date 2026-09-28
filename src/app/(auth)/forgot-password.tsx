import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { AuthField } from '@/components/auth/auth-field';
import { AuthShell } from '@/components/auth/auth-shell';
import { FormMessage } from '@/components/auth/form-message';
import { PillButton } from '@/components/ui/pill-button';
import { cleanEmail, isEmail } from '@/lib/auth-form';
import { authMessage } from '@/lib/backend/auth';
import { useAuth } from '@/providers/auth-provider';

// A3 Forgot password — emails a link that opens Reset password in the app.
export default function ForgotPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState(params.email ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function submit() {
    if (!isEmail(email) || busy) return;
    setError(null);
    setBusy(true);
    try {
      await sendPasswordReset(cleanEmail(email));
      setSentTo(cleanEmail(email));
    } catch (e) {
      setError(authMessage(e));
    } finally {
      setBusy(false);
    }
  }

  if (sentTo) {
    return (
      <AuthShell
        title="Check your *inbox*."
        subtitle={`If ${sentTo} has an account, a reset link is on its way. Open it on this phone to choose a new password.`}
      >
        <PillButton label="Back to sign in" onPress={() => router.replace('/sign-in')} />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your *password*?"
      subtitle="Enter your email and we'll send you a link to set a new one."
    >
      <AuthField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="send"
        onSubmitEditing={submit}
        invalid={!!email && !isEmail(email)}
        autoFocus
      />
      <FormMessage>{error}</FormMessage>
      <PillButton
        label="Send reset link"
        onPress={submit}
        busy={busy}
        disabled={!isEmail(email)}
        className="mt-2"
      />
    </AuthShell>
  );
}
