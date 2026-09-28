-- Dreamify: Kindred dreamers. People who dreamt something alike within 10 days of each
-- other are connected, without ever seeing each other's dream.
--
-- Each ready dream gets a share row: an anonymous one-line overview written by Gemini (never
-- the transcript, title or artwork), its symbol keys and emotions, and an embedding of that
-- overview. Clients cannot read this table; they only get other dreamers' overviews through
-- the functions below, which also check the opt-out (user_metadata.share_dreams = false).

create extension if not exists vector with schema extensions;

create table public.dream_shares (
  dream_id uuid primary key references public.dreams (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  dreamt_at timestamptz not null,
  gist text not null,                    -- anonymous overview, e.g. "Warm rain on an empty street…"
  symbols text[] not null default '{}',  -- symbol keys
  emotions text[] not null default '{}', -- lower-case emotion words
  color text,
  embedding extensions.vector(768)       -- gemini-embedding-001 of gist + symbols + emotions
);

create index dream_shares_time_idx on public.dream_shares (dreamt_at);
create index dream_shares_user_idx on public.dream_shares (user_id, dreamt_at desc);

-- RLS on and no policies: no client can select, insert or update rows directly.
-- Edge Functions write with the service role; reads go through the functions below.
alter table public.dream_shares enable row level security;

-- Sharing is on unless the person turned it off in Settings.
create or replace function public.kindred_on(p_user uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(
    (select (u.raw_user_meta_data ->> 'share_dreams')::boolean from auth.users u where u.id = p_user),
    true)
$$;

-- The public face of a dreamer: first name and photo only (never the email).
create or replace function public.kindred_name(p_user uuid)
returns table (name text, avatar_url text)
language sql stable security definer set search_path = ''
as $$
  select
    coalesce(
      nullif(split_part(trim(coalesce(
        nullif(u.raw_user_meta_data ->> 'display_name', ''),
        nullif(u.raw_user_meta_data ->> 'full_name', ''),
        nullif(u.raw_user_meta_data ->> 'name', ''),
        '')), ' ', 1), ''),
      'A dreamer'),
    coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
  from auth.users u where u.id = p_user
$$;

-- Kindred dreamers for one of the caller's dreams: other people's dreams within 10 days,
-- scored by vibe (embedding), shared symbols and shared feelings. One row per person
-- (their closest dream), best first. Returns nothing if the caller doesn't own the dream
-- or has sharing turned off.
--
-- Scoring (0–1), calibrated on gemini-embedding-001 (unrelated dreams ≈ 0.70 cosine,
-- alike ones ≈ 0.80+):
--   vibe     = clamp((cosine − 0.70) / 0.18)            weight 0.55
--   symbols  = shared / smaller symbol set               weight 0.35
--   feelings = shared / smaller emotion set              weight 0.10
-- Without embeddings the symbol and feeling parts carry the whole score.
-- match (%) = 40 + 60 × score, shown only when score ≥ 0.2 (a match of 52% or more).
create or replace function public.kindred_for_dream(p_dream uuid, p_limit int default 12)
returns table (
  person text,
  name text,
  avatar_url text,
  gist text,
  symbols text[],
  shared_symbols text[],
  shared_emotions text[],
  color text,
  days_apart numeric,
  match int
)
language sql stable security definer set search_path = ''
as $$
  with me as (
    select s.*
    from public.dream_shares s
    where s.dream_id = p_dream
      and s.user_id = (select auth.uid())
      and public.kindred_on(s.user_id)
  ),
  candidates as (
    select
      o.user_id,
      o.gist,
      o.symbols,
      o.color,
      array(select unnest(m.symbols) intersect select unnest(o.symbols)) as ss,
      array(select unnest(m.emotions) intersect select unnest(o.emotions)) as se,
      greatest(1, least(cardinality(m.symbols), cardinality(o.symbols))) as sym_n,
      greatest(1, least(cardinality(m.emotions), cardinality(o.emotions))) as emo_n,
      case when m.embedding is not null and o.embedding is not null
        then 1 - (m.embedding operator(extensions.<=>) o.embedding) end as cos,
      extract(epoch from (o.dreamt_at - m.dreamt_at)) / 86400 as days_apart
    from me m
    join public.dream_shares o
      on o.user_id <> m.user_id
     and o.dreamt_at between m.dreamt_at - interval '10 days' and m.dreamt_at + interval '10 days'
    where public.kindred_on(o.user_id)
  ),
  scored as (
    select c.*,
      case when c.cos is null
        then 0.75 * cardinality(c.ss)::numeric / c.sym_n + 0.25 * cardinality(c.se)::numeric / c.emo_n
        else 0.55 * least(1, greatest(0, (c.cos - 0.70) / 0.18))
           + 0.35 * cardinality(c.ss)::numeric / c.sym_n
           + 0.10 * cardinality(c.se)::numeric / c.emo_n
      end as score
    from candidates c
  ),
  best as (
    select distinct on (s.user_id) s.*
    from scored s
    where s.score >= 0.2
    order by s.user_id, s.score desc
  )
  select
    md5(b.user_id::text),
    n.name,
    n.avatar_url,
    b.gist,
    b.symbols,
    b.ss,
    b.se,
    b.color,
    round(b.days_apart::numeric, 1),
    least(99, round(40 + 60 * b.score))::int
  from best b
  cross join lateral public.kindred_name(b.user_id) n
  order by b.score desc
  limit least(greatest(p_limit, 1), 30)
$$;

-- The caller's whole circle: kindred dreamers for each of their dreams from the last
-- p_days days (one row per dream × person). The app groups these by person.
create or replace function public.kindred_web(p_days int default 60, p_per_dream int default 6)
returns table (
  dream_id uuid,
  dreamt_at timestamptz,
  person text,
  name text,
  avatar_url text,
  gist text,
  symbols text[],
  shared_symbols text[],
  shared_emotions text[],
  color text,
  days_apart numeric,
  match int
)
language sql stable security definer set search_path = ''
as $$
  select s.dream_id, s.dreamt_at, k.*
  from public.dream_shares s
  cross join lateral public.kindred_for_dream(s.dream_id, p_per_dream) k
  where s.user_id = (select auth.uid())
    and s.dreamt_at > now() - make_interval(days => least(greatest(p_days, 1), 365))
  order by s.dreamt_at desc, k.match desc
$$;

-- How common each of a dream's symbols was among all sharing dreamers in the 10 days
-- around it ("12% of dreamers dreamt of rain"). Counts people, not dreams, and includes
-- the caller.
create or replace function public.dream_pulse(p_dream uuid)
returns table (key text, dreamers int, total int)
language sql stable security definer set search_path = ''
as $$
  with me as (
    select s.*
    from public.dream_shares s
    where s.dream_id = p_dream and s.user_id = (select auth.uid())
  ),
  around as (
    select o.user_id, o.symbols
    from me m
    join public.dream_shares o
      on o.dreamt_at between m.dreamt_at - interval '10 days' and m.dreamt_at + interval '10 days'
    where o.user_id = m.user_id or public.kindred_on(o.user_id)
  ),
  total as (select count(distinct a.user_id)::int as n from around a)
  select k.key,
    (select count(distinct a.user_id)::int from around a where k.key = any (a.symbols)),
    (select t.n from total t)
  from me m
  cross join lateral unnest(m.symbols) as k(key)
$$;

-- Only signed-in users may call these; the helpers stay internal.
revoke all on function public.kindred_on(uuid) from public, anon, authenticated;
revoke all on function public.kindred_name(uuid) from public, anon, authenticated;
revoke all on function public.kindred_for_dream(uuid, int) from public, anon;
revoke all on function public.kindred_web(int, int) from public, anon;
revoke all on function public.dream_pulse(uuid) from public, anon;
grant execute on function public.kindred_for_dream(uuid, int) to authenticated;
grant execute on function public.kindred_web(int, int) to authenticated;
grant execute on function public.dream_pulse(uuid) to authenticated;
