-- Create search telemetry table for tracking retrieval success
CREATE TABLE public.search_telemetry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_user_id TEXT NOT NULL,
  query TEXT NOT NULL,
  result_count INTEGER NOT NULL DEFAULT 0,
  top_5_page_ids TEXT[] DEFAULT '{}',
  selected_page_id UUID,
  selected_rank INTEGER,
  time_to_select_ms INTEGER,
  found_it_confirmed BOOLEAN DEFAULT false,
  time_filter_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.search_telemetry ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Insert own telemetry" 
ON public.search_telemetry 
FOR INSERT 
WITH CHECK (device_user_id IS NOT NULL AND device_user_id <> '' AND length(device_user_id) >= 36);

CREATE POLICY "Select own telemetry" 
ON public.search_telemetry 
FOR SELECT 
USING (true);

-- Create index for analytics queries
CREATE INDEX idx_search_telemetry_device_user ON public.search_telemetry(device_user_id);
CREATE INDEX idx_search_telemetry_created_at ON public.search_telemetry(created_at);