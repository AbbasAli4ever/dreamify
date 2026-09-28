import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';

import { Meta } from '@/components/ui/typography';
import { SymbolIcon } from '@/components/ui/symbol-icon';

// Positions are fractions of the square canvas; size is the ring diameter (bigger = more frequent).
const NODES = [
  { key: 'moon', label: 'Night', x: 0.16, y: 0.12, size: 40 },
  { key: 'desert', label: 'Desert', x: 0.74, y: 0.1, size: 52 },
  { key: 'eye', label: 'Eye', x: 0.92, y: 0.44, size: 40 },
  { key: 'wolf', label: 'Wolf', x: 0.47, y: 0.4, size: 80 },
  { key: 'fire', label: 'Fire', x: 0.08, y: 0.5, size: 40 },
  { key: 'door', label: 'Door', x: 0.26, y: 0.76, size: 62 },
  { key: 'water', label: 'Water', x: 0.72, y: 0.74, size: 62 },
] as const;

const EDGES: [string, string][] = [
  ['moon', 'wolf'],
  ['desert', 'wolf'],
  ['desert', 'eye'],
  ['wolf', 'door'],
  ['wolf', 'water'],
  ['door', 'water'],
  ['fire', 'door'],
  ['eye', 'water'],
];

// A small version of the reference "dream world" map (R17) for onboarding slide 3.
export function SymbolConstellation({ size }: { size: number }) {
  const at = (key: string) => {
    const node = NODES.find((n) => n.key === key)!;
    return { x: node.x * size, y: node.y * size };
  };

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {EDGES.map(([a, b]) => {
          const p = at(a);
          const q = at(b);
          return (
            <Line
              key={`${a}-${b}`}
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
              stroke="#FFFFFF"
              strokeOpacity={0.22}
              strokeWidth={1}
            />
          );
        })}
      </Svg>

      {NODES.map((node, i) => (
        <Animated.View
          key={node.key}
          entering={FadeIn.delay(200 + i * 120).duration(600)}
          style={{
            position: 'absolute',
            left: node.x * size - 50,
            top: node.y * size - node.size / 2,
            width: 100,
            alignItems: 'center',
          }}
        >
          <SymbolIcon symbol={node.key} size={node.size} className="bg-night-800" />
          <Meta className="mt-1.5 text-paper/80">{node.label}</Meta>
        </Animated.View>
      ))}
    </View>
  );
}
