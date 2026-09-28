// Supabase data access for dreams: rows ⇄ the app's `Dream` type, file uploads,
// and the edge functions (process-dream, transcribe). See supabase/migrations.

import { File } from 'expo-file-system';
import { Platform } from 'react-native';

import { supabase } from '@/lib/backend/supabase';
import { splitReply } from '@/lib/reply';
import type { Dream } from '@/types/dream';

type DreamRow = {
  id: string;
  user_id: string;
  created_at: string;
  input_type: 'voice' | 'text';
  status: Dream['status'];
  processing_stage: number;
  error: string | null;
  transcript: string;
  audio_path: string | null;
  title: string | null;
  interpretation: string | null;
  emotions: Dream['emotions'];
  symbols: Dream['symbols'];
  themes: string[];
  artwork_path: string | null;
  artwork_color: string | null;
  question: string | null;
  question_audio_path: string | null;
  answer_text: string | null;
  answer_audio_path: string | null;
  answered_at: string | null;
  reply_text: string | null;
};

const URL_TTL = 60 * 60 * 24 * 7; // signed URLs last a week

function db() {
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
}

/** Signed URLs for private files, in one request per bucket. */
async function signAll(bucket: string, paths: (string | null)[]) {
  const wanted = [...new Set(paths.filter((p): p is string => !!p))];
  const map = new Map<string, string>();
  if (!wanted.length) return map;
  const { data } = await db().storage.from(bucket).createSignedUrls(wanted, URL_TTL);
  for (const item of data ?? [])
    if (item.path && item.signedUrl) map.set(item.path, item.signedUrl);
  return map;
}

async function toDreams(rows: DreamRow[]): Promise<Dream[]> {
  const [art, audio] = await Promise.all([
    signAll(
      'dream-art',
      rows.map((r) => r.artwork_path),
    ),
    signAll(
      'dream-audio',
      rows.flatMap((r) => [r.audio_path, r.question_audio_path, r.answer_audio_path]),
    ),
  ]);
  return rows.map((r) => {
    const artUrl = r.artwork_path ? art.get(r.artwork_path) : undefined;
    return {
      id: r.id,
      createdAt: r.created_at,
      inputType: r.input_type,
      status: r.status,
      processingStage: r.processing_stage,
      error: r.error ?? undefined,
      transcript: r.transcript,
      audioUri: r.audio_path ? audio.get(r.audio_path) : undefined,
      reply: r.reply_text === null ? undefined : { text: r.reply_text },
      title: r.title ?? undefined,
      interpretation: r.interpretation ?? undefined,
      emotions: r.emotions ?? [],
      symbols: r.symbols ?? [],
      themes: r.themes ?? [],
      artwork: artUrl ? { uri: artUrl, cacheKey: r.artwork_path! } : undefined,
      artworkColor: r.artwork_color ?? undefined,
      reflection: r.question
        ? {
            question: r.question,
            questionAudioUri: r.question_audio_path ? audio.get(r.question_audio_path) : undefined,
            answerText: r.answer_text ?? undefined,
            answerAudioUri: r.answer_audio_path ? audio.get(r.answer_audio_path) : undefined,
            answeredAt: r.answered_at ?? undefined,
          }
        : undefined,
    };
  });
}

export async function fetchDreams(): Promise<Dream[]> {
  const { data, error } = await db()
    .from('dreams')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return toDreams((data ?? []) as DreamRow[]);
}

export async function fetchDream(id: string): Promise<Dream | null> {
  const { data, error } = await db().from('dreams').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? (await toDreams([data as DreamRow]))[0] : null;
}

/** Uploads a local recording to dream-audio/<user>/<name> and returns its storage path. */
async function uploadAudio(localUri: string, name: string) {
  const { data: auth } = await db().auth.getUser();
  if (!auth.user) throw new Error('Not signed in');
  const ext = localUri.split('.').pop()?.split('?')[0]?.toLowerCase() || 'm4a';
  const path = `${auth.user.id}/${name}.${ext}`;
  const body =
    Platform.OS === 'web'
      ? await (await fetch(localUri)).arrayBuffer()
      : await new File(localUri).arrayBuffer();
  const contentType = ext === 'webm' ? 'audio/webm' : ext === 'wav' ? 'audio/wav' : 'audio/mp4';
  const { error } = await db()
    .storage.from('dream-audio')
    .upload(path, body, { contentType, upsert: true });
  if (error) throw error;
  return path;
}

/** Creates the dream row (uploading the recording first for voice dreams) and returns it. */
export async function createDream(input: {
  inputType: 'voice' | 'text';
  transcript?: string;
  audioUri?: string;
}) {
  const id = globalThis.crypto?.randomUUID?.() ?? undefined;
  let audio_path: string | null = null;
  if (input.inputType === 'voice' && input.audioUri) {
    audio_path = await uploadAudio(input.audioUri, id ?? `${Date.now()}`);
  }
  const { data, error } = await db()
    .from('dreams')
    .insert({
      ...(id ? { id } : null),
      input_type: input.inputType,
      transcript: input.transcript ?? '',
      audio_path,
      status: 'processing',
    })
    .select('*')
    .single();
  if (error) throw error;
  return (await toDreams([data as DreamRow]))[0];
}

/** Starts the AI pipeline (returns immediately; poll `fetchDream` for progress). */
export async function startProcessing(id: string) {
  const { error } = await db().functions.invoke('process-dream', { body: { dream_id: id } });
  if (error) throw error;
}

export async function saveReflection(
  id: string,
  answer: { text?: string; audioUri?: string; answeredAt: string },
) {
  let answer_audio_path: string | null | undefined;
  if (answer.audioUri?.startsWith('file:') || answer.audioUri?.startsWith('blob:')) {
    answer_audio_path = await uploadAudio(answer.audioUri, `${id}-insight-${Date.now()}`);
  }
  const { error } = await db()
    .from('dreams')
    .update({
      answer_text: answer.text ?? null,
      answered_at: answer.answeredAt,
      ...(answer_audio_path !== undefined ? { answer_audio_path } : null),
    })
    .eq('id', id);
  if (error) throw error;
}

/**
 * The agent's reply as audio sources, one per part (sentence group, see lib/reply.ts):
 * the `speak` function voices each with Deepgram on demand. Sent with the user's JWT,
 * so only the owner can play them.
 */
export async function replyAudioSources(id: string, text: string) {
  const { data } = await db().auth.getSession();
  const token = data.session?.access_token;
  if (!token) return null;
  const headers = {
    Authorization: `Bearer ${token}`,
    apikey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '',
  };
  const base = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/speak?dream=${encodeURIComponent(id)}`;
  return splitReply(text).map((_, part) => ({ uri: `${base}&part=${part}`, headers }));
}

/** Deepgram speech-to-text for a local voice note (via the `transcribe` function). */
export async function transcribeVoiceNote(localUri: string) {
  const path = await uploadAudio(localUri, `note-${Date.now()}`);
  const { data, error } = await db().functions.invoke('transcribe', { body: { path } });
  if (error) throw error;
  return (data as { text?: string })?.text ?? '';
}

export async function deleteDream(dream: Dream) {
  const { data: row } = await db()
    .from('dreams')
    .select('audio_path, artwork_path, question_audio_path, answer_audio_path')
    .eq('id', dream.id)
    .maybeSingle();
  const { error } = await db().from('dreams').delete().eq('id', dream.id);
  if (error) throw error;
  if (row) {
    const audio = [row.audio_path, row.question_audio_path, row.answer_audio_path].filter(Boolean);
    if (audio.length)
      await db()
        .storage.from('dream-audio')
        .remove(audio as string[]);
    if (row.artwork_path) await db().storage.from('dream-art').remove([row.artwork_path]);
  }
}
