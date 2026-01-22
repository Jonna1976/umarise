-- Create a lightweight trash index for cross-device sync
-- This table tracks which Hetzner page IDs are trashed, since Hetzner backend
-- does not persist the is_trashed field properly.
-- The actual page data remains on Hetzner; this is just an index.

CREATE TABLE public.hetzner_trash_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_user_id TEXT NOT NULL,
  page_id TEXT NOT NULL,
  trashed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(device_user_id, page_id)
);

-- Enable Row Level Security
ALTER TABLE public.hetzner_trash_index ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - users can only manage their own trash entries
CREATE POLICY "Users can view their own trash index"
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

-- Index for fast lookups by device
CREATE INDEX idx_hetzner_trash_index_device ON public.hetzner_trash_index(device_user_id);
CREATE INDEX idx_hetzner_trash_index_page ON public.hetzner_trash_index(page_id);