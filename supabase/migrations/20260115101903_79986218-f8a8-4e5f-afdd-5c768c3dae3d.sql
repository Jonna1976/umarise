-- Drop the restrictive policy
DROP POLICY IF EXISTS "Insert with valid device_user_id" ON public.page_origin_hashes;

-- Create PERMISSIVE INSERT policy (allows insert if condition is met)
CREATE POLICY "Allow insert with valid device_user_id" ON public.page_origin_hashes
  FOR INSERT
  WITH CHECK (
    device_user_id IS NOT NULL 
    AND device_user_id <> '' 
    AND length(device_user_id) >= 36
  );