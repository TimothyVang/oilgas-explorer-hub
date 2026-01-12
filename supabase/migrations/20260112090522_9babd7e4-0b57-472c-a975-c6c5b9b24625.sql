-- Drop overly permissive policy that allows any authenticated user to view all profiles
DROP POLICY IF EXISTS "Require authentication for profiles" ON public.profiles;

-- Add DELETE policy for profiles (defense-in-depth)
CREATE POLICY "Only admins can delete profiles"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Make avatars bucket private and update policy
UPDATE storage.buckets SET public = false WHERE id = 'avatars';

DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

CREATE POLICY "Authenticated users can view avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');