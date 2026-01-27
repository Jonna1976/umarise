-- Create revocation index table for Herroepbaarheid
-- Following the same pattern as hetzner_trash_index
-- This stores which pages have their association revoked (Cloud-side index)
-- while the actual origin data remains on Hetzner

CREATE TABLE public.page_association_revocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_user_id TEXT NOT NULL,
  page_id TEXT NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique revocation per device+page
  CONSTRAINT unique_page_revocation UNIQUE (device_user_id, page_id)
);

-- Enable RLS
ALTER TABLE public.page_association_revocations ENABLE ROW LEVEL SECURITY;

-- RLS Policies (same pattern as hetzner_trash_index)
CREATE POLICY "Users can view their own revocations"
ON public.page_association_revocations
FOR SELECT
USING (device_user_id IS NOT NULL AND length(device_user_id) >= 36);

CREATE POLICY "Users can insert their own revocations"
ON public.page_association_revocations
FOR INSERT
WITH CHECK (device_user_id IS NOT NULL AND length(device_user_id) >= 36);

CREATE POLICY "Users can delete their own revocations"
ON public.page_association_revocations
FOR DELETE
USING (device_user_id IS NOT NULL AND length(device_user_id) >= 36);

-- Index for fast lookups
CREATE INDEX idx_page_revocations_device_user 
ON public.page_association_revocations (device_user_id);

-- Comment
COMMENT ON TABLE public.page_association_revocations IS 'Cloud-side index tracking which Hetzner pages have their association revoked. Origin data remains on Hetzner, only the user association is severed.';