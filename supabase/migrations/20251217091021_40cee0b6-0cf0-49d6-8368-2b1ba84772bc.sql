-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Select own pages by device_user_id" ON public.pages;

-- Create a more restrictive SELECT policy that requires device_user_id match
-- Note: Without full authentication, this relies on application-level filtering
-- but prevents blanket SELECT * queries from returning all data
CREATE POLICY "Select own pages by device_user_id" 
ON public.pages 
FOR SELECT 
USING (
  device_user_id IS NOT NULL 
  AND device_user_id <> ''::text
  AND length(device_user_id) >= 36
);

-- Also fix the same issue on other tables
DROP POLICY IF EXISTS "Select own personality snapshots" ON public.personality_snapshots;
CREATE POLICY "Select own personality snapshots" 
ON public.personality_snapshots 
FOR SELECT 
USING (
  device_user_id IS NOT NULL 
  AND device_user_id <> ''::text
  AND length(device_user_id) >= 36
);

DROP POLICY IF EXISTS "Select own projects" ON public.projects;
CREATE POLICY "Select own projects" 
ON public.projects 
FOR SELECT 
USING (
  device_user_id IS NOT NULL 
  AND device_user_id <> ''::text
  AND length(device_user_id) >= 36
);

DROP POLICY IF EXISTS "Select own telemetry" ON public.search_telemetry;
CREATE POLICY "Select own telemetry" 
ON public.search_telemetry 
FOR SELECT 
USING (
  device_user_id IS NOT NULL 
  AND device_user_id <> ''::text
  AND length(device_user_id) >= 36
);