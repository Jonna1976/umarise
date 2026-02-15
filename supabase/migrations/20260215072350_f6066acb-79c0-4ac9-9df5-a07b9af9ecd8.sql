
-- ============================================================
-- STAP 3: Lock down active tables now that client uses proxy
-- personality_snapshots, projects, page_origin_hashes, hetzner_trash_index
-- All access goes through companion-data edge function (service_role)
-- ============================================================

-- PERSONALITY_SNAPSHOTS
DROP POLICY IF EXISTS "Select own personality snapshots" ON public.personality_snapshots;
CREATE POLICY "Block client select personality_snapshots"
  ON public.personality_snapshots FOR SELECT USING (false);

DROP POLICY IF EXISTS "Insert requires device_user_id" ON public.personality_snapshots;
CREATE POLICY "Block client insert personality_snapshots"
  ON public.personality_snapshots FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "Update own personality snapshots" ON public.personality_snapshots;
CREATE POLICY "Block client update personality_snapshots"
  ON public.personality_snapshots FOR UPDATE USING (false);

DROP POLICY IF EXISTS "Delete own personality snapshots" ON public.personality_snapshots;
CREATE POLICY "Block client delete personality_snapshots"
  ON public.personality_snapshots FOR DELETE USING (false);

-- PROJECTS
DROP POLICY IF EXISTS "Select own projects" ON public.projects;
CREATE POLICY "Block client select projects"
  ON public.projects FOR SELECT USING (false);

DROP POLICY IF EXISTS "Insert requires device_user_id" ON public.projects;
CREATE POLICY "Block client insert projects"
  ON public.projects FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "Update own projects" ON public.projects;
CREATE POLICY "Block client update projects"
  ON public.projects FOR UPDATE USING (false);

DROP POLICY IF EXISTS "Delete own projects" ON public.projects;
CREATE POLICY "Block client delete projects"
  ON public.projects FOR DELETE USING (false);

-- PAGE_ORIGIN_HASHES
DROP POLICY IF EXISTS "Select own hashes" ON public.page_origin_hashes;
CREATE POLICY "Block client select page_origin_hashes"
  ON public.page_origin_hashes FOR SELECT USING (false);

DROP POLICY IF EXISTS "Allow insert with valid device_user_id" ON public.page_origin_hashes;
CREATE POLICY "Block client insert page_origin_hashes"
  ON public.page_origin_hashes FOR INSERT WITH CHECK (false);

-- HETZNER_TRASH_INDEX
DROP POLICY IF EXISTS "Users can view their own trash entries" ON public.hetzner_trash_index;
CREATE POLICY "Block client select hetzner_trash_index"
  ON public.hetzner_trash_index FOR SELECT USING (false);

DROP POLICY IF EXISTS "Users can insert their own trash entries" ON public.hetzner_trash_index;
CREATE POLICY "Block client insert hetzner_trash_index"
  ON public.hetzner_trash_index FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "Users can delete their own trash entries" ON public.hetzner_trash_index;
CREATE POLICY "Block client delete hetzner_trash_index"
  ON public.hetzner_trash_index FOR DELETE USING (false);
