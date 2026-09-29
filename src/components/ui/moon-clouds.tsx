import { useWindowDimensions } from 'react-native';

import { CloudDrift } from '@/components/layout/night-clouds';

/** moon-clouds.png is 1024×384. */
const ASPECT = 1024 / 384;

type MoonCloudsProps = {
  /** Diameter of the moon. */
  moon: number;
  /** Size of the square the moon is centred in. */
  box: number;
};

// Light grey clouds that drift across the moon from right to left, hiding parts of it
// and letting it show through the gaps. Place it after the moon, inside the moon's box.
// The band is wider than the screen, so it reaches both edges wherever the box sits.
export function MoonClouds({ moon, box }: MoonCloudsProps) {
  const { width } = useWindowDimensions();
  const height = moon * 1.15;
  const tile = Math.max(height * ASPECT, width * 2.2);
  return (
    <CloudDrift
      source={require('@/assets/images/moon-clouds.png')}
      tile={tile}
      height={height}
      seconds={75}
      style={{ top: box / 2 - height / 2 + moon * 0.05, left: -width }}
    />
  );
}
