
-- ============================================================
-- STAP 1: Lock down tables with no active client-side queries
-- audit_logs, search_telemetry, page_trash
-- These are only accessed via service_role (edge functions) 
-- or not at all.
-- ============================================================

-- AUDIT_LOGS: drop existing SELECT policy, replace with block
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Block all client select on audit_logs"
  ON public.audit_logs FOR SELECT
  USING (false);

-- SEARCH_TELEMETRY: drop existing SELECT policy, replace with block  
DROP POLICY IF EXISTS "Select own telemetry" ON public.search_telemetry;
CREATE POLICY "Block all client select on search_telemetry"
  ON public.search_telemetry FOR SELECT
  USING (false);

-- Also block INSERT on search_telemetry since it's no longer used
DROP POLICY IF EXISTS "Insert own telemetry" ON public.search_telemetry;
CREATE POLICY "Block all client insert on search_telemetry"
  ON public.search_telemetry FOR INSERT
  WITH CHECK (false);

-- PAGE_TRASH: no client queries found, lock it down
DROP POLICY IF EXISTS "Select own trash by device_user_id" ON public.page_trash;
CREATE POLICY "Block all client select on page_trash"
  ON public.page_trash FOR SELECT
  USING (false);

DROP POLICY IF EXISTS "Insert requires device_user_id" ON public.page_trash;
CREATE POLICY "Block all client insert on page_trash"
  ON public.page_trash FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "Update own trash rows" ON public.page_trash;
CREATE POLICY "Block all client update on page_trash"
  ON public.page_trash FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "Delete own trash rows" ON public.page_trash;
CREATE POLICY "Block all client delete on page_trash"
  ON public.page_trash FOR DELETE
  USING (false);
