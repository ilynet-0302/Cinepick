-- Cinepick accounts, library state, ratings, and manual viewing progress.
-- Run this migration in the Supabase SQL Editor or with the Supabase CLI.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 60),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_media (
  user_id uuid not null references auth.users(id) on delete cascade,
  media_type text not null check (media_type in ('movie', 'tv')),
  tmdb_id bigint not null check (tmdb_id > 0),
  in_watchlist boolean not null default false,
  is_favorite boolean not null default false,
  is_watched boolean not null default false,
  rating smallint check (rating between 1 and 10),
  progress_percent smallint not null default 0 check (progress_percent between 0 and 100),
  watched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, media_type, tmdb_id)
);

create index if not exists user_media_user_updated_idx
  on public.user_media (user_id, updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists user_media_set_updated_at on public.user_media;
create trigger user_media_set_updated_at
before update on public.user_media
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_media enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Users can read their own media" on public.user_media;
create policy "Users can read their own media"
on public.user_media for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own media" on public.user_media;
create policy "Users can insert their own media"
on public.user_media for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own media" on public.user_media;
create policy "Users can update their own media"
on public.user_media for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own media" on public.user_media;
create policy "Users can delete their own media"
on public.user_media for delete to authenticated
using ((select auth.uid()) = user_id);

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.user_media to authenticated;
