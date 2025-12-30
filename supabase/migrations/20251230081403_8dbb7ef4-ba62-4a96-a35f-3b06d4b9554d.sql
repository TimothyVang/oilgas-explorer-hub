-- Create storage bucket for investor documents (private bucket)
INSERT INTO storage.buckets (id, name, public)
VALUES ('investor-documents', 'investor-documents', false);

-- RLS: Admins can manage (upload/update/delete) investor document files
CREATE POLICY "Admins can manage investor document files"
ON storage.objects FOR ALL
USING (bucket_id = 'investor-documents' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'investor-documents' AND has_role(auth.uid(), 'admin'::app_role));

-- RLS: Authenticated users with signed NDA can read/download files
CREATE POLICY "Users with signed NDA can read investor document files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'investor-documents' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND nda_signed = true
  )
);