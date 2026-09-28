import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';

import { KindredGraph } from '@/components/kindred/kindred-graph';
import { KindredSheet } from '@/components/kindred/kindred-sheet';
import { Section } from '@/components/layout/section';
import { Icon } from '@/components/ui/icon';
import { RichText } from '@/components/ui/rich-text';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Body, Label, Meta } from '@/components/ui/typography';
import { useDreamKindred } from '@/hooks/use-kindred';
import { kindredLines, pulseLine, symbolLabel } from '@/lib/kindred';
import type { Dream } from '@/types/dream';
import type { KindredMatch } from '@/types/kindred';

const CENTER = 64;

// S5 "Kindred dreamers": people whose dreams were alike within 10 days of this one,
// written into the dream's description, drawn as a mesh, and one tap from a pop-up.
export function KindredSection({ dream }: { dream: Dream }) {
  const { width } = useWindowDimensions();
  const { status, matches, pulse } = useDreamKindred(dream);
  const [open, setOpen] = useState<KindredMatch | null>(null);

  if (status === 'error') return null;

  const lines = kindredLines(matches, dream);
  // Only symbols someone else also dreamt of are worth a line.
  const pulses = pulse.filter((p) => p.dreamers > 1 && p.total > 1).slice(0, 2);
  const sample = matches.some((m) => m.sample);

  return (
    <Section>
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Label>Kindred dreamers</Label>
          <Icon name="sparkle" size={14} color="rgba(255,255,255,0.6)" />
        </View>
        {sample ? <Meta className="text-paper/40">Sample</Meta> : null}
      </View>

      {status === 'off' ? (
        <Pressable accessibilityRole="button" onPress={() => router.push('/settings')}>
          <Body>
            Kindred dreamers is off.{' '}
            <Label className="text-paper underline">Turn it on in Settings</Label> to meet people
            who dream like you.
          </Body>
        </Pressable>
      ) : status === 'loading' ? (
        <Body>Looking for dreamers who saw something alike…</Body>
      ) : !matches.length ? (
        <Body>
          No one has dreamt anything like this yet. If someone does within 10 days, they&apos;ll
          appear here.
        </Body>
      ) : (
        <>
          <View className="gap-2">
            {lines.map((line) => (
              <RichText key={line} className="text-lead">
                {line}
              </RichText>
            ))}
          </View>

          <View className="mt-4 items-center">
            <KindredGraph
              width={Math.min(width - 48, 380)}
              height={Math.min(width - 48, 380) * 0.92}
              centerSize={CENTER}
              center={
                dream.artwork ? (
                  <Image
                    source={dream.artwork}
                    contentFit="cover"
                    style={{ width: CENTER, height: CENTER, borderRadius: CENTER / 2 }}
                    accessibilityLabel="Your dream"
                  />
                ) : (
                  <SymbolIcon
                    symbol={dream.symbols[0]?.key ?? 'star'}
                    size={CENTER}
                    className="bg-night-800"
                  />
                )
              }
              nodes={matches.map((m) => ({
                id: m.person,
                name: m.name,
                avatarUrl: m.avatarUrl,
                color: m.color,
                match: m.match,
                symbols: m.symbols,
                vibeOnly: !m.sharedSymbols.length,
              }))}
              onPressNode={(id) => setOpen(matches.find((m) => m.person === id) ?? null)}
            />
          </View>

          {pulses.length ? (
            <View className="mt-2 gap-3">
              {pulses.map((p) => (
                <View key={p.key} className="flex-row items-center gap-3">
                  <SymbolIcon symbol={p.key} size={32} />
                  <RichText className="flex-1 text-body-lg">
                    {pulseLine(p, symbolLabel(p.key, dream))}
                  </RichText>
                </View>
              ))}
            </View>
          ) : null}

          <Pressable
            accessibilityRole="link"
            onPress={() => router.push('/kindred')}
            hitSlop={10}
            className="mt-6 flex-row items-center gap-1 self-start active:opacity-60"
          >
            <Label className="text-paper/80">See your dream circle</Label>
            <Icon name="chevron-right" size={14} color="rgba(255,255,255,0.6)" />
          </Pressable>
        </>
      )}

      <KindredSheet match={open} dream={dream} onClose={() => setOpen(null)} />
    </Section>
  );
}
