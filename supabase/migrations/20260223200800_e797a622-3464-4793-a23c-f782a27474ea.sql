ALTER TABLE public.attestation_requests
  ADD COLUMN stripe_session_id TEXT;

CREATE UNIQUE INDEX idx_attestation_stripe_session
  ON public.attestation_requests(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;