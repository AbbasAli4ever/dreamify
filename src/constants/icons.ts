// UI icon registry. Keys match the file names in assets/icons/ui/.
import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

import BackSvg from '@/assets/icons/ui/back.svg';
import CheckSvg from '@/assets/icons/ui/check.svg';
import ChevronDownSvg from '@/assets/icons/ui/chevron-down.svg';
import ChevronRightSvg from '@/assets/icons/ui/chevron-right.svg';
import CloseSvg from '@/assets/icons/ui/close.svg';
import FeatherSvg from '@/assets/icons/ui/feather.svg';
import GridSvg from '@/assets/icons/ui/grid.svg';
import KeyboardSvg from '@/assets/icons/ui/keyboard.svg';
import MicSvg from '@/assets/icons/ui/mic.svg';
import MoreSvg from '@/assets/icons/ui/more.svg';
import PauseSvg from '@/assets/icons/ui/pause.svg';
import PencilSvg from '@/assets/icons/ui/pencil.svg';
import PlaySvg from '@/assets/icons/ui/play.svg';
import PlusSvg from '@/assets/icons/ui/plus.svg';
import SearchSvg from '@/assets/icons/ui/search.svg';
import SettingsSvg from '@/assets/icons/ui/settings.svg';
import ShareSvg from '@/assets/icons/ui/share.svg';
import SortSvg from '@/assets/icons/ui/sort.svg';
import SparkleSvg from '@/assets/icons/ui/sparkle.svg';
import TrashSvg from '@/assets/icons/ui/trash.svg';

export const UI_ICONS = {
  back: BackSvg,
  check: CheckSvg,
  'chevron-down': ChevronDownSvg,
  'chevron-right': ChevronRightSvg,
  close: CloseSvg,
  feather: FeatherSvg,
  grid: GridSvg,
  keyboard: KeyboardSvg,
  mic: MicSvg,
  more: MoreSvg,
  pause: PauseSvg,
  pencil: PencilSvg,
  play: PlaySvg,
  plus: PlusSvg,
  search: SearchSvg,
  settings: SettingsSvg,
  share: ShareSvg,
  sort: SortSvg,
  sparkle: SparkleSvg,
  trash: TrashSvg,
} satisfies Record<string, FC<SvgProps>>;

export type IconName = keyof typeof UI_ICONS;
