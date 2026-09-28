import { Text, View } from 'react-native';

type RhythmChartProps = {
  /** Dream count per day of the month. */
  perDay: number[];
  /** Day of month today (later days are shown faint). */
  today: number;
  width: number;
  height?: number;
};

// Minimal bar chart: dreams per day this month. Ink bars, no gridlines.
export function RhythmChart({ perDay, today, width, height = 96 }: RhythmChartProps) {
  // Scale against at least 3 a day, so one dream reads as a calm, partial bar.
  const max = Math.max(3, ...perDay);
  const gap = 3;
  const bar = (width - gap * (perDay.length - 1)) / perDay.length;

  return (
    <View
      accessible
      accessibilityLabel={`Dreams per day this month: ${perDay.filter((n) => n > 0).length} days with dreams`}
    >
      <View className="flex-row items-end" style={{ height, gap }}>
        {perDay.map((n, i) => (
          <View
            key={i}
            style={{
              width: bar,
              height: n ? Math.max(8, (n / max) * height) : 3,
              borderRadius: bar / 2,
              backgroundColor:
                i + 1 > today ? 'rgba(11,11,15,0.06)' : n ? '#0B0B0F' : 'rgba(11,11,15,0.12)',
            }}
          />
        ))}
      </View>
      <View className="mt-2 flex-row justify-between">
        <Text className="text-meta text-ink/40">1</Text>
        <Text className="text-meta text-ink/40">{Math.ceil(perDay.length / 2)}</Text>
        <Text className="text-meta text-ink/40">{perDay.length}</Text>
      </View>
    </View>
  );
}
