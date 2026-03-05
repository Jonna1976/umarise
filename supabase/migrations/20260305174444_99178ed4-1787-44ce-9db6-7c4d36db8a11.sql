-- Step 1: Add device_signed column to pages table (mirrors the flag for bridge trigger)
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS device_signed boolean NOT NULL DEFAULT false;

-- Step 2: Update bridge trigger to pass device_signed through to origin_attestations
CREATE OR REPLACE FUNCTION public.bridge_page_to_core_attestation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_origin_id UUID;
BEGIN
  -- Only trigger if origin_hash_sha256 is set
  IF NEW.origin_hash_sha256 IS NOT NULL AND NEW.origin_hash_sha256 <> '' THEN
    -- Insert into origin_attestations. ON CONFLICT DO NOTHING = first-in-time wins.
    INSERT INTO origin_attestations (hash, hash_algo, captured_at, device_signed)
    VALUES (
      NEW.origin_hash_sha256,
      COALESCE(NEW.origin_hash_algo, 'sha256'),
      NEW.created_at,
      COALESCE(NEW.device_signed, false)
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