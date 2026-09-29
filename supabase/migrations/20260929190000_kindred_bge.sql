-- Dreamify: Kindred dreamers now embed with Cloudflare Workers AI (@cf/baai/bge-base-en-v1.5,
-- 768 dims, CLS pooling) instead of Gemini (gemini-embedding-001). Same size, different space:
--
-- 1. The Gemini vectors can't be compared with bge ones, so they are cleared. The `kindred`
--    Edge Function re-embeds shares with no embedding (anyone's, newest first, 24 per call);
--    until then those pairs are matched by symbols and feelings only.
-- 2. The "vibe" part of the score is recalibrated for bge. Measured on sample overviews
--    (the same "gist Symbols: … Felt: …" text the functions embed):
--      unrelated dreams  cosine mean 0.61 (max 0.73)   [gemini ≈ 0.70]
--      alike dreams      cosine mean 0.78 (min 0.72)   [gemini ≈ 0.80]
--      same feel, different images  0.73               [gemini 0.79]
--    vibe = clamp((cosine − 0.66) / 0.20), was (cosine − 0.70) / 0.18.
--    Everything else in the score is unchanged.

update public.dream_shares set embedding = null;

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
        else 0.55 * least(1, greatest(0, (c.cos - 0.66) / 0.20))
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
