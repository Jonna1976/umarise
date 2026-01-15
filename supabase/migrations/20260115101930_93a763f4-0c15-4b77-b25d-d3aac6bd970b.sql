-- Drop the restrictive SELECT policy
DROP POLICY IF EXISTS "Select own hashes" ON public.page_origin_hashes;

-- Create PERMISSIVE SELECT policy
CREATE POLICY "Select own hashes" ON public.page_origin_hashes
  FOR SELECT
  USING (
    device_user_id IS NOT NULL 
    AND device_user_id <> '' 
    AND length(device_user_id) >= 36
  );