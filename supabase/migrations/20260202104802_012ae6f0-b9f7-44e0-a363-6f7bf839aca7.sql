-- Fix security warning: Set search_path for prevent_api_key_delete function
CREATE OR REPLACE FUNCTION public.prevent_api_key_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'API key records cannot be deleted. Use revoked_at to revoke.';
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;