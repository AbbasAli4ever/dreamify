-- Dreamify: the agent's short spoken reply to a voice dream (Gemini text → Deepgram TTS).
-- reply_text: null = not ready yet, '' = no reply (it failed; the dream still processes).
alter table public.dreams
  add column reply_text text,
  add column reply_audio_path text;   -- dream-audio/<user>/<dream>-reply.mp3
