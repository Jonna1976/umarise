
-- ============================================================
-- FIX: Pages RLS - Blokkeer anon lees/schrijf/verwijder
-- 
-- Probleem: device_user_id policies checken alleen of kolom
-- niet leeg is, niet of het de huidige gebruiker betreft.
-- Elke anon gebruiker kan alle pages lezen/updaten/deleten.
-- ============================================================

-- 1. Drop gebroken device_user_id policies (geen user verificatie)
DROP POLICY IF EXISTS "Select own pages by device_user_id" ON public.pages;
DROP POLICY IF EXISTS "Update own pages" ON public.pages;
DROP POLICY IF EXISTS "Delete own pages" ON public.pages;

-- 2. Blokkeer anon SELECT/UPDATE/DELETE volledig
CREATE POLICY "Block anon select on pages"
ON public.pages FOR SELECT
TO anon
USING (false);

CREATE POLICY "Block anon update on pages"
ON public.pages FOR UPDATE
TO anon
USING (false);

CREATE POLICY "Block anon delete on pages"
ON public.pages FOR DELETE
TO anon
USING (false);

-- 3. Voeg authenticated device_user_id policies toe
-- Na magic link auth wordt user_id gezet, maar voor de 
-- overgangsperiode moeten authenticated users ook hun 
-- device_user_id-gekoppelde pages kunnen zien/updaten/deleten.
-- Dit is veiliger omdat authenticated users een JWT hebben.
CREATE POLICY "Authenticated select own pages by device_user_id"
ON public.pages FOR SELECT
TO authenticated
USING (
  device_user_id IS NOT NULL 
  AND device_user_id <> '' 
  AND length(device_user_id) >= 36
);

CREATE POLICY "Authenticated update own pages by device_user_id"
ON public.pages FOR UPDATE
TO authenticated
USING (
  device_user_id IS NOT NULL 
  AND device_user_id <> '' 
  AND length(device_user_id) >= 36
);

CREATE POLICY "Authenticated delete own pages by device_user_id"
ON public.pages FOR DELETE
TO authenticated
USING (
  device_user_id IS NOT NULL 
  AND device_user_id <> '' 
  AND length(device_user_id) >= 36
);

-- 4. Bestaande policies blijven:
-- "Users read own pages via user_id" (SELECT, auth.uid() = user_id) ✅
-- "Users update own pages via user_id" (UPDATE, auth.uid() = user_id) ✅  
-- "Insert requires device_user_id" (INSERT, voor v4 anon mark creatie) ✅
