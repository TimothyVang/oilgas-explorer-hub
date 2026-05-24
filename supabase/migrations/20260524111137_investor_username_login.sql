ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL;

CREATE OR REPLACE FUNCTION public.resolve_login_identifier(_identifier text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN position('@' in trim(_identifier)) > 0 THEN lower(trim(_identifier))
    ELSE (
      SELECT p.email
      FROM public.profiles p
      WHERE lower(p.username) = lower(trim(_identifier))
      LIMIT 1
    )
  END;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_login_identifier(text) TO anon, authenticated;
