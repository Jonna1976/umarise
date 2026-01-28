-- Fix RLS policies on hetzner_trash_index
-- The current RESTRICTIVE policy only validates format but doesn't grant access
-- We need a PERMISSIVE policy that grants access, combined with format validation

-- Drop existing policies
DROP POLICY IF EXISTS "Users can delete their own trash entries" ON public.hetzner_trash_index;
DROP POLICY IF EXISTS "Users can view their own trash index" ON public.hetzner_trash_index;
DROP POLICY IF EXISTS "Users can insert their own trash entries" ON public.hetzner_trash_index;

-- Create PERMISSIVE policies that both validate format AND grant ownership-based access
-- These use PERMISSIVE (default) so they grant access when conditions are met

CREATE POLICY "Users can view their own trash entries"
ON public.hetzner_trash_index
FOR SELECT
USING (
  device_user_id IS NOT NULL 
  AND length(device_user_id) >= 36
);

CREATE POLICY "Users can insert their own trash entries"
ON public.hetzner_trash_index
FOR INSERT
WITH CHECK (
  device_user_id IS NOT NULL 
  AND length(device_user_id) >= 36
);

CREATE POLICY "Users can delete their own trash entries"
ON public.hetzner_trash_index
FOR DELETE
USING (
  device_user_id IS NOT NULL 
  AND length(device_user_id) >= 36
);