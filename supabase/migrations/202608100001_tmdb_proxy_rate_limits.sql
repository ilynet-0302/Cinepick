-- Durable, server-only rate limiting for the public TMDB Edge Function proxy.

create table if not exists public.tmdb_proxy_rate_limits (
  client_hash text not null,
  window_seconds integer not null check (window_seconds in (60, 86400)),
  window_start timestamptz not null,
  request_count integer not null default 1 check (request_count > 0),
  primary key (client_hash, window_seconds, window_start)
);

create index if not exists tmdb_proxy_rate_limits_window_idx
  on public.tmdb_proxy_rate_limits (window_start);

alter table public.tmdb_proxy_rate_limits enable row level security;
revoke all on public.tmdb_proxy_rate_limits from public, anon, authenticated;

create or replace function public.consume_tmdb_rate_limit(
  p_client_hash text,
  p_minute_limit integer,
  p_daily_limit integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window_start timestamptz;
  v_count integer;
begin
  if length(p_client_hash) <> 64
    or p_minute_limit not between 1 and 10000
    or p_daily_limit not between 1 and 1000000 then
    return false;
  end if;

  v_window_start := to_timestamp(floor(extract(epoch from clock_timestamp()) / 60) * 60);
  insert into public.tmdb_proxy_rate_limits (client_hash, window_seconds, window_start, request_count)
  values (p_client_hash, 60, v_window_start, 1)
  on conflict (client_hash, window_seconds, window_start) do update
    set request_count = public.tmdb_proxy_rate_limits.request_count + 1
    where public.tmdb_proxy_rate_limits.request_count < p_minute_limit
  returning request_count into v_count;

  if v_count is null then return false; end if;

  v_count := null;
  v_window_start := to_timestamp(floor(extract(epoch from clock_timestamp()) / 86400) * 86400);
  insert into public.tmdb_proxy_rate_limits (client_hash, window_seconds, window_start, request_count)
  values (p_client_hash, 86400, v_window_start, 1)
  on conflict (client_hash, window_seconds, window_start) do update
    set request_count = public.tmdb_proxy_rate_limits.request_count + 1
    where public.tmdb_proxy_rate_limits.request_count < p_daily_limit
  returning request_count into v_count;

  if random() < 0.01 then
    delete from public.tmdb_proxy_rate_limits
    where window_start < clock_timestamp() - interval '2 days';
  end if;

  return v_count is not null;
end;
$$;

revoke all on function public.consume_tmdb_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_tmdb_rate_limit(text, integer, integer) to service_role;
