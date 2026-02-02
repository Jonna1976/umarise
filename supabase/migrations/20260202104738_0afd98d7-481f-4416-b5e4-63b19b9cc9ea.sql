-- Partner API Keys table for Core attestation access control
-- Keys are HMAC-SHA256 hashed, never stored in plaintext

CREATE TABLE public.partner_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash TEXT NOT NULL UNIQUE,           -- HMAC-SHA256(server_secret, plaintext_key)
  key_prefix TEXT NOT NULL,                -- first 8-12 chars of plaintext key for identification
  partner_name TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,                  -- null = active
  issued_by TEXT                           -- who within Umarise issued the key
);

-- Enable RLS
ALTER TABLE public.partner_api_keys ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write (no public access, no user access)
CREATE POLICY "Service role only - select"
ON public.partner_api_keys
FOR SELECT
USING (false);

CREATE POLICY "Service role only - insert"
ON public.partner_api_keys
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Service role only - update"
ON public.partner_api_keys
FOR UPDATE
USING (false);

-- Immutability: prevent deletion of key records (audit trail)
CREATE OR REPLACE FUNCTION public.prevent_api_key_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'API key records cannot be deleted. Use revoked_at to revoke.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_api_key_deletion
BEFORE DELETE ON public.partner_api_keys
FOR EACH ROW
EXECUTE FUNCTION public.prevent_api_key_delete();

-- Comment for documentation
COMMENT ON TABLE public.partner_api_keys IS 'Partner API keys for POST /core/origins attestation access. Keys are HMAC-SHA256 hashed. Revocation via revoked_at, no deletion allowed.';