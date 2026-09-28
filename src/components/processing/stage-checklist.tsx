import type { ReactNode } from 'react';
import { View } from 'react-native';

import type { OrbState } from '@/components/orb/use-orb-animation';
import { StageRow, type StageStatus } from '@/components/processing/stage-row';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Label } from '@/components/ui/typography';
import { STAGES, type StageKey } from '@/lib/ai/process-dream';
import { findEcho } from '@/lib/echo';
import type { Dream } from '@/types/dream';

/** Label + orb shape per stage (docs/SCREENS.md §2.6). */
export const STAGE_UI: Record<StageKey, { label: string; orb: OrbState }> = {
  story: { label: 'Understanding the story', orb: 'working' },
  emotions: { label: 'Finding emotions', orb: 'composing' },
  symbols: { label: 'Finding symbols', orb: 'connecting' },
  painting: { label: 'Painting your dream', orb: 'weaving' },
};

/** Index of the stage in progress (STAGES.length when done). */
export function currentStage(dream: Dream) {
  return dream.status === 'ready' ? STAGES.length : (dream.processingStage ?? 0);
}

/** The stage in progress, clamped to the last one. */
export function stageUi(dream: Dream) {
  return STAGE_UI[STAGES[Math.min(currentStage(dream), STAGES.length - 1)]];
}

type StageChecklistProps = {
  dream: Dream;
  /** All dreams, to show a Dream Echo under "Finding symbols". */
  dreams: Dream[];
  className?: string;
};

// The four pipeline steps with their results revealed as each one finishes.
// Used on Processing (S4) and under the speaking orb on Home.
export function StageChecklist({ dream, dreams, className }: StageChecklistProps) {
  const stage = currentStage(dream);
  const failed = dream.status === 'failed';
  const echo = stage > 2 ? findEcho(dream, dreams) : null;

  const statusOf = (i: number): StageStatus =>
    i < stage ? 'done' : i === stage && !failed ? 'active' : 'pending';

  const reveals: Record<StageKey, ReactNode> = {
    story: dream.title ? <Label className="text-paper/80">“{dream.title}”</Label> : null,
    emotions: dream.emotions.length ? (
      <Label className="text-paper/80">{dream.emotions.map((e) => e.label).join(' · ')}</Label>
    ) : null,
    symbols: dream.symbols.length ? (
      <View className="gap-2">
        <View className="flex-row gap-2">
          {dream.symbols.map((s) => (
            <SymbolIcon key={s.key} symbol={s.key} size={30} />
          ))}
        </View>
        {echo ? (
          <Label className="text-paper/80">
            {echo.label} echoes {echo.count} of your dreams
          </Label>
        ) : null}
      </View>
    ) : null,
    painting: <Label className="text-paper/80">Your dream is ready</Label>,
  };

  return (
    <View className={className ?? 'gap-5'}>
      {STAGES.map((key, i) => (
        <StageRow key={key} label={STAGE_UI[key].label} status={statusOf(i)}>
          {reveals[key]}
        </StageRow>
      ))}
    </View>
  );
}
