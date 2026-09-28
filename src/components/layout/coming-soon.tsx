import { router } from 'expo-router';
import { View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { CircleButton } from '@/components/ui/circle-button';
import { Meta, Title } from '@/components/ui/typography';

type ComingSoonProps = {
  title: string;
  /** Spec reference, e.g. "S3 · Record / Write". */
  spec: string;
};

// Temporary screen for routes that are linked but not built yet.
export function ComingSoon({ title, spec }: ComingSoonProps) {
  return (
    <Screen>
      <View className="pt-2">
        <CircleButton
          icon="back"
          size="sm"
          accessibilityLabel="Back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
        />
      </View>
      <View className="flex-1 justify-center gap-3">
        <Meta>{spec} · coming soon</Meta>
        <Title>{title}</Title>
      </View>
    </Screen>
  );
}
