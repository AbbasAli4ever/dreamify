import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormMessage } from '@/components/auth/form-message';
import { GoogleButton } from '@/components/auth/google-button';
import { NightBackground } from '@/components/layout/night-background';
import { Floating } from '@/components/ui/floating';
import { Glow } from '@/components/ui/glow';
import { PillButton } from '@/components/ui/pill-button';
import { RichText } from '@/components/ui/rich-text';
import { Body } from '@/components/ui/typography';
import { authMessage } from '@/lib/backend/auth';
import { useAuth } from '@/providers/auth-provider';

// A0 Welcome — first screen when signed out. Google, email sign-up, or sign in.
export default function WelcomeScreen() {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moon = Math.min(width * 0.52, height * 0.26);

  async function google() {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
      // Signed in: the route guards move on to onboarding or Home.
    } catch (e) {
      setError(authMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View className="flex-1 bg-night-900">
      <NightBackground glowColor="#3B4A8C" glowPosition={{ x: 0.5, y: 0.28 }} scrim={0.75} />

      <View
        className="flex-1 px-6"
        style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }}
      >
        <View className="h-12 justify-center">
          <Image
            source={require('@/assets/images/logo.png')}
            style={{ width: 72, height: 36 }}
            contentFit="contain"
            accessibilityLabel="Dreamify"
          />
        </View>

        <View className="flex-1 items-center justify-center">
          <View
            className="items-center justify-center"
            style={{ width: moon * 1.9, height: moon * 1.9 }}
          >
            <Glow size={moon * 1.9} color="#B8C6F5" opacity={0.3} />
            <Floating distance={8} duration={4000}>
              <Image
                source={require('@/assets/images/moon.png')}
                style={{ width: moon, height: moon }}
              />
            </Floating>
          </View>
        </View>

        <View className="gap-3 pb-8">
          <RichText accessibilityRole="header">Your dreams, *remembered*.</RichText>
          <Body className="text-body-lg text-paper/60">
            Create an account to keep your dream world private and with you on every device.
          </Body>
        </View>

        <View className="gap-3">
          <GoogleButton onPress={google} busy={busy} />
          <PillButton label="Sign up with email" onPress={() => router.push('/sign-up')} />
          <FormMessage>{error}</FormMessage>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/sign-in')}
            hitSlop={8}
            className="items-center py-3 active:opacity-70"
          >
            <Text className="text-body text-paper/60">
              Already have an account?{' '}
              <Text className="font-display-semibold text-paper">Sign in</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
