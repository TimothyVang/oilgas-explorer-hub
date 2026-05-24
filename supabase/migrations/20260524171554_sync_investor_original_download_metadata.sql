UPDATE public.investor_documents
SET download_storage_path = 'briefing-20260524/originals/afe-investor-print-2026-04-24.xlsx',
    download_filename = original_filename,
    download_mime_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    download_file_size = 34100
WHERE title = 'AFE Budget Preview'
  AND original_filename ILIKE '%.xlsx';

UPDATE public.investor_documents
SET download_storage_path = 'briefing-20260524/originals/pro-forma-investor-locked-cells.xlsx',
    download_filename = original_filename,
    download_mime_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    download_file_size = 195315
WHERE title = 'Pro Forma Model Preview'
  AND original_filename ILIKE '%.xlsx';

UPDATE public.document_versions dv
SET download_storage_path = d.download_storage_path,
    download_filename = d.download_filename,
    download_mime_type = d.download_mime_type,
    download_file_size = d.download_file_size
FROM public.investor_documents d
WHERE dv.document_id = d.id
  AND d.download_storage_path IS NOT NULL;

DELETE FROM public.investor_documents
WHERE title = 'Operations Reference Image'
  AND category = 'operations'
  AND asset_type = 'image'
  AND storage_path = 'briefing-20260524/images/operations-reference-image.jpg';
