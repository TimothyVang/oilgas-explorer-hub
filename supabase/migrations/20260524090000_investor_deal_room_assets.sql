-- Investor deal room asset metadata and private delivery hardening

-- Extend investor documents into typed deal-room assets while preserving legacy rows.
ALTER TABLE public.investor_documents
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS thumbnail_path text,
  ADD COLUMN IF NOT EXISTS original_filename text,
  ADD COLUMN IF NOT EXISTS mime_type text,
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'overview',
  ADD COLUMN IF NOT EXISTS asset_type text NOT NULL DEFAULT 'document',
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_public_teaser boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Backfill private storage paths from legacy Supabase object URLs where possible.
UPDATE public.investor_documents
SET storage_path = split_part(file_url, '/investor-documents/', 2)
WHERE storage_path IS NULL
  AND file_url IS NOT NULL
  AND file_url LIKE '%/investor-documents/%';

-- Direct URLs are deprecated. New code stores storage_path and requests signed URLs.
ALTER TABLE public.investor_documents
  ALTER COLUMN file_url DROP NOT NULL;

ALTER TABLE public.investor_documents
  DROP CONSTRAINT IF EXISTS investor_documents_category_check,
  ADD CONSTRAINT investor_documents_category_check
    CHECK (category IN ('overview', 'pitch', 'financials', 'mapping', 'operations', 'field_videos', 'management'));

ALTER TABLE public.investor_documents
  DROP CONSTRAINT IF EXISTS investor_documents_asset_type_check,
  ADD CONSTRAINT investor_documents_asset_type_check
    CHECK (asset_type IN ('document', 'video', 'image'));

CREATE INDEX IF NOT EXISTS idx_investor_documents_category_sort
  ON public.investor_documents(category, sort_order, created_at DESC);

-- Keep document versioning compatible with private storage paths.
ALTER TABLE public.document_versions
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS thumbnail_path text,
  ADD COLUMN IF NOT EXISTS original_filename text,
  ADD COLUMN IF NOT EXISTS mime_type text;

UPDATE public.document_versions
SET storage_path = split_part(file_url, '/investor-documents/', 2)
WHERE storage_path IS NULL
  AND file_url IS NOT NULL
  AND file_url LIKE '%/investor-documents/%';

ALTER TABLE public.document_versions
  ALTER COLUMN file_url DROP NOT NULL;

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
    COALESCE(NEW.uploaded_by, auth.uid())
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Server-side audit table for signed URL attempts. Edge Functions use service role for INSERT.
CREATE TABLE IF NOT EXISTS public.document_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  document_id uuid REFERENCES public.investor_documents(id) ON DELETE SET NULL,
  document_version_id uuid REFERENCES public.document_versions(id) ON DELETE SET NULL,
  action text NOT NULL DEFAULT 'signed_url_requested',
  granted boolean NOT NULL DEFAULT false,
  denial_reason text,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.document_access_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view document access logs" ON public.document_access_logs;
CREATE POLICY "Admins can view document access logs"
ON public.document_access_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view own document access logs" ON public.document_access_logs;
CREATE POLICY "Users can view own document access logs"
ON public.document_access_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_document_access_logs_user_created
  ON public.document_access_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_document_access_logs_document_created
  ON public.document_access_logs(document_id, created_at DESC);

-- Remove broad investor object reads. Assets must be delivered by service-role signed URLs.
DROP POLICY IF EXISTS "Users with signed NDA can read investor document files" ON storage.objects;

DROP POLICY IF EXISTS "Admins can manage investor document files" ON storage.objects;
CREATE POLICY "Admins can manage investor document files"
ON storage.objects FOR ALL
USING (bucket_id = 'investor-documents' AND public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'investor-documents' AND public.has_role(auth.uid(), 'admin'::app_role));
