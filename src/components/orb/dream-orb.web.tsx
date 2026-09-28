// Web renderer: draws engine frames onto a 2D canvas (Skia isn't set up for web).
// Same props and behaviour as dream-orb.tsx.

import { useRef } from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import type { DreamOrbProps } from '@/components/orb/dream-orb';
import { PRESET_SIZE, inkGrey, useOrbAnimation } from '@/components/orb/use-orb-animation';

const LEVEL_SCALE = 0.14;
const DPR = Math.min(2, globalThis.devicePixelRatio ?? 1);

export function DreamOrb({
  state = 'listening',
  size = 200,
  speed,
  level,
  paused,
  onPaper = false,
  accessibilityLabel,
  style,
}: DreamOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useOrbAnimation(state, { speed, level, paused }, (frame) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const k = (size / PRESET_SIZE) * DPR;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, size * DPR, size * DPR);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    const ink = (white: number, a = 1) => {
      const g = inkGrey(white, onPaper);
      return `rgba(${g},${g},${g},${a})`;
    };
    for (const l of frame.lines) {
      ctx.strokeStyle = ink(l.white, l.a);
      ctx.lineWidth = l.w;
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();
    }
    for (const d of frame.dots) {
      ctx.fillStyle = ink(d.white, d.a);
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const pulse = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + (level ? level.value : 0) * LEVEL_SCALE }],
  }));

  return (
    <Animated.View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? state}
      style={[{ width: size, height: size }, pulse, style]}
    >
      <canvas
        ref={canvasRef}
        width={size * DPR}
        height={size * DPR}
        style={{ width: size, height: size }}
      />
    </Animated.View>
  );
}
