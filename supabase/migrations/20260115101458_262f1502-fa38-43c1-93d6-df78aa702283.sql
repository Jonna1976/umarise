-- Drop the too-aggressive trigger
DROP TRIGGER IF EXISTS enforce_origin_hash_immutability ON public.page_origin_hashes;
DROP FUNCTION IF EXISTS public.prevent_origin_hash_sidecar_update();

-- Create correct trigger that only blocks hash field changes
CREATE OR REPLACE FUNCTION public.prevent_origin_hash_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.origin_hash_sha256 <> OLD.origin_hash_sha256
     OR NEW.origin_hash_algo <> OLD.origin_hash_algo THEN
    RAISE EXCEPTION 'origin hash is immutable once set';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_origin_hash_immutability
BEFORE UPDATE ON public.page_origin_hashes
FOR EACH ROW EXECUTE FUNCTION public.prevent_origin_hash_change();