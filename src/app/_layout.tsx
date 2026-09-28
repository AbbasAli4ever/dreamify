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

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ProfileProvider>
        <DreamsProvider>
          <ThemeProvider value={navTheme}>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade',
                contentStyle: { backgroundColor: colors.night900 },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
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
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="light" />
          </ThemeProvider>
        </DreamsProvider>
      </ProfileProvider>
    </GestureHandlerRootView>
  );
}
