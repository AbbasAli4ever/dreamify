import { Text, View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';

export default function HomeScreen() {
  return (
    <Screen className="justify-center gap-6">
      <View className="gap-2">
        <Text className="text-4xl font-bold text-gray-900 dark:text-white">Dreamify</Text>
        <Text className="text-base text-muted dark:text-muted-dark">
          Expo Router + NativeWind starter.
        </Text>
      </View>
      <Button title="Get started" onPress={() => {}} />
    </Screen>
  );
}
