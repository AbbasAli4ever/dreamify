import Constants from 'expo-constants';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MistBackground } from '@/components/layout/mist-background';
import { SettingsGroup, SettingsRow } from '@/components/settings/settings-row';
import { CircleButton } from '@/components/ui/circle-button';
import { Icon } from '@/components/ui/icon';
import { formatDateTime } from '@/lib/dates';
import { ensureReminderPermission, scheduleMorningReminder } from '@/lib/reminders';
import { setOnboarded } from '@/lib/storage';
import { useDreams } from '@/providers/dreams-provider';
import { useProfile, type Reminder } from '@/providers/profile-provider';

const TIMES = [
  [6, 0],
  [6, 30],
  [7, 0],
  [7, 30],
  [8, 0],
  [8, 30],
] as const;

const hhmm = (h: number, m: number) =>
  `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

function confirm(title: string, message: string, action: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${title}\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: action, style: 'destructive', onPress: onConfirm },
  ]);
}

// S10 Settings — docs/SCREENS.md §6. Minimal, on the light Mist theme (R25).
export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const profile = useProfile();
  const { dreams, backend, signOut: signOutDreams } = useDreams();
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(profile.name);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function updateReminder(next: Reminder) {
    setNotice(null);
    if (next.enabled && !(await ensureReminderPermission())) {
      setNotice(
        Platform.OS === 'web'
          ? 'Reminders work in the mobile app.'
          : 'Notifications are off for Dreamify. Turn them on in Settings.',
      );
      profile.setReminder({ ...next, enabled: false });
      return;
    }
    profile.setReminder(next);
    await scheduleMorningReminder(next).catch(() => setNotice("Couldn't schedule the reminder."));
  }

  function exportDreams() {
    const ready = dreams.filter((d) => d.status === 'ready');
    const text = ready
      .map((d) =>
        [
          `${d.title}`,
          formatDateTime(d.createdAt),
          d.emotions.length ? `Emotions: ${d.emotions.map((e) => e.label).join(', ')}` : '',
          d.symbols.length ? `Symbols: ${d.symbols.map((s) => s.label).join(', ')}` : '',
          '',
          d.transcript,
          d.reflection?.answerText ? `\nInsight: ${d.reflection.answerText}` : '',
        ]
          .filter((l) => l !== '')
          .join('\n'),
      )
      .join('\n\n———\n\n');
    Share.share({
      title: 'My dreams',
      message: `My Dreamify journal · ${ready.length} dreams\n\n${text}`,
    }).catch(() => {});
  }

  function signOut() {
    confirm(
      'Sign out?',
      backend
        ? 'This device will start fresh with a new private dream world. Your current dreams stay saved in the cloud, but this device will no longer be able to open them.'
        : 'Your name and reminder will be reset and onboarding will show again.',
      'Sign out',
      async () => {
        await scheduleMorningReminder({ enabled: false, hour: 7, minute: 0 }).catch(() => {});
        profile.reset();
        await signOutDreams();
        await setOnboarded(false);
        router.dismissAll();
        router.replace('/onboarding');
      },
    );
  }

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <View className="flex-1 bg-paper">
      <StatusBar style="dark" />
      <MistBackground />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 24,
        }}
      >
        <View className="h-12 flex-row items-center">
          <CircleButton
            icon="back"
            size="sm"
            variant="ink"
            accessibilityLabel="Back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
          />
        </View>
        <Text className="mb-8 mt-6 font-display-semibold text-[44px] leading-[48px] tracking-[-1px] text-ink">
          Settings
        </Text>

        <View className="gap-8">
          {/* Profile */}
          <SettingsGroup title="Profile">
            {editingName ? (
              <View className="flex-row items-center gap-3 px-5 py-3">
                <TextInput
                  value={draftName}
                  onChangeText={setDraftName}
                  autoFocus
                  maxLength={30}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    profile.setName(draftName);
                    setEditingName(false);
                  }}
                  accessibilityLabel="Your name"
                  selectionColor="#0B0B0F"
                  className="flex-1 font-display text-[19px] text-ink"
                  style={Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : undefined}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Save name"
                  onPress={() => {
                    profile.setName(draftName);
                    setEditingName(false);
                  }}
                  className="h-9 justify-center rounded-full bg-ink px-4 active:opacity-80"
                >
                  <Text className="text-label font-medium text-paper">Save</Text>
                </Pressable>
              </View>
            ) : (
              <SettingsRow
                icon="pencil"
                label={profile.name}
                detail="Your name, used in greetings"
                onPress={() => {
                  setDraftName(profile.name);
                  setEditingName(true);
                }}
                last
              />
            )}
          </SettingsGroup>

          {/* Reminder */}
          <SettingsGroup title="Morning reminder">
            <SettingsRow
              icon="sparkle"
              label="Remind me each morning"
              detail={
                profile.reminder.enabled
                  ? `Every day at ${hhmm(profile.reminder.hour, profile.reminder.minute)}`
                  : 'Off'
              }
              right={
                <Switch
                  accessibilityLabel="Morning reminder"
                  value={profile.reminder.enabled}
                  onValueChange={(enabled) => updateReminder({ ...profile.reminder, enabled })}
                  trackColor={{ true: '#0B0B0F', false: 'rgba(11,11,15,0.15)' }}
                  thumbColor="#FFFFFF"
                />
              }
              last={!profile.reminder.enabled}
            />
            {profile.reminder.enabled ? (
              <View className="flex-row flex-wrap gap-2 px-5 pb-4 pt-3">
                {TIMES.map(([h, m]) => {
                  const selected = profile.reminder.hour === h && profile.reminder.minute === m;
                  return (
                    <Pressable
                      key={hhmm(h, m)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={`Remind me at ${hhmm(h, m)}`}
                      onPress={() => updateReminder({ enabled: true, hour: h, minute: m })}
                      className={`h-9 justify-center rounded-full border px-4 ${selected ? 'border-ink bg-ink' : 'border-ink/15'}`}
                    >
                      <Text
                        className={`text-label font-medium ${selected ? 'text-paper' : 'text-ink/70'}`}
                      >
                        {hhmm(h, m)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </SettingsGroup>
          {notice ? <Text className="-mt-5 px-1 text-meta text-ink/60">{notice}</Text> : null}

          {/* Data + about */}
          <SettingsGroup title="Your dreams">
            <SettingsRow
              icon="share"
              label="Export my dreams"
              detail={`${dreams.filter((d) => d.status === 'ready').length} dreams as text`}
              onPress={exportDreams}
            />
            <SettingsRow
              icon="feather"
              label="About Dreamify"
              right={
                <View style={{ transform: [{ rotate: aboutOpen ? '180deg' : '0deg' }] }}>
                  <Icon name="chevron-down" size={18} color="rgba(11,11,15,0.35)" />
                </View>
              }
              onPress={() => setAboutOpen((v) => !v)}
              last={!aboutOpen}
            />
            {aboutOpen ? (
              <View className="gap-2 px-5 pb-5">
                <Text className="text-body leading-[22px] text-ink/70">
                  A voice-first AI dream journal. Speak a dream when you wake, and Dreamify turns it
                  into artwork, finds its emotions and symbols, and remembers what keeps returning:
                  your Dream Echo.
                </Text>
                <Text className="text-meta text-ink/45">
                  Orb animation: thinking-orbs by Jakub Antalik (MIT).
                </Text>
              </View>
            ) : null}
          </SettingsGroup>

          <SettingsGroup>
            <SettingsRow icon="close" label="Sign out" onPress={signOut} destructive last />
          </SettingsGroup>
        </View>

        <Text className="mt-10 text-center text-meta text-ink/35">Dreamify {version}</Text>
      </ScrollView>
    </View>
  );
}
