
-- Fix bridge trigger: use ON CONFLICT DO NOTHING so duplicate hashes
-- don't block the pages INSERT. The first attestation wins (first-in-time policy).
CREATE OR REPLACE FUNCTION public.bridge_page_to_core_attestation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_origin_id UUID;
BEGIN
  -- Only trigger if origin_hash_sha256 is set
  IF NEW.origin_hash_sha256 IS NOT NULL AND NEW.origin_hash_sha256 <> '' THEN
    -- Insert into origin_attestations. ON CONFLICT DO NOTHING = first-in-time wins.
    -- If this hash was already attested, we reuse the existing origin_id.
    INSERT INTO origin_attestations (hash, hash_algo, captured_at)
    VALUES (
      NEW.origin_hash_sha256,
      COALESCE(NEW.origin_hash_algo, 'sha256'),
      NEW.created_at
    )
    ON CONFLICT DO NOTHING
    RETURNING origin_id INTO v_origin_id;

    -- If we got a new origin_id, write it back
    -- If it was a duplicate (NOTHING inserted), look up the existing origin_id
    IF v_origin_id IS NULL THEN
      SELECT origin_id INTO v_origin_id
      FROM origin_attestations
      WHERE hash = NEW.origin_hash_sha256
      ORDER BY captured_at ASC
      LIMIT 1;
    END IF;

    NEW.origin_id := v_origin_id;
  END IF;

  RETURN NEW;
END;
$$;
