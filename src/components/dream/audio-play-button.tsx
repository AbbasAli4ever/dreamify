import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Pressable, Text } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { formatDuration } from '@/lib/dates';
import { cn } from '@/lib/utils';

type AudioPlayButtonProps = {
  uri: string;
  label?: string;
  /** Ink styling for white surfaces. */
  onPaper?: boolean;
};

// Small pill that plays back a recording (the original dream or a voice insight).
export function AudioPlayButton({
  uri,
  label = 'Play recording',
  onPaper = false,
}: AudioPlayButtonProps) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const color = onPaper ? '#0B0B0F' : '#FFFFFF';

  function toggle() {
    if (status.playing) {
      player.pause();
      return;
    }
    if (status.duration > 0 && status.currentTime >= status.duration - 0.1) player.seekTo(0);
    player.play();
  }

  const time =
    status.duration > 0
      ? formatDuration((status.playing ? status.currentTime : status.duration) * 1000)
      : '';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={status.playing ? 'Pause' : label}
      onPress={toggle}
      className={cn(
        'h-10 flex-row items-center gap-2 self-start rounded-full border px-4 active:opacity-70',
        onPaper ? 'border-ink/15' : 'border-paper/15 bg-night-900/40',
      )}
    >
      <Icon name={status.playing ? 'pause' : 'play'} size={16} color={color} />
      <Text className={cn('text-label font-medium', onPaper ? 'text-ink/70' : 'text-paper/80')}>
        {status.playing ? 'Playing' : label}
        {time ? ` · ${time}` : ''}
      </Text>
    </Pressable>
  );
}
