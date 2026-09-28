// speak: voices the agent's reply for one of the user's dreams (Deepgram Aura-2 TTS).
// GET /functions/v1/speak?dream=<id>&part=<0-2> with the user's JWT → audio/mpeg for that part
// of the reply (see _shared/reply.ts). The app fetches all parts at once and plays them in turn.
// The Deepgram key stays here; the app only ever sees audio.
// The MP3 is sent whole, with a length: piping Deepgram's stream through was ~1.5 s faster
// but was sometimes cut off or reset mid-sentence in testing.

import '@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from '@supabase/server';

import { speak } from '../_shared/deepgram.ts';
import { splitReply } from '../_shared/reply.ts';

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    const params = new URL(req.url).searchParams;
    const id = params.get('dream');
    const part = Number(params.get('part') ?? 0);
    if (!id || !Number.isInteger(part) || part < 0)
      return Response.json({ error: 'dream and part are required' }, { status: 400 });

    // RLS-scoped read: only the owner's reply can be spoken.
    const { data: dream } = await ctx.supabase
      .from('dreams')
      .select('reply_text')
      .eq('id', id)
      .maybeSingle();
    const text = splitReply(dream?.reply_text?.trim() ?? '')[part];
    if (!text) return Response.json({ error: 'No reply for this dream' }, { status: 404 });

    try {
      const bytes = await speak(text).catch(() => speak(text)); // one retry
      return new Response(bytes, {
        headers: {
          'content-type': 'audio/mpeg',
          'content-length': String(bytes.byteLength),
          'cache-control': 'private, max-age=3600',
        },
      });
    } catch (e) {
      console.error('speak failed', id, String(e));
      return Response.json({ error: 'Voice failed' }, { status: 502 });
    }
  }),
};
