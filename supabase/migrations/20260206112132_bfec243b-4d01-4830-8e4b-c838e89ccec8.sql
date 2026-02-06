-- Fix core_rate_limits: drop overly permissive policy, restrict to service_role only
DROP POLICY IF EXISTS "Service role only - rate limits" ON public.core_rate_limits;

-- Create proper service_role-only policy
CREATE POLICY "Service role only - rate limits"
  ON public.core_rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Explicitly block anon and authenticated
CREATE POLICY "Block anon on core_rate_limits"
  ON public.core_rate_limits
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Block authenticated on core_rate_limits"
  ON public.core_rate_limits
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);