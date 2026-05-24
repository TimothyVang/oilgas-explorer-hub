create policy "Temporary missing video upload 20260524"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'investor-documents'
  and auth.uid() = 'b6bfa4c5-46c6-468a-8259-7e283649da93'
  and (
    name like 'briefing-20260524/videos/%'
    or name like 'briefing-20260524/thumbnails/%'
  )
);

create policy "Temporary missing video update 20260524"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'investor-documents'
  and auth.uid() = 'b6bfa4c5-46c6-468a-8259-7e283649da93'
  and (
    name like 'briefing-20260524/videos/%'
    or name like 'briefing-20260524/thumbnails/%'
  )
)
with check (
  bucket_id = 'investor-documents'
  and auth.uid() = 'b6bfa4c5-46c6-468a-8259-7e283649da93'
  and (
    name like 'briefing-20260524/videos/%'
    or name like 'briefing-20260524/thumbnails/%'
  )
);

create policy "Temporary missing video select 20260524"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'investor-documents'
  and auth.uid() = 'b6bfa4c5-46c6-468a-8259-7e283649da93'
  and (
    name like 'briefing-20260524/videos/%'
    or name like 'briefing-20260524/thumbnails/%'
  )
);
