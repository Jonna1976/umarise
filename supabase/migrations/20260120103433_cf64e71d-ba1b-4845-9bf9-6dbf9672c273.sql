-- Add trash columns to pages table for cross-device sync
ALTER TABLE public.pages 
ADD COLUMN is_trashed boolean NOT NULL DEFAULT false,
ADD COLUMN trashed_at timestamp with time zone DEFAULT NULL;

-- Create partial index for efficient filtering of non-trashed pages
CREATE INDEX idx_pages_not_trashed 
ON public.pages(device_user_id) 
WHERE is_trashed = false;

-- Add comment for documentation
COMMENT ON COLUMN public.pages.is_trashed IS 'Soft delete flag - true means page is in trash';
COMMENT ON COLUMN public.pages.trashed_at IS 'Timestamp when page was moved to trash';