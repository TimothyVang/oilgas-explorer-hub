-- Add NDA fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS nda_signed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS nda_signed_at timestamp with time zone;

-- Create investor_documents table for NDA-gated documents
CREATE TABLE IF NOT EXISTS public.investor_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on investor_documents
ALTER TABLE public.investor_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Only users with nda_signed = true can view documents
CREATE POLICY "Users with signed NDA can view documents"
ON public.investor_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.nda_signed = true
  )
);

-- Policy: Admins can manage all documents
CREATE POLICY "Admins can manage investor documents"
ON public.investor_documents
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create activity_logs table for user activity tracking
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  action text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own activity logs
CREATE POLICY "Users can view their own activity logs"
ON public.activity_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own activity logs
CREATE POLICY "Users can insert their own activity logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs"
ON public.activity_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger to update updated_at on investor_documents
CREATE TRIGGER update_investor_documents_updated_at
BEFORE UPDATE ON public.investor_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();