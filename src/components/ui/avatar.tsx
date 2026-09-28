import { Image, type ImageSource } from 'expo-image';
import { Text, View } from 'react-native';

type AvatarProps = {
  source?: ImageSource | number;
  name: string;
  size?: number;
};

// Round profile photo, falling back to initials.
export function Avatar({ source, name, size = 44 }: AvatarProps) {
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
      style={{ width: size, height: size }}
    >
      <Text className="font-display-semibold text-label text-paper">{name.slice(0, 1)}</Text>
    </View>
  );
}
