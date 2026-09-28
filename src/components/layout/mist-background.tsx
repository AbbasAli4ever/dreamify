import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import { gradients } from '@/constants/theme';

// Lavender → white: the light theme for "about you" screens (R24, R25).
export function MistBackground() {
  return (
    <LinearGradient
      pointerEvents="none"
      colors={gradients.mist}
      locations={[0, 0.7]}
      style={StyleSheet.absoluteFill}
    />
  );
}
