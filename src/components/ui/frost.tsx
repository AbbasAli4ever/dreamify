import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';

// Frosted glass for controls that float over content: blurs what's behind and adds a light
// dark shade so their labels stay readable. The parent must be rounded with overflow hidden.
// (Android blurs only with a blur target; without one this is just the shade, which is enough.)
export function Frost({ shade = 0.4 }: { /** Black overlay strength, 0–1. */ shade?: number }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <BlurView tint="dark" intensity={30} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(7, 8, 12, ${shade})` }]} />
    </View>
  );
}
