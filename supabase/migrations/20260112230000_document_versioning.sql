-- Add document versioning support

-- Create document_versions table to track historical versions of documents
CREATE TABLE public.document_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.investor_documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  -- Ensure unique version numbers per document
  UNIQUE(document_id, version_number)
);

-- Add current version number to investor_documents
ALTER TABLE public.investor_documents
ADD COLUMN IF NOT EXISTS current_version INTEGER NOT NULL DEFAULT 1;

-- Add file_size to investor_documents
ALTER TABLE public.investor_documents
ADD COLUMN IF NOT EXISTS file_size BIGINT;

-- Enable Row Level Security
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- Policies for document_versions

-- Admins can view all versions
CREATE POLICY "Admins can view all document versions"
ON public.document_versions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Users with document access can view versions
CREATE POLICY "Users with access can view document versions"
ON public.document_versions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_document_access
    WHERE user_id = auth.uid()
    AND document_id = document_versions.document_id
  )
);

-- Only admins can insert versions
CREATE POLICY "Admins can insert document versions"
ON public.document_versions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Only admins can delete versions
CREATE POLICY "Admins can delete document versions"
ON public.document_versions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Create index for faster version lookups
CREATE INDEX idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX idx_document_versions_created_at ON public.document_versions(created_at DESC);

-- Function to automatically create initial version when document is created
CREATE OR REPLACE FUNCTION public.create_initial_document_version()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.document_versions (
    document_id,
    version_number,
    file_url,
    file_size,
    uploaded_by
  ) VALUES (
    NEW.id,
    1,
    NEW.file_url,
    NEW.file_size,
    auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create initial version on document insert
CREATE TRIGGER on_document_created
  AFTER INSERT ON public.investor_documents
  FOR EACH ROW EXECUTE FUNCTION public.create_initial_document_version();

-- Comment for documentation
COMMENT ON TABLE public.document_versions IS 'Stores historical versions of investor documents for audit trail and version control';
COMMENT ON COLUMN public.document_versions.version_number IS 'Sequential version number, starting from 1';
COMMENT ON COLUMN public.document_versions.change_notes IS 'Optional notes describing what changed in this version';
