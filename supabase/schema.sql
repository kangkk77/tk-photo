create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  description text,
  cover_image text,
  theme text check (
    theme is null
    or theme in ('seascape', 'sunset', 'city', 'portrait', 'travel', 'daily', 'other')
  ),
  date text,
  location text,
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  title text,
  description text,
  note text,
  image_path text not null,
  date text,
  location text,
  camera text,
  lens text,
  aperture text,
  shutter_speed text,
  iso integer,
  focal_length text,
  orientation text check (
    orientation is null
    or orientation in ('landscape', 'portrait', 'square')
  ),
  layout text check (
    layout is null
    or layout in ('full', 'half', 'large')
  ),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists albums_created_by_idx on public.albums (created_by);
create index if not exists albums_visibility_idx on public.albums (visibility);
create index if not exists photos_album_id_idx on public.photos (album_id);
create index if not exists photos_created_by_idx on public.photos (created_by);

drop trigger if exists set_albums_updated_at on public.albums;
create trigger set_albums_updated_at
before update on public.albums
for each row
execute function public.set_updated_at();

drop trigger if exists set_photos_updated_at on public.photos;
create trigger set_photos_updated_at
before update on public.photos
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.albums enable row level security;
alter table public.photos enable row level security;

grant usage on schema public to anon, authenticated;

grant select on public.profiles to authenticated;
grant insert on public.profiles to authenticated;
grant update on public.profiles to authenticated;

grant select on public.albums to anon, authenticated;
grant insert on public.albums to authenticated;
grant update on public.albums to authenticated;
grant delete on public.albums to authenticated;

grant select on public.photos to anon, authenticated;
grant insert on public.photos to authenticated;
grant update on public.photos to authenticated;
grant delete on public.photos to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "albums_select_public_or_own" on public.albums;
create policy "albums_select_public_or_own"
on public.albums
for select
using (visibility = 'public' or created_by = auth.uid());

drop policy if exists "albums_insert_own" on public.albums;
create policy "albums_insert_own"
on public.albums
for insert
to authenticated
with check (created_by = auth.uid());

drop policy if exists "albums_update_own" on public.albums;
create policy "albums_update_own"
on public.albums
for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

drop policy if exists "albums_delete_own" on public.albums;
create policy "albums_delete_own"
on public.albums
for delete
to authenticated
using (created_by = auth.uid());

drop policy if exists "photos_select_public_or_own" on public.photos;
create policy "photos_select_public_or_own"
on public.photos
for select
using (
  exists (
    select 1
    from public.albums
    where public.albums.id = public.photos.album_id
      and (
        public.albums.visibility = 'public'
        or public.albums.created_by = auth.uid()
      )
  )
);

drop policy if exists "photos_insert_own_album" on public.photos;
create policy "photos_insert_own_album"
on public.photos
for insert
to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1
    from public.albums
    where public.albums.id = public.photos.album_id
      and public.albums.created_by = auth.uid()
  )
);

drop policy if exists "photos_update_own_album" on public.photos;
create policy "photos_update_own_album"
on public.photos
for update
to authenticated
using (
  created_by = auth.uid()
  and exists (
    select 1
    from public.albums
    where public.albums.id = public.photos.album_id
      and public.albums.created_by = auth.uid()
  )
)
with check (
  created_by = auth.uid()
  and exists (
    select 1
    from public.albums
    where public.albums.id = public.photos.album_id
      and public.albums.created_by = auth.uid()
  )
);

drop policy if exists "photos_delete_own_album" on public.photos;
create policy "photos_delete_own_album"
on public.photos
for delete
to authenticated
using (
  created_by = auth.uid()
  and exists (
    select 1
    from public.albums
    where public.albums.id = public.photos.album_id
      and public.albums.created_by = auth.uid()
  )
);
