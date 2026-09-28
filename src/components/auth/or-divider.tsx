import { View } from 'react-native';

import { Meta } from '@/components/ui/typography';

// Hairline — or — hairline, between Google and the email form.
export function OrDivider() {
  return (
    <View className="flex-row items-center gap-4 py-2">
      <View className="h-px flex-1 bg-paper/10" />
      <Meta className="text-paper/40">or</Meta>
      <View className="h-px flex-1 bg-paper/10" />
    </View>
  );
}
