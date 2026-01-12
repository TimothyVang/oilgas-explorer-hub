-- Add a permissive policy requiring authentication for SELECT on profiles
-- This ensures anonymous (unauthenticated) users cannot query the profiles table

CREATE POLICY "Require authentication for profiles"
ON public.profiles
FOR SELECT
TO public
USING (auth.uid() IS NOT NULL);