ALTER TABLE public.investor_documents
  ADD COLUMN IF NOT EXISTS download_storage_path text,
  ADD COLUMN IF NOT EXISTS download_filename text,
  ADD COLUMN IF NOT EXISTS download_mime_type text,
  ADD COLUMN IF NOT EXISTS download_file_size bigint;

ALTER TABLE public.document_versions
  ADD COLUMN IF NOT EXISTS download_storage_path text,
  ADD COLUMN IF NOT EXISTS download_filename text,
  ADD COLUMN IF NOT EXISTS download_mime_type text,
  ADD COLUMN IF NOT EXISTS download_file_size bigint;

COMMENT ON COLUMN public.investor_documents.download_storage_path IS 'Optional private storage object used for original-file downloads when storage_path points at a browser-safe preview.';
COMMENT ON COLUMN public.document_versions.download_storage_path IS 'Optional private storage object used for original-file downloads when storage_path points at a browser-safe preview.';

CREATE OR REPLACE FUNCTION public.create_initial_document_version()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.document_versions (
    document_id,
    version_number,
    file_url,
    storage_path,
    thumbnail_path,
    file_size,
    original_filename,
    mime_type,
    download_storage_path,
    download_filename,
    download_mime_type,
    download_file_size,
    uploaded_by
  ) VALUES (
    NEW.id,
    1,
    NEW.file_url,
    NEW.storage_path,
    NEW.thumbnail_path,
    NEW.file_size,
    NEW.original_filename,
    NEW.mime_type,
    NEW.download_storage_path,
    NEW.download_filename,
    NEW.download_mime_type,
    NEW.download_file_size,
    COALESCE(NEW.uploaded_by, auth.uid())
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
