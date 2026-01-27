-- Add association_revoked_at column for "Herroepbaarheid" feature
-- This allows users to revoke their association with an origin WITHOUT deleting it
-- Follows additive-only architecture: origin remains, only association is severed

ALTER TABLE public.pages 
ADD COLUMN association_revoked_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add comment explaining the column's purpose
COMMENT ON COLUMN public.pages.association_revoked_at IS 'Timestamp when user revoked their association with this origin. Origin remains for forensic verification, but is no longer visible to the user. NULL means active association.';

-- Partial index for efficient filtering of active (non-revoked) pages
CREATE INDEX idx_pages_association_active 
ON public.pages (device_user_id, created_at DESC) 
WHERE association_revoked_at IS NULL AND is_trashed = false;