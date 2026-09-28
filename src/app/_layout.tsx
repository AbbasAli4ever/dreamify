import '@/global.css';

import {
  BricolageGrotesque_300Light,
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  useFonts,
} from '@expo-google-fonts/bricolage-grotesque';
import { DarkTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { DreamsProvider } from '@/providers/dreams-provider';
import { ProfileProvider } from '@/providers/profile-provider';

SplashScreen.preventAutoHideAsync();

const navTheme: Theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.night900, card: colors.night900 },
};

// Root layout — the equivalent of Next.js `app/layout.tsx`.
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_300Light,
    BricolageGrotesque_400Regular,
    BricolageGrotesque_500Medium,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
  });
  const ready = fontsLoaded || !!fontError;

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ProfileProvider>
          <DreamsProvider>
            <ThemeProvider value={navTheme}>
              <RootStack />
              <StatusBar style="light" />
            </ThemeProvider>
          </DreamsProvider>
        </ProfileProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

// Signed out → welcome / sign in / sign up. Signed in for the first time → onboarding.
// After that → the app. When a guard flips (sign in, sign out, onboarding done), the
// stack drops the screens that are no longer allowed and `index` sends the user on.
function RootStack() {
  const { status, user } = useAuth();
  const signedIn = status === 'signedIn';
  const onboarded = !!user?.onboarded;

  // Keep the splash up until we know who is signed in.
  useEffect(() => {
    if (status !== 'loading') SplashScreen.hideAsync();
  }, [status]);

  if (status === 'loading') return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: colors.night900 },
      }}
    >
      <Stack.Screen name="index" />
      {/* Email links and Google come back here, signed in or not. */}
      <Stack.Screen name="auth/callback" options={{ gestureEnabled: false }} />

      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)/welcome" />
        <Stack.Screen name="(auth)/sign-in" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="(auth)/sign-up" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="(auth)/forgot-password" options={{ animation: 'slide_from_right' }} />
      </Stack.Protected>

      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="reset-password" options={{ animation: 'slide_from_right' }} />
      </Stack.Protected>

      {/* New accounts are sent here by `index`; anyone signed in can replay it from Home. */}
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      </Stack.Protected>

      <Stack.Protected guard={signedIn && onboarded}>
        <Stack.Screen name="home" />
        <Stack.Screen name="write" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen
          name="processing/[id]"
          options={{ gestureEnabled: false, animation: 'fade' }}
        />
        <Stack.Screen name="dream/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="echo/[symbol]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="archive" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="search" options={{ presentation: 'modal' }} />
        <Stack.Screen name="patterns" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
      </Stack.Protected>

      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
