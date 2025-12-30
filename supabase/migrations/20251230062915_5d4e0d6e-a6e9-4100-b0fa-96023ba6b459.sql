-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN email text;

-- Update existing profiles with emails from auth.users (requires security definer function)
CREATE OR REPLACE FUNCTION public.sync_user_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.user_id = u.id AND p.email IS NULL;
END;
$$;

-- Run the sync function
SELECT public.sync_user_emails();

-- Update the handle_new_user trigger to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  RETURN new;
END;
$$;