import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BottomActionBarProps = {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  /**
   * true (default): pinned over the content with a fade behind it.
   * false: laid out in the normal flow, e.g. to sit above the keyboard.
   */
  floating?: boolean;
};

/** Height the bar occupies above the safe area — use it to pad scroll content. */
export const BOTTOM_BAR_HEIGHT = 96;

// Floating 3-slot bar pinned above the home indicator, with a fade behind it (R01, R06, R13).
export function BottomActionBar({ left, center, right, floating = true }: BottomActionBarProps) {
  const insets = useSafeAreaInsets();

  const row = (
    <View className="flex-row items-center gap-3 px-6">
      <View className="min-w-14">{left}</View>
      <View className="flex-1 items-center">{center}</View>
      <View className="min-w-14 items-end">{right}</View>
    </View>
  );

  if (!floating) return <View className="pb-3 pt-3">{row}</View>;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: insets.bottom + 12,
      }}
    >
      <LinearGradient
        pointerEvents="none"
        // Darkens early, so cards scrolling under the buttons fade out instead of clashing.
        colors={['rgba(7, 8, 12, 0)', 'rgba(7, 8, 12, 0.8)', 'rgba(7, 8, 12, 0.95)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View className="pt-8">{row}</View>
    </View>
  );
}
