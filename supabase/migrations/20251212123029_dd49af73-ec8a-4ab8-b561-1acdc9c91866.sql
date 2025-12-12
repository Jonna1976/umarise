-- Add sources field to pages table for URL references
-- This field stores URLs/references separately from content used in personality analysis
ALTER TABLE public.pages 
ADD COLUMN sources text[] DEFAULT '{}'::text[];

-- Add comment for clarity
COMMENT ON COLUMN public.pages.sources IS 'Array of source URLs/references linked to this page. Not used for personality analysis.';