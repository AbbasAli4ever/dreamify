import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DreamArtTile } from '@/components/dream/dream-art-tile';
import { EchoCard } from '@/components/dream/echo-card';
import { ProcessingBar } from '@/components/home/processing-bar';
import { RecordOrb } from '@/components/home/record-orb';
import { BOTTOM_BAR_HEIGHT, BottomActionBar } from '@/components/layout/bottom-action-bar';
import { NightBackground } from '@/components/layout/night-background';
import { stageUi } from '@/components/processing/stage-checklist';
import { Avatar } from '@/components/ui/avatar';
import { CircleButton } from '@/components/ui/circle-button';
import { Icon } from '@/components/ui/icon';
import { PillButton } from '@/components/ui/pill-button';
import { RichText } from '@/components/ui/rich-text';
import { Body, Label, Meta, Title } from '@/components/ui/typography';
import { useAgentVoice } from '@/hooks/use-agent-voice';
import { useDreamRecorder } from '@/hooks/use-dream-recorder';
import { formatDuration, formatLongDate, greeting } from '@/lib/dates';
import { useDreams } from '@/providers/dreams-provider';
import { useProfile } from '@/providers/profile-provider';
import type { Dream } from '@/types/dream';

/** Shorter recordings are treated as accidental taps. */
const MIN_RECORDING_MS = 2000;
/** Stop waiting for the spoken reply after this long; the dream keeps processing. */
const REPLY_TIMEOUT_MS = 25000;

// S2 Home — docs/SCREENS.md §6. Voice capture happens here, in place:
// the mic button morphs into the orb and the user never leaves Home.
// After ✓ the same screen answers, minimally: the orb thinks, then speaks a short reply
// (Gemini → Deepgram) and moves with the voice. Only a slim progress bar shows the
// processing steps. When the dream is ready it opens by itself (no Processing screen).
export default function HomeScreen() {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const {
    dreams,
    latestEcho,
    getDream,
    createDream,
    startProcessing,
    replyAudio,
    loading,
    syncError,
  } = useDreams();
  const profile = useProfile();
  const recorder = useDreamRecorder();
  const voice = useAgentVoice();
  const scrollRef = useRef<ScrollView>(null);
  const [notice, setNotice] = useState<string | null>(null);
  /** True from ✓ until the dream row exists. */
  const [saving, setSaving] = useState(false);
  /** The spoken dream this screen is answering and processing, from ✓ until it opens. */
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [replyTimedOut, setReplyTimedOut] = useState<string | null>(null);

  const recording = recorder.status !== 'idle';
  const paused = recorder.status === 'paused';

  const session = sessionId ? getDream(sessionId) : undefined;
  // No reply is coming: it failed (''), the dream failed or finished without one, or we waited too long.
  const noReply =
    !!session &&
    (session.reply?.text === '' ||
      session.status === 'failed' ||
      (session.status === 'ready' && !session.reply) ||
      replyTimedOut === sessionId);
  const thinking = saving || (!!sessionId && voice.key !== sessionId && !noReply);
  const speaking = voice.speaking && voice.key === sessionId;
  const answering = saving || !!sessionId;
  const orbActive = recording || answering;
  const orbState = speaking
    ? 'breathing'
    : thinking
      ? 'searching'
      : session
        ? stageUi(session).orb
        : 'listening';
  const recent = dreams.slice(0, 5);
  const related = (latestEcho?.relatedDreamIds.map(getDream).filter(Boolean) ?? []) as Dream[];

  // "Speak instead" on the Write screen comes back here with `record=1`.
  const { record, saved } = useLocalSearchParams<{ record?: string; saved?: string }>();
  useEffect(() => {
    if (record !== '1') return;
    router.setParams({ record: undefined });
    startRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  function openWrite() {
    setNotice(null);
    router.push('/write');
  }

  async function startRecording() {
    setNotice(null);
    if (saved) router.setParams({ saved: undefined });
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    await recorder.start();
  }

  async function finishRecording() {
    const { uri, durationMs } = await recorder.stop();
    if (durationMs < MIN_RECORDING_MS) {
      setNotice('That was very short. Tap the mic and take your time.');
      return;
    }
    // Saved as `processing`; the pipeline starts below and the orb answers on this screen.
    setSaving(true);
    try {
      const id = await createDream({ inputType: 'voice', audioUri: uri ?? undefined });
      setSessionId(id);
    } catch {
      setNotice("Couldn't save your dream. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  // Run the pipeline for the new dream (same app-wide job the Processing screen uses).
  useEffect(() => {
    if (session?.status === 'processing') startProcessing(session);
  }, [session, startProcessing]);

  // The reply arrived: speak it. Afterwards the orb keeps working until the dream is ready.
  const startedVoice = useRef<string | null>(null);
  useEffect(() => {
    const reply = session?.reply;
    if (!sessionId || !reply?.text || noReply || startedVoice.current === sessionId) return;
    startedVoice.current = sessionId;
    const id = sessionId;
    replyAudio(id, reply.text).then((sources) => voice.speak(id, reply, sources, () => {}));
  }, [sessionId, session?.reply, voice, noReply, replyAudio]);

  // Don't keep the orb thinking forever if the reply never comes.
  useEffect(() => {
    if (!sessionId || voice.key === sessionId) return;
    const t = setTimeout(() => setReplyTimedOut(sessionId), REPLY_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [sessionId, voice.key]);

  // Ready and the agent is quiet: open the dream (only while Home is on screen).
  const readyId =
    session?.status === 'ready' && !thinking && !speaking ? session.id : null;
  useFocusEffect(
    useCallback(() => {
      if (!readyId) return;
      setSessionId(null);
      router.push({ pathname: '/dream/[id]', params: { id: readyId, fresh: '1' } });
    }, [readyId]),
  );

  function retrySession() {
    if (session) startProcessing({ ...session, status: 'processing' });
  }

  function closeSession() {
    voice.stop();
    setSessionId(null);
  }

  async function cancelRecording() {
    await recorder.cancel();
  }

  return (
    <View className="flex-1 bg-night-900">
      <NightBackground />

      <ScrollView
        ref={scrollRef}
        scrollEnabled={!orbActive}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + BOTTOM_BAR_HEIGHT + 24,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6">
          <View className="gap-0.5">
            <Meta>{formatLongDate()}</Meta>
            <Label className="text-body-lg text-paper">
              {greeting()}, {profile.name}
            </Label>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Your dream patterns"
            disabled={orbActive}
            onPress={() => router.push('/patterns')}
          >
            <Avatar source={profile.avatar} name={profile.name} size={44} />
          </Pressable>
        </View>

        {/* Hero: prompt + record button / listening orb */}
        <View
          className="items-center justify-center px-6"
          style={{
            minHeight: orbActive ? height - insets.top - 60 - BOTTOM_BAR_HEIGHT : height * 0.62,
          }}
        >
          {/* After ✓ only the orb speaks; the headline shows just while it's taking the dream in. */}
          {answering && !thinking ? null : (
            <Animated.View
              key={thinking ? 'thinking' : recorder.status}
              entering={FadeIn.duration(350)}
            >
              <RichText className="text-center">
                {paused
                  ? '*Paused*'
                  : recording
                    ? "I'm *listening*…"
                    : thinking
                      ? 'Taking it *in*…'
                      : 'What do you *remember*?'}
              </RichText>
            </Animated.View>
          )}

          <RecordOrb
            active={orbActive}
            level={answering ? voice.level : recorder.level}
            state={orbState}
            label={
              speaking
                ? 'Dreamify is speaking'
                : thinking
                  ? 'Thinking'
                  : answering
                    ? 'Working on your dream'
                    : 'Listening'
            }
            onPress={startRecording}
          />

          {answering ? null : recording ? (
            <Animated.View entering={FadeIn.duration(400)} className="items-center">
              <View className="items-center gap-2">
                <Label className="font-display-medium text-title text-paper">
                  {formatDuration(recorder.durationMs)}
                </Label>
                <Body className="text-center">Tell me everything, even fragments.</Body>
              </View>
            </Animated.View>
          ) : (
            <View className="items-center gap-4">
              <Pressable
                accessibilityRole="button"
                onPress={() => openWrite()}
                hitSlop={12}
                className="flex-row items-center gap-2 active:opacity-60"
              >
                <Icon name="pencil" size={16} color="rgba(255,255,255,0.7)" />
                <Label className="text-paper/70">Write instead</Label>
              </Pressable>
              {recorder.error === 'permission' ? (
                <Pressable onPress={() => Linking.openSettings()} accessibilityRole="button">
                  <Body className="text-center">
                    Microphone access is off.{' '}
                    <Label className="text-paper underline">Open Settings</Label>
                  </Body>
                </Pressable>
              ) : recorder.error === 'failed' ? (
                <Body className="text-center">
                  Couldn&apos;t start recording. Please try again.
                </Body>
              ) : notice || saved ? (
                <Body className="text-center">{notice ?? 'Saved to your dream world'}</Body>
              ) : syncError ? (
                <Body className="text-center">
                  Couldn&apos;t reach your dream world. Showing what&apos;s on this device.
                </Body>
              ) : loading ? (
                <Body className="text-center">Gathering your dreams…</Body>
              ) : dreams.length === 0 ? (
                <Body className="text-center">Your first dream starts your dream world.</Body>
              ) : null}
            </View>
          )}
        </View>

        {/* Hidden while recording or answering, so nothing competes with the orb. */}
        {!orbActive ? (
          <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(200)}>
            {latestEcho ? (
              <View className="px-6">
                <EchoCard
                  echo={latestEcho}
                  related={related}
                  onPress={() =>
                    router.push({ pathname: '/echo/[symbol]', params: { symbol: latestEcho.key } })
                  }
                />
              </View>
            ) : null}

            {recent.length > 0 ? (
              <View className="mt-10">
                <View className="flex-row items-end justify-between px-6">
                  <Title>Recent dreams</Title>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push('/archive')}
                    hitSlop={12}
                    className="flex-row items-center gap-1 active:opacity-60"
                  >
                    <Label>See all</Label>
                    <Icon name="chevron-right" size={14} color="rgba(255,255,255,0.6)" />
                  </Pressable>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  decelerationRate="fast"
                  snapToInterval={176 + 12}
                  contentContainerStyle={{ paddingHorizontal: 24, gap: 12, marginTop: 16 }}
                >
                  {recent.map((dream) => (
                    <DreamArtTile
                      key={dream.id}
                      dream={dream}
                      onPress={() =>
                        router.push({
                          pathname: dream.status === 'ready' ? '/dream/[id]' : '/processing/[id]',
                          params: { id: dream.id },
                        })
                      }
                    />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="link"
              onPress={() => router.push({ pathname: '/onboarding', params: { replay: '1' } })}
              hitSlop={12}
              className="mt-10 flex-row items-center justify-center gap-1.5 self-center active:opacity-60"
            >
              <Icon name="sparkle" size={13} color="rgba(255,255,255,0.45)" />
              <Meta className="text-paper/45">Take the walkthrough</Meta>
            </Pressable>
          </Animated.View>
        ) : null}
      </ScrollView>

      {answering ? (
        // Only the slim progress bar, from ✓ until the dream opens.
        <View className="absolute left-0 right-0 px-6" style={{ bottom: insets.bottom + 28 }}>
          <ProcessingBar dream={session} onRetry={retrySession} onClose={closeSession} />
        </View>
      ) : recording ? (
        <BottomActionBar
          left={
            <CircleButton
              icon="close"
              accessibilityLabel="Discard recording"
              onPress={cancelRecording}
            />
          }
          center={
            <PillButton
              variant="ghost"
              label={paused ? 'Resume' : 'Pause'}
              icon={<Icon name={paused ? 'play' : 'pause'} size={18} />}
              onPress={paused ? recorder.resume : recorder.pause}
              disabled={recorder.status === 'starting'}
              className="w-full bg-night-900/40"
            />
          }
          right={
            <CircleButton
              icon="check"
              variant="solid"
              accessibilityLabel="Finish recording"
              onPress={finishRecording}
              disabled={recorder.status === 'starting'}
            />
          }
        />
      ) : (
        <BottomActionBar
          left={
            <CircleButton
              icon="grid"
              accessibilityLabel="Dream archive"
              onPress={() => router.push('/archive')}
            />
          }
          center={
            <PillButton
              variant="ghost"
              label="Search"
              icon={<Icon name="search" size={18} />}
              onPress={() => router.push('/search')}
              className="w-full bg-night-900/40"
            />
          }
          right={
            <CircleButton
              icon="pencil"
              accessibilityLabel="Write a dream"
              onPress={() => openWrite()}
            />
          }
        />
      )}
    </View>
  );
}
