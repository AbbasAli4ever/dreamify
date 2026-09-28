// transcribe: Deepgram speech-to-text for a voice note the user uploaded
// (e.g. answering the reflection question by voice). Returns { text }.

import '@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from '@supabase/server';

import { transcribeAudio } from '../_shared/deepgram.ts';

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    const { path } = await req.json().catch(() => ({}));
    if (typeof path !== 'string') return Response.json({ error: 'path is required' }, { status: 400 });

    // RLS-scoped download: storage policies only allow the user's own folder.
    const { data: file, error } = await ctx.supabase.storage.from('dream-audio').download(path);
    if (error || !file) return Response.json({ error: 'Audio not found' }, { status: 404 });

    try {
      const text = await transcribeAudio(await file.arrayBuffer(), file.type || 'audio/mp4');
      return Response.json({ text });
    } catch (e) {
      console.error('transcribe failed', e);
      return Response.json({ error: 'Transcription failed' }, { status: 502 });
    }
  }),
};
