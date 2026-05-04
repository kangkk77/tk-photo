insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public;

grant usage on schema storage to anon, authenticated;
grant select on storage.objects to anon, authenticated;
grant insert on storage.objects to authenticated;
grant update on storage.objects to authenticated;
grant delete on storage.objects to authenticated;

drop policy if exists "photos_bucket_public_read" on storage.objects;
create policy "photos_bucket_public_read"
on storage.objects
for select
to public
using (bucket_id = 'photos');

drop policy if exists "photos_bucket_insert_own_prefix" on storage.objects;
create policy "photos_bucket_insert_own_prefix"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "photos_bucket_update_own_prefix" on storage.objects;
create policy "photos_bucket_update_own_prefix"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "photos_bucket_delete_own_prefix" on storage.objects;
create policy "photos_bucket_delete_own_prefix"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
