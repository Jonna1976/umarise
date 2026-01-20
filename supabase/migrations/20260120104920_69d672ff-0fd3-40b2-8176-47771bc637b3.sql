-- Additive trash-state table for Hetzner-backed pages (and future providers)
-- Stores trash state independently of where the page content lives.

CREATE TABLE IF NOT EXISTS public.page_trash (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_user_id TEXT NOT NULL,
  page_id TEXT NOT NULL,
  backend_provider TEXT NOT NULL DEFAULT 'hetzner',
  trashed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  restored_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure a page can only have one active trash record per device+provider
CREATE UNIQUE INDEX IF NOT EXISTS page_trash_device_page_provider_uniq
  ON public.page_trash (device_user_id, page_id, backend_provider);

CREATE INDEX IF NOT EXISTS page_trash_device_provider_trashed_idx
  ON public.page_trash (device_user_id, backend_provider, trashed_at DESC)
  WHERE restored_at IS NULL;

-- Enable RLS
ALTER TABLE public.page_trash ENABLE ROW LEVEL SECURITY;

-- RLS policies (device-based privacy model)
CREATE POLICY "Select own trash by device_user_id"
  ON public.page_trash
  FOR SELECT
  USING ((device_user_id IS NOT NULL) AND (device_user_id <> ''::text) AND (length(device_user_id) >= 36));

CREATE POLICY "Insert requires device_user_id"
  ON public.page_trash
  FOR INSERT
  WITH CHECK ((device_user_id IS NOT NULL) AND (device_user_id <> ''::text) AND (length(device_user_id) >= 36));

CREATE POLICY "Update own trash rows"
  ON public.page_trash
  FOR UPDATE
  USING ((device_user_id IS NOT NULL) AND (device_user_id <> ''::text));

CREATE POLICY "Delete own trash rows"
  ON public.page_trash
  FOR DELETE
  USING ((device_user_id IS NOT NULL) AND (device_user_id <> ''::text));

-- Keep updated_at current
DROP TRIGGER IF EXISTS update_page_trash_updated_at ON public.page_trash;
CREATE TRIGGER update_page_trash_updated_at
BEFORE UPDATE ON public.page_trash
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
