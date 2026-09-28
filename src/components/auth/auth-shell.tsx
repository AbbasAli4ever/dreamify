import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NightBackground } from '@/components/layout/night-background';
import { CircleButton } from '@/components/ui/circle-button';
import { RichText } from '@/components/ui/rich-text';
import { Body } from '@/components/ui/typography';

type AuthShellProps = {
  /** `*marked*` words are emphasized. */
  title: string;
  subtitle?: string;
  /** Show the back button (defaults to true). */
  back?: boolean;
  children: ReactNode;
  /** Pinned under the form, e.g. "New here? Create an account". */
  footer?: ReactNode;
};

// Night sky + title + form, scrolling above the keyboard. Shared by the auth screens.
export function AuthShell({ title, subtitle, back = true, children, footer }: AuthShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-night-900">
      <NightBackground glowColor="#3B4A8C" glowPosition={{ x: 0.5, y: 0.1 }} scrim={0.7} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 24,
          }}
        >
          <View className="h-12 flex-row items-center">
            {back ? (
              <CircleButton
                icon="back"
                size="sm"
                accessibilityLabel="Back"
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))}
              />
            ) : null}
          </View>

          <View className="mb-8 mt-8 gap-3">
            <RichText accessibilityRole="header">{title}</RichText>
            {subtitle ? <Body className="text-body-lg text-paper/60">{subtitle}</Body> : null}
          </View>

          <View className="gap-4">{children}</View>

          {footer ? <View className="mt-auto items-center pt-10">{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
