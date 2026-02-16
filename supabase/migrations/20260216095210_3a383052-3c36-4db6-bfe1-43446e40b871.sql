
-- Health check log table for monitoring
CREATE TABLE public.health_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'operational',
  response_time_ms INTEGER,
  status_code INTEGER,
  error_message TEXT,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  alert_sent BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;

-- Public read (for status page)
CREATE POLICY "Health checks are publicly readable"
  ON public.health_checks FOR SELECT
  USING (true);

-- Index for status page queries
CREATE INDEX idx_health_checks_checked_at ON public.health_checks (checked_at DESC);

-- Cleanup function for old records (keep 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_health_checks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.health_checks WHERE checked_at < now() - INTERVAL '30 days';
END;
$$;
