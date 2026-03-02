ALTER TABLE public.partner_api_keys
  ADD COLUMN IF NOT EXISTS first_attestation_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS first_error_code text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sdk_used text DEFAULT NULL;