// Symbol icon registry. Keys match the file names in assets/icons/symbols/ and the
// fixed vocabulary the AI must return (docs/SCREENS.md §7). Unknown keys fall back to `star`.
import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

import BirdIcon from '@/assets/icons/symbols/bird.svg';
import CatIcon from '@/assets/icons/symbols/cat.svg';
import CloudIcon from '@/assets/icons/symbols/cloud.svg';
import CrowIcon from '@/assets/icons/symbols/crow.svg';
import DeathIcon from '@/assets/icons/symbols/death.svg';
import DesertIcon from '@/assets/icons/symbols/desert.svg';
import DoorIcon from '@/assets/icons/symbols/door.svg';
import EyeIcon from '@/assets/icons/symbols/eye.svg';
import FireIcon from '@/assets/icons/symbols/fire.svg';
import ForestIcon from '@/assets/icons/symbols/forest.svg';
import GrassIcon from '@/assets/icons/symbols/grass.svg';
import HeartIcon from '@/assets/icons/symbols/heart.svg';
import HouseIcon from '@/assets/icons/symbols/house.svg';
import KeyIcon from '@/assets/icons/symbols/key.svg';
import LightIcon from '@/assets/icons/symbols/light.svg';
import MaskIcon from '@/assets/icons/symbols/mask.svg';
import MirrorIcon from '@/assets/icons/symbols/mirror.svg';
import MoonIcon from '@/assets/icons/symbols/moon.svg';
import MountainIcon from '@/assets/icons/symbols/mountain.svg';
import OceanIcon from '@/assets/icons/symbols/ocean.svg';
import SnakeIcon from '@/assets/icons/symbols/snake.svg';
import SnowIcon from '@/assets/icons/symbols/snow.svg';
import StairsIcon from '@/assets/icons/symbols/stairs.svg';
import StarIcon from '@/assets/icons/symbols/star.svg';
import SunIcon from '@/assets/icons/symbols/sun.svg';
import TrainIcon from '@/assets/icons/symbols/train.svg';
import WaterIcon from '@/assets/icons/symbols/water.svg';
import WebIcon from '@/assets/icons/symbols/web.svg';
import WindIcon from '@/assets/icons/symbols/wind.svg';
import WolfIcon from '@/assets/icons/symbols/wolf.svg';

export const SYMBOL_ICONS = {
  bird: BirdIcon,
  cat: CatIcon,
  cloud: CloudIcon,
  crow: CrowIcon,
  death: DeathIcon,
  desert: DesertIcon,
  door: DoorIcon,
  eye: EyeIcon,
  fire: FireIcon,
  forest: ForestIcon,
  grass: GrassIcon,
  heart: HeartIcon,
  house: HouseIcon,
  key: KeyIcon,
  light: LightIcon,
  mask: MaskIcon,
  mirror: MirrorIcon,
  moon: MoonIcon,
  mountain: MountainIcon,
  ocean: OceanIcon,
  snake: SnakeIcon,
  snow: SnowIcon,
  stairs: StairsIcon,
  star: StarIcon,
  sun: SunIcon,
  train: TrainIcon,
  water: WaterIcon,
  web: WebIcon,
  wind: WindIcon,
  wolf: WolfIcon,
} satisfies Record<string, FC<SvgProps>>;

export type SymbolKey = keyof typeof SYMBOL_ICONS;

export function getSymbolIcon(key: string): FC<SvgProps> {
  return SYMBOL_ICONS[key as SymbolKey] ?? SYMBOL_ICONS.star;
}
