import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { TextInput } from 'react-native';

import { AuthField } from '@/components/auth/auth-field';
import { AuthShell } from '@/components/auth/auth-shell';
import { FormMessage } from '@/components/auth/form-message';
import { PillButton } from '@/components/ui/pill-button';
import { MIN_PASSWORD } from '@/lib/auth-form';
import { authMessage } from '@/lib/backend/auth';
import { useAuth } from '@/providers/auth-provider';

// A4 Set a new password — after a reset link (signed in by the link), or from Settings.
export default function ResetPasswordScreen() {
  const { updatePassword } = useAuth();
  const confirmRef = useRef<TextInput>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mismatch = !!confirm && confirm !== password;
  const canSubmit = password.length >= MIN_PASSWORD && confirm === password;

  async function submit() {
    if (!canSubmit || busy) return;
    setError(null);
    setBusy(true);
    try {
      await updatePassword(password);
      if (router.canGoBack()) router.back();
      else router.replace('/');
    } catch (e) {
      setError(authMessage(e));
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Set a new *password*."
      subtitle={`Use at least ${MIN_PASSWORD} characters.`}
      back={router.canGoBack()}
    >
      <AuthField
        label="New password"
        password
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
        submitBehavior="submit"
        invalid={!!password && password.length < MIN_PASSWORD}
        autoFocus
      />
      <AuthField
        ref={confirmRef}
        label="Confirm password"
        password
        value={confirm}
        onChangeText={setConfirm}
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={submit}
        invalid={mismatch}
      />
      <FormMessage>{mismatch ? "The passwords don't match." : error}</FormMessage>
      <PillButton
        label="Save password"
        onPress={submit}
        busy={busy}
        disabled={!canSubmit}
        className="mt-2"
      />
    </AuthShell>
  );
}
