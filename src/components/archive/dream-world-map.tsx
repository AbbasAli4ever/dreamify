import { Pressable, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Meta } from '@/components/ui/typography';
import type { Dream } from '@/types/dream';

type DreamWorldMapProps = {
  dreams: Dream[];
  width: number;
  onPressSymbol: (key: string) => void;
};

const MAX_NODES = 16;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

// World view (R17): every symbol in the range, sized by how often it appears and
// linked to the symbols it shares dreams with. The Dream Echo overview.
export function DreamWorldMap({ dreams, width, onPressSymbol }: DreamWorldMapProps) {
  const freq = new Map<string, { key: string; label: string; count: number }>();
  const pairs = new Map<string, number>();
  for (const d of dreams) {
    const keys = [...new Set(d.symbols.map((s) => s.key))];
    for (const s of d.symbols) {
      const prev = freq.get(s.key);
      freq.set(s.key, { key: s.key, label: s.label, count: (prev?.count ?? 0) + 1 });
    }
    for (let i = 0; i < keys.length; i++)
      for (let j = i + 1; j < keys.length; j++) {
        const id = [keys[i], keys[j]].sort().join('|');
        pairs.set(id, (pairs.get(id) ?? 0) + 1);
      }
  }

  const nodes = [...freq.values()].sort((a, b) => b.count - a.count).slice(0, MAX_NODES);
  const max = Math.max(1, ...nodes.map((n) => n.count));
  const height = width * 1.55;
  const cx = width / 2;
  const cy = height / 2;
  // Most frequent in the middle, the rest spiralling out (sunflower layout) over an
  // oval that fills the canvas, so neighbours keep ~70 px apart.
  const rx = width / 2 - 42;
  const ry = height / 2 - 44;
  const placed = nodes.map((n, i) => {
    // Keep a clear ring around the centre node, then spiral out to the edge.
    const t = i === 0 ? 0 : 0.52 + 0.48 * Math.sqrt((i - 1) / Math.max(nodes.length - 2, 1));
    const a = i * GOLDEN_ANGLE;
    return {
      ...n,
      x: cx + (i === 0 ? 0 : rx * t * Math.cos(a)),
      y: cy + (i === 0 ? 0 : ry * t * Math.sin(a)),
      ring: 30 + (n.count / max) * 30,
    };
  });
  const at = new Map(placed.map((n) => [n.key, n]));
  const edges = [...pairs.entries()]
    .map(([id, count]) => ({ a: at.get(id.split('|')[0]), b: at.get(id.split('|')[1]), count }))
    .filter((e) => e.a && e.b);

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} style={{ position: 'absolute' }}>
        {edges.map((e, i) => (
          <Line
            key={i}
            x1={e.a!.x}
            y1={e.a!.y}
            x2={e.b!.x}
            y2={e.b!.y}
            stroke="#FFFFFF"
            strokeOpacity={Math.min(0.4, 0.1 + e.count * 0.08)}
            strokeWidth={1}
          />
        ))}
      </Svg>
      {placed.map((n) => (
        <Pressable
          key={n.key}
          accessibilityRole="button"
          accessibilityLabel={`${n.label}, in ${n.count} ${n.count === 1 ? 'dream' : 'dreams'}`}
          onPress={() => onPressSymbol(n.key)}
          className="items-center active:opacity-70"
          style={{ position: 'absolute', left: n.x - 45, top: n.y - n.ring / 2, width: 90 }}
        >
          <SymbolIcon symbol={n.key} size={n.ring} className="bg-night-900" />
          <Meta className="mt-1 text-paper/80">{n.label}</Meta>
        </Pressable>
      ))}
    </View>
  );
}
