import { View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NightBackground } from '@/components/layout/night-background';
import { cn } from '@/lib/utils';

type ScreenProps = ViewProps & { className?: string };

// Night background + safe area + side padding. Shared by every dark screen.
// Insets are applied as padding directly: SafeAreaView reported no top inset
// inside iOS full-screen modals, so content slid under the status bar.
export function Screen({ className, children, style, ...props }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-night-900">
      <NightBackground />
      <View
        className={cn('flex-1 px-6', className)}
        style={[{ paddingTop: insets.top, paddingBottom: insets.bottom }, style]}
        {...props}
      >
        {children}
      </View>
    </View>
  );
}
