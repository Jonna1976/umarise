-- Create table for personality snapshots to track evolution over time
CREATE TABLE public.personality_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_user_id TEXT NOT NULL,
  core_identity TEXT NOT NULL,
  tagline TEXT NOT NULL,
  drivers JSONB NOT NULL DEFAULT '[]'::jsonb,
  tension_field JSONB NOT NULL,
  superpower TEXT NOT NULL,
  growth_edge TEXT NOT NULL,
  page_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.personality_snapshots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (similar to pages table - device_user_id based)
CREATE POLICY "Select own personality snapshots" 
ON public.personality_snapshots 
FOR SELECT 
USING (true);

CREATE POLICY "Insert requires device_user_id" 
ON public.personality_snapshots 
FOR INSERT 
WITH CHECK ((device_user_id IS NOT NULL) AND (device_user_id <> ''::text) AND (length(device_user_id) >= 36));

CREATE POLICY "Delete own personality snapshots" 
ON public.personality_snapshots 
FOR DELETE 
USING ((device_user_id IS NOT NULL) AND (device_user_id <> ''::text));

-- Create index for faster queries by device_user_id
CREATE INDEX idx_personality_snapshots_device_user_id ON public.personality_snapshots(device_user_id);

-- Create index for chronological queries
CREATE INDEX idx_personality_snapshots_created_at ON public.personality_snapshots(created_at DESC);