-- Add Origin Hash column for forensic verification
-- SHA-256 hex string (64 characters), immutable after insert

ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS origin_hash_sha256 VARCHAR(64) DEFAULT NULL;

-- Add algorithm field for future-proofing
ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS origin_hash_algo VARCHAR(16) DEFAULT 'sha256';

-- Index for potential hash-based lookups
CREATE INDEX IF NOT EXISTS idx_pages_origin_hash ON public.pages(origin_hash_sha256) 
WHERE origin_hash_sha256 IS NOT NULL;

-- IMMUTABILITY: Trigger to prevent updates to origin hash once set
CREATE OR REPLACE FUNCTION public.prevent_origin_hash_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If origin_hash_sha256 was already set and is being changed, reject
  IF OLD.origin_hash_sha256 IS NOT NULL 
     AND NEW.origin_hash_sha256 IS DISTINCT FROM OLD.origin_hash_sha256 THEN
    RAISE EXCEPTION 'origin_hash_sha256 is immutable once set';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach trigger
DROP TRIGGER IF EXISTS enforce_origin_hash_immutability ON public.pages;
CREATE TRIGGER enforce_origin_hash_immutability
  BEFORE UPDATE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_origin_hash_update();

COMMENT ON COLUMN public.pages.origin_hash_sha256 IS 'SHA-256 fingerprint of original artifact bytes. Immutable after insert.';
COMMENT ON COLUMN public.pages.origin_hash_algo IS 'Hash algorithm used (sha256). For future-proofing.';