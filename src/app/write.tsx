import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomActionBar } from '@/components/layout/bottom-action-bar';
import { NightBackground } from '@/components/layout/night-background';
import { StarterChips } from '@/components/write/starter-chips';
import { CircleButton } from '@/components/ui/circle-button';
import { Icon } from '@/components/ui/icon';
import { Label, Meta } from '@/components/ui/typography';
import { getWriteDraft, setWriteDraft } from '@/lib/storage';
import { useDreams } from '@/providers/dreams-provider';

/** ✓ unlocks from this many words. */
const MIN_WORDS = 3;

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function nowLabel() {
  return new Date().toLocaleString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// S3 Write — docs/SCREENS.md §6. The typed alternative to speaking on Home.
export default function WriteScreen() {
  const insets = useSafeAreaInsets();
  const { createDream } = useDreams();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState('');
  const [restored, setRestored] = useState(false);
  const [openedAt] = useState(nowLabel);

  const words = countWords(text);
  const canSave = words >= MIN_WORDS;

  // Restore an unsaved draft, then keep it saved as the user types.
  useEffect(() => {
    getWriteDraft().then((draft) => {
      if (draft) setText(draft);
      setRestored(true);
    });
  }, []);

  useEffect(() => {
    if (!restored) return;
    const t = setTimeout(() => setWriteDraft(text), 400);
    return () => clearTimeout(t);
  }, [text, restored]);

  function addStarter(starter: string) {
    setText((prev) => {
      const trimmed = prev.trimEnd();
      if (!trimmed) return starter;
      return /[.!?…]$/.test(trimmed) ? `${trimmed} ${starter}` : `${trimmed}. ${starter}`;
    });
    inputRef.current?.focus();
  }

  function close() {
    if (!text.trim()) {
      router.back();
      return;
    }
    const discard = async () => {
      await setWriteDraft('');
      router.back();
    };
    // RN's Alert is a no-op on web.
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.('Discard this dream? What you wrote will be lost.')) discard();
      return;
    }
    Alert.alert('Discard this dream?', 'What you wrote will be lost.', [
      { text: 'Keep writing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: discard },
    ]);
  }

  async function switchToVoice() {
    // Keep the draft; Home starts recording when it sees `record=1`.
    await setWriteDraft(text);
    router.dismissTo({ pathname: '/home', params: { record: '1' } });
  }

  async function save() {
    if (!canSave || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      // Saved as `processing`; the Processing screen (S4) turns it into a full dream.
      const id = await createDream({ inputType: 'text', transcript: text.trim() });
      await setWriteDraft('');
      router.replace({ pathname: '/processing/[id]', params: { id } });
    } catch {
      setSaveError("Couldn't save. Your words are kept here; try again.");
      setSaving(false);
    }
  }

  return (
    <View className="flex-1 bg-night-900">
      <NightBackground scrim={0.75} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, paddingTop: insets.top + 12 }}
      >
        {/* Header */}
        <View className="flex-row items-start justify-between px-6">
          <View className="gap-1">
            <Meta>{openedAt}</Meta>
            <View className="flex-row items-center gap-2">
              <Label className="text-paper">Your dream</Label>
              <Icon name="feather" size={14} color="rgba(255,255,255,0.7)" />
            </View>
          </View>
          <Meta>{words === 1 ? '1 word' : `${words} words`}</Meta>
        </View>

        {/* Writing area */}
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          autoFocus
          multiline
          scrollEnabled
          textAlignVertical="top"
          placeholder="Start with anything you remember… a place, a feeling, a face."
          placeholderTextColor="rgba(255,255,255,0.35)"
          selectionColor="#FFFFFF"
          cursorColor="#FFFFFF"
          accessibilityLabel="Your dream"
          className="mt-6 flex-1 px-6 text-body-lg text-paper"
          style={[
            { fontSize: 22, lineHeight: 32 },
            // No browser focus ring on web; the caret is enough.
            Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
          ]}
        />

        {/* Helpers + actions, kept above the keyboard */}
        {saveError ? <Meta className="px-6 pb-2 text-paper/80">{saveError}</Meta> : null}
        {words < 12 ? (
          <View className="pb-1 pt-2">
            <StarterChips onPick={addStarter} />
          </View>
        ) : null}
        <View style={{ paddingBottom: insets.bottom }}>
          <BottomActionBar
            floating={false}
            left={<CircleButton icon="close" accessibilityLabel="Close" onPress={close} />}
            center={
              <CircleButton icon="mic" accessibilityLabel="Speak instead" onPress={switchToVoice} />
            }
            right={
              <CircleButton
                icon="check"
                variant="solid"
                accessibilityLabel="Save dream"
                onPress={save}
                disabled={!canSave || saving}
                className={canSave && !saving ? undefined : 'opacity-40'}
              />
            }
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
