-- Add capsule support to pages table
-- Pages with the same capsule_id belong together, page_order determines sequence

ALTER TABLE public.pages 
ADD COLUMN capsule_id uuid DEFAULT NULL,
ADD COLUMN page_order integer DEFAULT 0;

-- Index for efficient capsule queries
CREATE INDEX idx_pages_capsule_id ON public.pages(capsule_id) WHERE capsule_id IS NOT NULL;