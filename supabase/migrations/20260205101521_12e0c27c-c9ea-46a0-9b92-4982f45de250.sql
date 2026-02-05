-- Fix: Remove misleading ON CONFLICT clause
-- There's no unique constraint on hash, so ON CONFLICT never triggers
-- Multiple attestations of the same hash ARE allowed (TSA-style temporal proof)

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
    -- Note: Same hash CAN be attested multiple times (different origin_id each time)
    -- This is intentional: supports TSA-style "multiple timestamps for same content"
    INSERT INTO origin_attestations (hash, hash_algo, captured_at)
    VALUES (
      NEW.origin_hash_sha256,
      COALESCE(NEW.origin_hash_algo, 'sha256'),
      NEW.created_at
    );
  END IF;
  
  RETURN NEW;
END;
$$;