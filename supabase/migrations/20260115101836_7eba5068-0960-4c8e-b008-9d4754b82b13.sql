-- Drop existing restrictive INSERT policy
DROP POLICY IF EXISTS "Insert requires device_user_id" ON public.page_origin_hashes;

-- Create permissive INSERT policy (same pattern as pages table)
-- Device_user_id validation happens in application layer
CREATE POLICY "Insert with valid device_user_id" ON public.page_origin_hashes
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (
    device_user_id IS NOT NULL 
    AND device_user_id <> '' 
    AND length(device_user_id) >= 36
  );