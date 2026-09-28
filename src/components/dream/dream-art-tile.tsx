import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DreamOrb } from '@/components/orb/dream-orb';
import { Icon } from '@/components/ui/icon';
import { Meta } from '@/components/ui/typography';
import { formatShortDate } from '@/lib/dates';
import type { Dream } from '@/types/dream';

type DreamArtTileProps = {
  dream: Dream;
  width?: number;
  /** Defaults to 4:5 (the artwork ratio). */
  height?: number;
  onPress?: () => void;
};

// Artwork-first dream tile: image, date and title on a bottom scrim (docs/SCREENS.md §5).
export function DreamArtTile({
  dream,
  width = 176,
  height = width * 1.25,
  onPress,
}: DreamArtTileProps) {
  const processing = dream.status === 'processing';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={dream.title ?? 'Dream'}
      onPress={onPress}
      className="overflow-hidden rounded-tile border border-paper/10 bg-night-800 active:opacity-80"
      style={{ width, height }}
    >
      {dream.artwork ? (
        <Image
          source={dream.artwork}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
        />
      ) : null}

      {processing && !dream.artwork ? (
        <View style={StyleSheet.absoluteFill} className="items-center justify-center pb-10">
          <DreamOrb state="working" size={96} accessibilityLabel="Processing" />
        </View>
      ) : null}

      <LinearGradient
        colors={['rgba(7, 8, 12, 0)', 'rgba(7, 8, 12, 0.9)']}
        locations={[0.4, 1]}
        style={StyleSheet.absoluteFill}
      />

      {dream.reflection?.answerText ? (
        <View className="absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-full bg-paper">
          <Icon name="feather" size={16} color="#0B0B0F" />
        </View>
      ) : null}

      <View className="flex-1 justify-end p-4">
        <Meta className="text-paper/70">{formatShortDate(dream.createdAt)}</Meta>
        <Text
          numberOfLines={2}
          className="mt-1 font-display-medium text-[17px] leading-[21px] text-paper"
        >
          {processing ? 'Painting your dream…' : dream.title}
        </Text>
      </View>
    </Pressable>
  );
}
