-- ============================================
-- UMARISE CORE: origin_attestations table
-- ============================================
-- This is the Core data layer. 
-- Stores ONLY: hash, timestamp, origin_id
-- NO bytes, NO artifacts, NO labels, NO semantics
-- ============================================

-- Create the Core attestation table
CREATE TABLE public.origin_attestations (
  origin_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hash VARCHAR(128) NOT NULL,
  hash_algo VARCHAR(16) NOT NULL DEFAULT 'sha256',
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- IMPORTANT: No unique constraint on hash
-- Multiple attestations of the same hash (different moments) are allowed
-- This matches TSA semantics: same content, different timestamps = different attestations

-- Create index for hash lookups (resolve by hash)
CREATE INDEX idx_origin_attestations_hash ON public.origin_attestations(hash);

-- Create index for timestamp queries
CREATE INDEX idx_origin_attestations_captured_at ON public.origin_attestations(captured_at);

-- Enable Row Level Security
ALTER TABLE public.origin_attestations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public read access (resolve/verify are public)
CREATE POLICY "Public read access for origin attestations"
ON public.origin_attestations
FOR SELECT
USING (true);

-- RLS Policy: Service role can insert (API key authenticated)
-- Note: Only service role can insert, enforced by API key check in edge function
CREATE POLICY "Service role can insert attestations"
ON public.origin_attestations
FOR INSERT
WITH CHECK (true);

-- NO UPDATE POLICY: Origin attestations are immutable
-- NO DELETE POLICY: Origin attestations are permanent

-- Immutability trigger: prevent any updates to existing records
CREATE OR REPLACE FUNCTION public.prevent_attestation_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'origin_attestations are immutable: updates not allowed';
END;
$$;

CREATE TRIGGER prevent_origin_attestation_update
BEFORE UPDATE ON public.origin_attestations
FOR EACH ROW
EXECUTE FUNCTION public.prevent_attestation_update();

-- Immutability trigger: prevent deletes
CREATE OR REPLACE FUNCTION public.prevent_attestation_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'origin_attestations are immutable: deletes not allowed';
END;
$$;

CREATE TRIGGER prevent_origin_attestation_delete
BEFORE DELETE ON public.origin_attestations
FOR EACH ROW
EXECUTE FUNCTION public.prevent_attestation_delete();

-- Add comment for documentation
COMMENT ON TABLE public.origin_attestations IS 'Umarise Core: Immutable origin attestation records. Hash-only, no content storage. TSA-like semantics.';