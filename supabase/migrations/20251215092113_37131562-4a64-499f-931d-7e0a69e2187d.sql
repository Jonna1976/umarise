-- Page Retrieval Enhancement Migration
-- Adds fields for multi-handle retrieval system

-- Add new retrieval-focused columns to pages table
ALTER TABLE public.pages
ADD COLUMN IF NOT EXISTS future_you_cues text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS future_you_cues_source jsonb DEFAULT '{"ai_prefill_version": null, "user_edited": false}',
ADD COLUMN IF NOT EXISTS written_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ocr_tokens jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS named_entities jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS one_line_hint text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS topic_labels text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS embedding_vector jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS session_id uuid DEFAULT NULL,
ADD COLUMN IF NOT EXISTS capture_batch_id uuid DEFAULT NULL,
ADD COLUMN IF NOT EXISTS writer_user_id text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS source_container_id uuid DEFAULT NULL,
ADD COLUMN IF NOT EXISTS thumbnail_uri text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS highlights text[] DEFAULT '{}';

-- Set writer_user_id to device_user_id as default for existing rows
UPDATE public.pages 
SET writer_user_id = device_user_id 
WHERE writer_user_id IS NULL;

-- Make writer_user_id NOT NULL after backfill
ALTER TABLE public.pages
ALTER COLUMN writer_user_id SET NOT NULL;

-- Add default constraint for new rows
ALTER TABLE public.pages 
ALTER COLUMN writer_user_id SET DEFAULT '';

-- Create index for embedding search (JSONB GIN index)
CREATE INDEX IF NOT EXISTS idx_pages_embedding_vector ON public.pages USING GIN (embedding_vector);

-- Create index for future_you_cues array search
CREATE INDEX IF NOT EXISTS idx_pages_future_you_cues ON public.pages USING GIN (future_you_cues);

-- Create index for named_entities search
CREATE INDEX IF NOT EXISTS idx_pages_named_entities ON public.pages USING GIN (named_entities);

-- Create index for topic_labels
CREATE INDEX IF NOT EXISTS idx_pages_topic_labels ON public.pages USING GIN (topic_labels);

-- Create index for written_at for temporal filtering
CREATE INDEX IF NOT EXISTS idx_pages_written_at ON public.pages (written_at);

-- Create index for session_id grouping
CREATE INDEX IF NOT EXISTS idx_pages_session_id ON public.pages (session_id);

-- Comment on new columns for documentation
COMMENT ON COLUMN public.pages.future_you_cues IS 'Array of exactly 3 retrieval cue words/phrases entered by user';
COMMENT ON COLUMN public.pages.future_you_cues_source IS 'JSON tracking AI prefill version and whether user edited cues';
COMMENT ON COLUMN public.pages.written_at IS 'When the page was actually written (may differ from capture date)';
COMMENT ON COLUMN public.pages.ocr_tokens IS 'Array of {token, confidence, bbox} for fine-grained OCR data';
COMMENT ON COLUMN public.pages.named_entities IS 'Array of {type, value, confidence, span} for detected entities';
COMMENT ON COLUMN public.pages.one_line_hint IS 'AI-generated one-line retrieval hint (never replaces original)';
COMMENT ON COLUMN public.pages.topic_labels IS 'Controlled vocabulary labels for filtering';
COMMENT ON COLUMN public.pages.embedding_vector IS 'Vector embedding for semantic search';
COMMENT ON COLUMN public.pages.session_id IS 'Auto-generated session grouping ID';
COMMENT ON COLUMN public.pages.capture_batch_id IS 'Batch import/capture session ID';
COMMENT ON COLUMN public.pages.writer_user_id IS 'Who wrote the page (default = owner)';
COMMENT ON COLUMN public.pages.source_container_id IS 'Reference to notebook/album container';
COMMENT ON COLUMN public.pages.thumbnail_uri IS 'Optimized thumbnail image URI';
COMMENT ON COLUMN public.pages.highlights IS 'Text segments that were visually emphasized by writer';