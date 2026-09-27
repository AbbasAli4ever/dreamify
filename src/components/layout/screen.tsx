import { View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cn } from '@/lib/utils';

type ScreenProps = ViewProps & { className?: string };

// Safe-area aware page wrapper shared by every screen.
export function Screen({ className, children, ...props }: ScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <View className={cn('flex-1 px-6 py-4', className)} {...props}>
        {children}
      </View>
    </SafeAreaView>
  );
}
