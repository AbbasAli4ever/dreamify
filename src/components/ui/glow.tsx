import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

type GlowProps = {
  size: number;
  color?: string;
  opacity?: number;
};

// Soft radial halo, used behind hero visuals (moon, orb).
export function Glow({ size, color = '#AFC2FF', opacity = 0.35 }: GlowProps) {
  const id = `glow-${color.replace('#', '')}`;
  return (
    <Svg width={size} height={size} style={{ position: 'absolute' }} pointerEvents="none">
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset="0.55" stopColor={color} stopOpacity={opacity * 0.35} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
    </Svg>
  );
}
