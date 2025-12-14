-- Add "Future You Cue" field to pages table
-- This is a retrieval cue that helps users remember why a page matters
ALTER TABLE public.pages 
ADD COLUMN future_you_cue TEXT;