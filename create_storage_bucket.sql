-- Create 'images' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Set up security policies for the 'images' bucket

-- 1. Allow public read access to all files in 'images' bucket
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
    on storage.objects for select
    using ( bucket_id = 'images' );

-- 2. Allow authenticated users to upload files
drop policy if exists "Authenticated Upload" on storage.objects;
create policy "Authenticated Upload"
    on storage.objects for insert
    with check ( bucket_id = 'images' and auth.role() = 'authenticated' );

-- 3. Allow authenticated users to update/delete their files (or all files if admin)
drop policy if exists "Authenticated Update/Delete" on storage.objects;
create policy "Authenticated Update/Delete"
    on storage.objects for all
    using ( bucket_id = 'images' and auth.role() = 'authenticated' );
