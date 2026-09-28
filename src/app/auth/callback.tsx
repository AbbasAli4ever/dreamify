import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AuthShell } from '@/components/auth/auth-shell';
import { FormMessage } from '@/components/auth/form-message';
import { NightBackground } from '@/components/layout/night-background';
import { PillButton } from '@/components/ui/pill-button';
import { Label } from '@/components/ui/typography';
import { authMessage, exchangeCode } from '@/lib/backend/auth';
import { useAuth } from '@/providers/auth-provider';

// Landing route for Google (web and Android) and email links (confirm sign-up,
// reset password). Swaps the one-time `code` for a session, then moves on.
export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<{
    code?: string;
    next?: string;
    error?: string;
    error_description?: string;
  }>();
  const { status } = useAuth();
  const [error, setError] = useState<string | null>(
    params.error_description || params.error || null,
  );

  useEffect(() => {
    if (error) return;
    const go = () => router.replace(params.next === 'reset-password' ? '/reset-password' : '/');
    if (!params.code) {
      go();
      return;
    }
    exchangeCode(params.code)
      .then(go)
      .catch((e) => {
        // The code may already be used (the Google window also delivered it). Signed in is fine.
        if (status === 'signedIn') go();
        else setError(authMessage(e));
      });
    // Only run for the code we landed with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.code]);

  if (error) {
    return (
      <AuthShell
        title="That link didn't *work*."
        subtitle="It may have expired or been opened on another device. If you just confirmed your email, you can sign in now."
        back={false}
      >
        <FormMessage>{error}</FormMessage>
        <PillButton label="Continue" onPress={() => router.replace('/')} />
      </AuthShell>
    );
  }

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-night-900">
      <NightBackground glowColor="#3B4A8C" />
      <ActivityIndicator color="#FFFFFF" />
      <Label>Signing you in…</Label>
    </View>
  );
}
