-- Dreamify: dreams table, row-level security, and private storage for audio + artwork.
-- Every user (anonymous sign-in included) can only see and change their own data.

create table public.dreams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),

  input_type text not null check (input_type in ('voice', 'text')),
  status text not null default 'processing' check (status in ('draft', 'processing', 'ready', 'failed')),
  -- Index of the pipeline stage in progress (0 story, 1 emotions, 2 symbols, 3 painting, 4 done).
  processing_stage smallint not null default 0,
  error text,

  -- Input
  transcript text not null default '',
  audio_path text,                      -- dream-audio/<user>/<dream>.m4a

  -- AI outputs (Gemini)
  title text,
  interpretation text,
  emotions jsonb not null default '[]', -- [{ "label": "Unease" }]
  symbols jsonb not null default '[]',  -- [{ "key": "water", "label": "Water" }]
  themes text[] not null default '{}',
  art_prompt text,
  artwork_path text,                    -- dream-art/<user>/<dream>.<ext>
  artwork_color text,

  -- Reflection
  question text,
  question_audio_path text,             -- Deepgram TTS of the question
  answer_text text,
  answer_audio_path text,
  answered_at timestamptz
);

create index dreams_user_created_idx on public.dreams (user_id, created_at desc);

alter table public.dreams enable row level security;

create policy "Users read their own dreams"
  on public.dreams for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users add their own dreams"
  on public.dreams for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update their own dreams"
  on public.dreams for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete their own dreams"
  on public.dreams for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Private buckets. Files live under a folder named after the user's id.
insert into storage.buckets (id, name, public, file_size_limit)
values
  ('dream-audio', 'dream-audio', false, 26214400),  -- 25 MB
  ('dream-art', 'dream-art', false, 10485760)       -- 10 MB
on conflict (id) do nothing;

create policy "Users read their own dream files"
  on storage.objects for select to authenticated
  using (
    bucket_id in ('dream-audio', 'dream-art')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users upload their own dream files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('dream-audio', 'dream-art')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users delete their own dream files"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('dream-audio', 'dream-art')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
