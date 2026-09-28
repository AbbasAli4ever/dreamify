import type { ReactNode } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';

import { AudioPlayButton } from '@/components/dream/audio-play-button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

type Common = { dateLabel: string; className?: string };

type ReadOnlyProps = Common & {
  editable?: false;
  text?: string;
  audioUri?: string;
  onEdit?: () => void;
};

type EditableProps = Common & {
  editable: true;
  value: string;
  onChangeText: (text: string) => void;
  /** Voice controls + save button for the footer. */
  footer: ReactNode;
};

// White "Insight" card (R08, R09): the user's answer to the reflection question.
export function InsightCard(props: ReadOnlyProps | EditableProps) {
  return (
    <View className={cn('overflow-hidden rounded-card bg-paper', props.className)}>
      <View className="flex-row items-center justify-between border-b border-ink/10 px-5 pb-3 pt-4">
        <Text className="font-display-medium text-[17px] text-ink">Insight</Text>
        <Icon name="feather" size={20} color="#0B0B0F" />
      </View>

      {props.editable ? (
        <TextInput
          value={props.value}
          onChangeText={props.onChangeText}
          autoFocus
          multiline
          placeholder="What does it bring up for you?"
          placeholderTextColor="rgba(11,11,15,0.35)"
          selectionColor="#0B0B0F"
          cursorColor="#0B0B0F"
          accessibilityLabel="Your insight"
          className="min-h-[110px] px-5 pt-4 text-ink"
          style={[
            { fontSize: 20, lineHeight: 28, textAlignVertical: 'top' },
            // No browser focus ring on web; the caret is enough.
            Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
          ]}
        />
      ) : props.text ? (
        <Text className="px-5 pt-4 text-[20px] leading-[28px] text-ink">{props.text}</Text>
      ) : null}

      <View className="flex-row items-center justify-between gap-3 px-5 pb-4 pt-4">
        <Text className="text-meta text-ink/40">{props.dateLabel}</Text>
        {props.editable ? (
          props.footer
        ) : (
          <View className="flex-row items-center gap-2">
            {props.audioUri ? (
              <AudioPlayButton uri={props.audioUri} label="Voice note" onPaper />
            ) : null}
            {props.onEdit ? (
              <Pressable
                accessibilityRole="button"
                onPress={props.onEdit}
                hitSlop={10}
                className="active:opacity-60"
              >
                <Text className="text-label font-medium text-ink/60 underline">Edit</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
}
