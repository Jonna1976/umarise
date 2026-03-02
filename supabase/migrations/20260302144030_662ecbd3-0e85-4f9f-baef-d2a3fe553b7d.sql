
-- Witnesses: replace INSERT policy with ownership check
DROP POLICY IF EXISTS "Insert witness with valid data" ON public.witnesses;
CREATE POLICY "Insert witness with valid data"
  ON public.witnesses
  AS RESTRICTIVE
  FOR INSERT
  WITH CHECK (
    (witness_email IS NOT NULL)
    AND (witness_email <> ''::text)
    AND (page_id IS NOT NULL)
    AND (page_id IN (
      SELECT pages.id FROM public.pages
      WHERE pages.device_user_id IS NOT NULL
        AND length(pages.device_user_id) >= 36
    ))
  );
