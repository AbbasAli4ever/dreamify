-- The spoken reply is now voiced on demand by the `speak` Edge Function, so its audio
-- is no longer stored. reply_text stays (null = pending, '' = no reply).
alter table public.dreams drop column reply_audio_path;
