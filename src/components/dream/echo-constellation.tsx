import { Pressable, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Meta } from '@/components/ui/typography';

type Node = { key: string; label: string; count: number };

type EchoConstellationProps = {
  center: { key: string; label: string };
  /** Co-occurring symbols, most frequent first (max 6 shown). */
  nodes: Node[];
  size: number;
  onPressNode: (key: string) => void;
};

// "Often appears with": this symbol in the middle, its companions around it (R17, simplified).
export function EchoConstellation({ center, nodes, size, onPressNode }: EchoConstellationProps) {
  const shown = nodes.slice(0, 6);
  const max = Math.max(1, ...shown.map((n) => n.count));
  const c = size / 2;
  const radius = size * 0.36;
  const placed = shown.map((n, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(shown.length, 1);
    return {
      ...n,
      x: c + radius * Math.cos(angle),
      y: c + radius * Math.sin(angle) * 0.85,
      ring: 38 + (n.count / max) * 16, // more shared dreams → bigger node
    };
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {placed.map((n) => (
          <Line
            key={n.key}
            x1={c}
            y1={c}
            x2={n.x}
            y2={n.y}
            stroke="#FFFFFF"
            strokeOpacity={0.12 + (n.count / max) * 0.2}
            strokeWidth={1}
          />
        ))}
      </Svg>

      <View style={{ position: 'absolute', left: c - 36, top: c - 36 }}>
        <SymbolIcon symbol={center.key} size={72} className="bg-night-800" />
      </View>

      {placed.map((n) => (
        <Pressable
          key={n.key}
          accessibilityRole="button"
          accessibilityLabel={`${n.label}, together in ${n.count} ${n.count === 1 ? 'dream' : 'dreams'}`}
          onPress={() => onPressNode(n.key)}
          className="items-center active:opacity-70"
          style={{ position: 'absolute', left: n.x - 45, top: n.y - n.ring / 2, width: 90 }}
        >
          <SymbolIcon symbol={n.key} size={n.ring} className="bg-night-800" />
          <Meta className="mt-1 text-paper/75">{n.label}</Meta>
        </Pressable>
      ))}
    </View>
  );
}
