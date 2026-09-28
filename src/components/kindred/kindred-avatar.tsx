import { View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';

type KindredAvatarProps = {
  name: string;
  avatarUrl?: string;
  /** Their dream's colour: the ring, and the background of the initial. */
  color?: string;
  size?: number;
};

// A kindred dreamer: their photo (or initial) inside a thin ring in their dream's colour.
export function KindredAvatar({
  name,
  avatarUrl,
  color = '#8C9BB5',
  size = 44,
}: KindredAvatarProps) {
  return (
    <View
      className="items-center justify-center rounded-full"
      style={{ width: size, height: size, borderWidth: 1.5, borderColor: color, padding: 2 }}
    >
      <Avatar
        source={avatarUrl ? { uri: avatarUrl } : undefined}
        name={name}
        size={size - 7}
        color={`${color}55`}
      />
    </View>
  );
}
