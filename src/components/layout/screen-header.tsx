import type { ReactNode } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';

import { CircleButton } from '@/components/ui/circle-button';
import { Label } from '@/components/ui/typography';

type ScreenHeaderProps = {
  title: string;
  right?: ReactNode;
};

// Back button · centered small label · optional right slot (R10, R18).
export function ScreenHeader({ title, right }: ScreenHeaderProps) {
  return (
    <View className="h-12 flex-row items-center justify-between">
      <CircleButton
        icon="back"
        size="sm"
        accessibilityLabel="Back"
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
      />
      <Label className="text-paper/80">{title}</Label>
      <View className="w-11 items-end">{right}</View>
    </View>
  );
}
