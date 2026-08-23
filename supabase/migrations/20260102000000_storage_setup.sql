-- ============================================================================
-- SPENDY - STORAGE BUCKET CONFIGURATION FOR RECEIPTS & ATTACHMENTS
-- ============================================================================

-- 1. Create Receipts bucket in Supabase Storage if it doesn't already exist
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts',
  'receipts',
  true,
  10485760, -- 10MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];

-- 2. Storage Policies for Authenticated Users
create policy "Allow authenticated users to upload receipts"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'receipts' and
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Allow users to view own receipts or public"
on storage.objects for select
to authenticated
using (
  bucket_id = 'receipts' and
  (auth.uid()::text = (storage.foldername(name))[1] or bucket_id = 'receipts')
);

create policy "Allow users to update own receipts"
on storage.objects for update
to authenticated
using (
  bucket_id = 'receipts' and
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Allow users to delete own receipts"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'receipts' and
  auth.uid()::text = (storage.foldername(name))[1]
);
