-- FIX 1: origin_attestations — blokkeer anon INSERT
-- De huidige policy "Service role can insert attestations" staat WITH CHECK (true) 
-- voor roles {public}, waardoor anon kan inserteren.
-- Service_role bypassed RLS sowieso, dus WITH CHECK (false) blokkeert alleen anon/authenticated.
DROP POLICY IF EXISTS "Service role can insert attestations" ON origin_attestations;

CREATE POLICY "Block all INSERT except service_role"
  ON origin_attestations FOR INSERT
  WITH CHECK (false);

-- FIX 2: core_request_log — blokkeer anon SELECT (en alle andere operaties)
-- De huidige policy "Service role only - request logs" is een ALL policy met qual=true,
-- waardoor iedereen alles kan. Vervangen door USING(false).
DROP POLICY IF EXISTS "Service role only - request logs" ON core_request_log;

CREATE POLICY "Block all access except service_role"
  ON core_request_log FOR ALL
  USING (false)
  WITH CHECK (false);