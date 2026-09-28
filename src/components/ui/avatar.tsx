import { Image, type ImageSource } from 'expo-image';
import { Text, View } from 'react-native';

type AvatarProps = {
  source?: ImageSource | number;
  name: string;
  size?: number;
  /** Background behind the initial when there's no photo (default: faint white). */
  color?: string;
};

// Round profile photo, falling back to initials.
export function Avatar({ source, name, size = 44, color }: AvatarProps) {
  if (source) {
    return (
      <Image
        source={source}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
        accessibilityLabel={name}
      />
    );
  }

  return (
    <View
      className="items-center justify-center rounded-full bg-paper/10"
      style={{ width: size, height: size, backgroundColor: color }}
    >
      <Text
        className="font-display-semibold text-paper"
        style={{ fontSize: Math.max(14, Math.round(size * 0.4)) }}
      >
        {name.slice(0, 1)}
      </Text>
    </View>
  );
}
