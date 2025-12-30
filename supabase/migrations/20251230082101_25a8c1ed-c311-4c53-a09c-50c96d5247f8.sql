-- Create junction table for per-user document access
CREATE TABLE public.user_document_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_id UUID NOT NULL REFERENCES public.investor_documents(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, document_id)
);

-- Enable RLS
ALTER TABLE public.user_document_access ENABLE ROW LEVEL SECURITY;

-- Admins can manage document access assignments
CREATE POLICY "Admins can manage document access"
ON public.user_document_access
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own document access records
CREATE POLICY "Users can view their own document access"
ON public.user_document_access
FOR SELECT
USING (auth.uid() = user_id);

-- Update investor_documents RLS: Users can only view documents assigned to them
DROP POLICY IF EXISTS "Users with signed NDA can view documents" ON public.investor_documents;

CREATE POLICY "Users can view documents assigned to them"
ON public.investor_documents
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND nda_signed = true
    )
    AND EXISTS (
      SELECT 1 FROM public.user_document_access 
      WHERE user_id = auth.uid() AND document_id = investor_documents.id
    )
  )
);