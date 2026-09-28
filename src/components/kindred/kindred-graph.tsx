import { useEffect, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import Svg, { Circle, Line } from 'react-native-svg';

import { KindredAvatar } from '@/components/kindred/kindred-avatar';
import { meshPairs } from '@/lib/kindred';

export type GraphNode = {
  id: string;
  name: string;
  avatarUrl?: string;
  color?: string;
  /** 52–99: closer to the centre and bigger when higher. */
  match: number;
  /** Symbol keys; people who share one are threaded together. */
  symbols: string[];
  /** Matched on feeling only (no shared symbol): drawn with a dashed thread. */
  vibeOnly?: boolean;
};

type KindredGraphProps = {
  /** You (or your dream) in the middle. */
  center: ReactNode;
  centerSize: number;
  nodes: GraphNode[];
  width: number;
  height?: number;
  onPressNode: (id: string) => void;
};

const MAX_NODES = 10;
/** Height of the name + percentage under (or over) each avatar. */
const LABEL_H = 34;

// The mesh of Kindred dreamers: you in the middle, each dreamer on an orbit that gets
// closer the more alike your dreams were, and faint threads between dreamers who dreamt of
// the same things.
export function KindredGraph({
  center,
  centerSize,
  nodes,
  width,
  height = width,
  onPressNode,
}: KindredGraphProps) {
  const reduceMotion = useReducedMotion();
  const shown = [...nodes].sort((a, b) => b.match - a.match).slice(0, MAX_NODES);
  const cx = width / 2;
  const cy = height / 2;
  const inner = centerSize / 2 + 44;
  const outerX = width / 2 - 34;
  const outerY = height / 2 - 26 - LABEL_H; // room for the labels at the top and bottom

  const placed = shown.map((n, i) => {
    // Evenly around the circle, closer the more alike; with many dreamers every other one
    // steps out a little so neighbours never overlap.
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / shown.length + 0.3;
    const closeness = Math.min(1, Math.max(0, (n.match - 52) / 47));
    const t = Math.min(1, 1 - closeness * 0.75 + (shown.length > 5 && i % 2 ? 0.22 : 0));
    const rx = inner + (outerX - inner) * t;
    const ry = inner + (outerY - inner) * t;
    const size = Math.round(34 + closeness * 16);
    const y = cy + ry * Math.sin(angle);
    // The label sits on the far side from the centre, so the thread never crosses it.
    return { ...n, size, x: cx + rx * Math.cos(angle), y, above: y < cy - 1 };
  });
  const mesh = meshPairs(placed);

  // A slow halo around the centre.
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (!reduceMotion) pulse.set(withRepeat(withTiming(1, { duration: 3200 }), -1, false));
  }, [reduceMotion, pulse]);
  const halo = useAnimatedStyle(() => ({
    opacity: 0.35 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.6 }],
  }));

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} style={{ position: 'absolute' }}>
        <Circle
          cx={cx}
          cy={cy}
          r={inner + (Math.min(outerX, outerY) - inner) * 0.45}
          stroke="#FFFFFF"
          strokeOpacity={0.05}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={Math.min(outerX, outerY)}
          stroke="#FFFFFF"
          strokeOpacity={0.04}
          fill="none"
        />
        {mesh.map(([a, b]) => (
          <Line
            key={`${a}-${b}`}
            x1={placed[a].x}
            y1={placed[a].y}
            x2={placed[b].x}
            y2={placed[b].y}
            stroke="#FFFFFF"
            strokeOpacity={0.08}
            strokeWidth={1}
          />
        ))}
        {placed.map((n) => (
          <Line
            key={n.id}
            x1={cx}
            y1={cy}
            x2={n.x}
            y2={n.y}
            stroke={n.color ?? '#FFFFFF'}
            strokeOpacity={0.25 + ((n.match - 52) / 47) * 0.45}
            strokeWidth={1 + ((n.match - 52) / 47) * 1.2}
            strokeDasharray={n.vibeOnly ? '3 5' : undefined}
          />
        ))}
      </Svg>

      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            left: cx - centerSize / 2,
            top: cy - centerSize / 2,
            width: centerSize,
            height: centerSize,
            borderRadius: centerSize / 2,
            borderWidth: 1,
            borderColor: '#FFFFFF',
          },
          halo,
        ]}
      />
      <View style={{ position: 'absolute', left: cx - centerSize / 2, top: cy - centerSize / 2 }}>
        {center}
      </View>

      {placed.map((n, i) => (
        <Animated.View
          key={n.id}
          entering={
            reduceMotion
              ? FadeIn.duration(200)
              : ZoomIn.delay(150 + i * 90)
                  .springify()
                  .damping(16)
          }
          style={{
            position: 'absolute',
            left: n.x - 40,
            top: n.y - n.size / 2 - (n.above ? LABEL_H : 0),
            width: 80,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${n.name}, ${n.match}% alike`}
            onPress={() => onPressNode(n.id)}
            hitSlop={6}
            className="items-center active:opacity-70"
          >
            {n.above ? <NodeLabel name={n.name} match={n.match} /> : null}
            <KindredAvatar name={n.name} avatarUrl={n.avatarUrl} color={n.color} size={n.size} />
            {n.above ? null : <NodeLabel name={n.name} match={n.match} />}
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}

function NodeLabel({ name, match }: { name: string; match: number }) {
  return (
    <View className="items-center justify-center" style={{ height: LABEL_H }}>
      <Text numberOfLines={1} className="text-meta font-medium text-paper/85">
        {name}
      </Text>
      <Text className="text-[11px] text-paper/50">{match}%</Text>
    </View>
  );
}
