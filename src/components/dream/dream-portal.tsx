import { Canvas, Fill, Shader, Skia } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

/** Flight into the dream, then the fade that uncovers the page. */
export const PORTAL_MS = 2600;
const FADE_MS = 650;
/** When the dream page's own reveal should start (just as the clouds part). */
export const PORTAL_REVEAL_MS = PORTAL_MS - 300;

// Radial cloud tunnel: billowing blue mist streaks outward from a turbulent, glowing core
// while the camera accelerates inward, ending in a pale flash.
// Angles are sampled through the unit direction (not atan), so there is no seam.
const SOURCE = Skia.RuntimeEffect.Make(`
uniform float2 res;
uniform float time;
uniform float travel;
uniform float glow;

// Precision-safe hash (Dave Hoskins): the fract/dot version showed square blocks on iOS GPUs.
float hash(float2 p) {
  // Keep the inputs small: GPUs with lower float precision band into rectangles otherwise.
  // Wrapping here (not the lattice) gives shared corners the same value, so there's no seam.
  p = mod(p, 289.0);
  float3 p3 = fract(float3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(float2 p) {
  float2 i = floor(p);
  float2 f = fract(p);
  float2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + float2(1.0, 0.0)), u.x),
             mix(hash(i + float2(0.0, 1.0)), hash(i + float2(1.0, 1.0)), u.x), u.y);
}

float fbm(float2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + float2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

half4 main(float2 fc) {
  float2 uv = (fc - 0.5 * res) / min(res.x, res.y);
  float r = length(uv) + 0.0001;
  float2 dir = uv / r;
  float z = log(r);

  // Streaks: stretched along the radius, flowing outward as we fly in.
  float s = fbm(dir * 5.0 + (z * 1.3 - travel));
  // Big soft billows, warped by the streaks.
  float c = fbm(dir * 2.2 + float2(z * 1.8 - travel * 1.2, s * 1.6 + time * 0.08));
  // The churning core.
  float2 q = uv * 5.0;
  float2 w = float2(fbm(q + time * 0.35), fbm(q + float2(5.2, 1.3) - time * 0.3));
  float m = fbm(q + 3.0 * w + travel * 0.5);

  float core = exp(-r * 3.0);
  float v = mix(s * 0.55 + c * 0.65, m * 1.15, core);
  v = pow(clamp(v, 0.0, 1.0), 2.1) * 2.0;

  float3 navy = float3(0.03, 0.04, 0.14);
  float3 mid = float3(0.27, 0.32, 0.66);
  float3 pale = float3(0.80, 0.84, 0.99);
  float3 col = mix(navy, mid, smoothstep(0.05, 0.55, v));
  col = mix(col, pale, smoothstep(0.5, 1.15, v));

  // Darker edges, a light at the end of the tunnel that grows, then the flash.
  col *= 0.5 + 0.75 * smoothstep(1.3, 0.0, r);
  col += pale * core * (0.2 + m * 0.5 + glow * 1.4);
  col = mix(col, float3(0.90, 0.93, 1.0), glow * glow * smoothstep(1.5, 0.0, r));
  return half4(half3(col), 1.0);
}
`)!;

type DreamPortalProps = {
  /** Runs once the page is uncovered (unmount the portal then). */
  onDone: () => void;
};

// "Going into the dream": plays over a freshly made dream before its insights appear.
export function DreamPortal({ onDone }: DreamPortalProps) {
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(0); // seconds
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) {
      onDone();
      return;
    }
    t.set(withTiming(PORTAL_MS / 1000, { duration: PORTAL_MS, easing: Easing.linear }));
    opacity.set(withDelay(PORTAL_MS - FADE_MS + 250, withTiming(0, { duration: FADE_MS })));
    // A JS timer, not an animation callback (those run on the UI thread).
    const done = setTimeout(onDone, PORTAL_MS + 300);
    return () => clearTimeout(done);
    // onDone is only read once, when the flight ends.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion]);

  const uniforms = useDerivedValue(() => {
    const s = t.value;
    const end = PORTAL_MS / 1000;
    const k = Math.min(1, Math.max(0, (s - end * 0.62) / (end * 0.38)));
    return {
      res: [width, height],
      time: s,
      // Starts drifting, then accelerates into the dream.
      travel: 0.35 * s + 0.32 * s * s * s,
      glow: k * k * (3 - 2 * k),
    };
  });

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (reduceMotion) return null;

  return (
    <Animated.View pointerEvents="box-only" style={[StyleSheet.absoluteFill, style]}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Fill>
          <Shader source={SOURCE} uniforms={uniforms} />
        </Fill>
      </Canvas>
    </Animated.View>
  );
}
