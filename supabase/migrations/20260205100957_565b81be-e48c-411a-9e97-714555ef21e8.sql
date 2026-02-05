-- Bridge: Companion → Core attestation
-- When a page is created with an origin_hash_sha256, automatically create 
-- a corresponding entry in origin_attestations (Core layer)

CREATE OR REPLACE FUNCTION public.bridge_page_to_core_attestation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only trigger if origin_hash_sha256 is set
  IF NEW.origin_hash_sha256 IS NOT NULL AND NEW.origin_hash_sha256 <> '' THEN
    -- Insert into origin_attestations (Core layer)
    -- Uses the page's created_at as captured_at for temporal consistency
    INSERT INTO origin_attestations (hash, hash_algo, captured_at)
    VALUES (
      NEW.origin_hash_sha256,
      COALESCE(NEW.origin_hash_algo, 'sha256'),
      NEW.created_at
    )
    ON CONFLICT DO NOTHING; -- Same hash can be attested multiple times, this is intentional
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on pages table for INSERT
CREATE TRIGGER trigger_bridge_page_to_core
  AFTER INSERT ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION public.bridge_page_to_core_attestation();

-- Also handle UPDATE case where origin_hash is set later (e.g., migration)
CREATE TRIGGER trigger_bridge_page_to_core_update
  AFTER UPDATE OF origin_hash_sha256 ON public.pages
  FOR EACH ROW
  WHEN (OLD.origin_hash_sha256 IS NULL AND NEW.origin_hash_sha256 IS NOT NULL)
  EXECUTE FUNCTION public.bridge_page_to_core_attestation();