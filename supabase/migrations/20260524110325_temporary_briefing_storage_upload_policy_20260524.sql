create policy "Temporary briefing upload 20260524"
on storage.objects
for insert
to anon
with check (
  bucket_id = 'investor-documents'
  and name like 'briefing-20260524/%'
);
