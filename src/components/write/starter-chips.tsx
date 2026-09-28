import { Pressable, ScrollView, Text } from 'react-native';

const STARTERS = ['I was in…', 'There was…', 'I felt…', 'Someone…', 'Then…', 'I woke up…'];

// Sentence starters that help a half-awake mind begin (S3).
export function StarterChips({ onPick }: { onPick: (starter: string) => void }) {
  return (
    <ScrollView
      horizontal
      keyboardShouldPersistTaps="always"
      showsHorizontalScrollIndicator={false}
      // Don't stretch to fill leftover height (a horizontal ScrollView grows by default).
      style={{ flexGrow: 0 }}
      contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
    >
      {STARTERS.map((s) => (
        <Pressable
          key={s}
          accessibilityRole="button"
          accessibilityLabel={`Start with: ${s}`}
          onPress={() => onPick(s.replace('…', ' '))}
          className="h-9 justify-center rounded-full border border-paper/15 bg-night-900/50 px-4 active:opacity-70"
        >
          <Text className="font-display text-label text-paper/80">{s}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
