-- Sidecar table for origin hashes (backend-agnostic)
CREATE TABLE IF NOT EXISTS public.page_origin_hashes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_user_id text NOT NULL,
  page_id uuid NOT NULL,
  image_url text NOT NULL,
  origin_hash_sha256 varchar(64) NOT NULL,
  origin_hash_algo varchar(16) DEFAULT 'sha256',
  created_at timestamptz DEFAULT now()
);

-- Unique constraints for lookup
CREATE UNIQUE INDEX idx_origin_hashes_page_id 
  ON public.page_origin_hashes(device_user_id, page_id);
CREATE UNIQUE INDEX idx_origin_hashes_image_url 
  ON public.page_origin_hashes(device_user_id, image_url);

-- RLS policies (same pattern as pages)
ALTER TABLE public.page_origin_hashes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insert requires device_user_id" ON public.page_origin_hashes
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (device_user_id IS NOT NULL AND device_user_id <> '' AND length(device_user_id) >= 36);

CREATE POLICY "Select own hashes" ON public.page_origin_hashes
  AS RESTRICTIVE FOR SELECT
  USING (device_user_id IS NOT NULL AND device_user_id <> '' AND length(device_user_id) >= 36);

-- Immutability trigger (hash kan nooit worden gewijzigd)
CREATE OR REPLACE FUNCTION public.prevent_origin_hash_sidecar_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'origin_hash_sha256 is immutable once set';
END;
$$;

CREATE TRIGGER enforce_origin_hash_immutability
  BEFORE UPDATE ON public.page_origin_hashes
  FOR EACH ROW EXECUTE FUNCTION public.prevent_origin_hash_sidecar_update();