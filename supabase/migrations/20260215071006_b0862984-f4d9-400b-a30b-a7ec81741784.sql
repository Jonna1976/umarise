
-- ============================================================
-- RLS HARDENING: Remove overly permissive policies
-- Service role bypasses RLS anyway, so USING(true) policies are
-- redundant and flagged as security risks.
-- ============================================================

-- 1. audit_logs: Drop redundant service role policies
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Service role can select audit logs" ON public.audit_logs;

-- 2. core_rate_limits: Drop redundant USING(true) service role policy
DROP POLICY IF EXISTS "Service role only - rate limits" ON public.core_rate_limits;

-- 3. core_ots_proofs: Drop redundant USING(true) service role policy
DROP POLICY IF EXISTS "Service role only - ots proofs" ON public.core_ots_proofs;

-- 4. witnesses: Tighten the INSERT policy (was WITH CHECK(true))
DROP POLICY IF EXISTS "Anyone can create witness via verification" ON public.witnesses;
CREATE POLICY "Insert witness with valid data"
  ON public.witnesses FOR INSERT
  WITH CHECK (
    witness_email IS NOT NULL 
    AND witness_email <> '' 
    AND page_id IS NOT NULL
  );

-- 5. witnesses: Tighten UPDATE policy
DROP POLICY IF EXISTS "Anyone confirms via valid token" ON public.witnesses;
CREATE POLICY "Confirm witness via valid unexpired token"
  ON public.witnesses FOR UPDATE
  USING (
    verification_token IS NOT NULL 
    AND token_expires_at > now()
    AND witness_confirmed_at IS NULL
  );
