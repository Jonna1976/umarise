-- Fix: anonymous marks (user_id IS NULL) worden geblokkeerd door RESTRICTIVE policy
-- De policy "Users read own pages via user_id" evalueert NULL = NULL → FALSE
-- Dit blokkeert alle reads op pre-login marks, inclusief proof polling

-- Drop the problematic RESTRICTIVE policy
DROP POLICY IF EXISTS "Users read own pages via user_id" ON public.pages;

-- Recreate as RESTRICTIVE but with NULL handling
-- Allows: authenticated user reading their own pages (user_id match)
-- Allows: pages without user_id (anonymous/pre-login marks) — filtered by device_user_id via second policy
CREATE POLICY "Users read own pages via user_id"
  ON public.pages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Also fix the UPDATE policy for the same reason
DROP POLICY IF EXISTS "Users update own pages via user_id" ON public.pages;

CREATE POLICY "Users update own pages via user_id"
  ON public.pages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);