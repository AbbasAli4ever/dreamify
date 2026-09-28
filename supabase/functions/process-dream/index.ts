// process-dream: turns a saved dream into a full one.
//   Deepgram STT (voice dreams) → Gemini analysis → Gemini artwork + Deepgram TTS of the question.
// Replies 202 at once and keeps working in the background; the app polls `processing_stage`.

import '@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from '@supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

import { transcribeAudio, speak } from '../_shared/deepgram.ts';
import { analyzeDream, paintDream } from '../_shared/gemini.ts';

type Admin = SupabaseClient;

type DreamRow = {
  id: string;
  user_id: string;
  status: string;
  transcript: string;
  audio_path: string | null;
};

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Strip *emphasis* markers so TTS reads plain text. */
const plain = (s: string) => s.replace(/\*/g, '');

const EXT: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

async function run(admin: Admin, dream: DreamRow) {
  const update = async (patch: Record<string, unknown>) => {
    const { error } = await admin.from('dreams').update(patch).eq('id', dream.id);
    if (error) throw new Error(`update failed: ${error.message}`);
  };

  try {
    await update({ status: 'processing', processing_stage: 0, error: null });

    // 1. Understand the story: transcribe voice dreams.
    let transcript = dream.transcript?.trim() ?? '';
    if (!transcript && dream.audio_path) {
      const { data: file, error } = await admin.storage.from('dream-audio').download(dream.audio_path);
      if (error || !file) throw new Error(`audio download failed: ${error?.message}`);
      transcript = await transcribeAudio(await file.arrayBuffer(), file.type || 'audio/mp4');
      if (!transcript) throw new Error("Couldn't hear any words in the recording.");
    }

    // Earlier dreams give Gemini context for recurring symbols (Dream Echo).
    const { data: history } = await admin
      .from('dreams')
      .select('title, symbols')
      .eq('user_id', dream.user_id)
      .eq('status', 'ready')
      .neq('id', dream.id)
      .order('created_at', { ascending: false })
      .limit(20);

    const a = await analyzeDream(transcript, history ?? []);

    // Reveal stage by stage (short pauses let the Processing screen show each step).
    await update({ transcript, title: a.title, processing_stage: 1 });
    await pause(500);
    await update({ emotions: a.emotions, processing_stage: 2 });
    await pause(500);
    await update({
      symbols: a.symbols,
      themes: a.themes,
      interpretation: a.interpretation,
      question: a.question,
      art_prompt: a.art_prompt,
      artwork_color: a.color,
      processing_stage: 3,
    });

    // 4. Paint the dream and voice the question in parallel. Neither is fatal:
    // a dream without art or audio is still a dream.
    const folder = dream.user_id;
    const [art, voice] = await Promise.allSettled([
      paintDream(a.art_prompt).then(async ({ bytes, mimeType }) => {
        const path = `${folder}/${dream.id}.${EXT[mimeType] ?? 'png'}`;
        const { error } = await admin.storage
          .from('dream-art')
          .upload(path, bytes, { contentType: mimeType, upsert: true });
        if (error) throw new Error(error.message);
        return path;
      }),
      speak(plain(a.question)).then(async (bytes) => {
        const path = `${folder}/${dream.id}-question.mp3`;
        const { error } = await admin.storage
          .from('dream-audio')
          .upload(path, bytes, { contentType: 'audio/mpeg', upsert: true });
        if (error) throw new Error(error.message);
        return path;
      }),
    ]);

    const problems = [art, voice]
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map((r) => String(r.reason?.message ?? r.reason));
    if (problems.length) console.error('process-dream partial failure', dream.id, problems);

    await update({
      artwork_path: art.status === 'fulfilled' ? art.value : null,
      question_audio_path: voice.status === 'fulfilled' ? voice.value : null,
      error: problems.length ? problems.join(' | ').slice(0, 500) : null,
      processing_stage: 4,
      status: 'ready',
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('process-dream failed', dream.id, message);
    await admin.from('dreams').update({ status: 'failed', error: message.slice(0, 500) }).eq('id', dream.id);
  }
}

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    const { dream_id } = await req.json().catch(() => ({}));
    if (typeof dream_id !== 'string') return Response.json({ error: 'dream_id is required' }, { status: 400 });

    // RLS-scoped read: a user can only process their own dream.
    const { data: dream, error } = await ctx.supabase
      .from('dreams')
      .select('id, user_id, status, transcript, audio_path')
      .eq('id', dream_id)
      .single();
    if (error || !dream) return Response.json({ error: 'Dream not found' }, { status: 404 });
    if (dream.status === 'ready') return Response.json({ status: 'ready' });

    const work = run(ctx.supabaseAdmin as unknown as Admin, dream as DreamRow);
    // Keep running after the response (Supabase background tasks). If the runtime
    // ever lacks waitUntil, finish the work before replying instead of losing it.
    const edge = (globalThis as { EdgeRuntime?: { waitUntil: (p: Promise<unknown>) => void } }).EdgeRuntime;
    if (edge) edge.waitUntil(work);
    else await work;
    return Response.json({ status: 'processing' }, { status: 202 });
  }),
};
