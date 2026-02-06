-- Opdracht 3a: origin_id koppeling pages → origin_attestations

-- Stap 1: Voeg origin_id kolom toe aan pages
ALTER TABLE public.pages 
ADD COLUMN origin_id UUID;

-- Stap 2: Pas de bridge trigger aan om origin_id terug te schrijven
CREATE OR REPLACE FUNCTION public.bridge_page_to_core_attestation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_origin_id UUID;
BEGIN
  -- Only trigger if origin_hash_sha256 is set
  IF NEW.origin_hash_sha256 IS NOT NULL AND NEW.origin_hash_sha256 <> '' THEN
    -- Insert into origin_attestations (Core layer) and capture the generated origin_id
    INSERT INTO origin_attestations (hash, hash_algo, captured_at)
    VALUES (
      NEW.origin_hash_sha256,
      COALESCE(NEW.origin_hash_algo, 'sha256'),
      NEW.created_at
    )
    RETURNING origin_id INTO v_origin_id;
    
    -- Write back the origin_id to the pages record
    NEW.origin_id := v_origin_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Stap 3: Backfill bestaande pages records
-- Join op hash, bij duplicates: earliest captured_at
WITH earliest_attestations AS (
  SELECT DISTINCT ON (hash) 
    hash, 
    origin_id
  FROM origin_attestations
  ORDER BY hash, captured_at ASC
)
UPDATE pages p
SET origin_id = ea.origin_id
FROM earliest_attestations ea
WHERE p.origin_hash_sha256 = ea.hash
  AND p.origin_id IS NULL;