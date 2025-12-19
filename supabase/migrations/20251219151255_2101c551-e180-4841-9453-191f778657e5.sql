-- Create audit_logs table for Hetzner API request tracking
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Request info
  device_user_id TEXT NOT NULL,
  service TEXT NOT NULL, -- 'ai-proxy' or 'storage-proxy'
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'POST',
  
  -- Response info
  status_code INTEGER,
  duration_ms INTEGER,
  error_message TEXT,
  
  -- Rate limiting info
  rate_limited BOOLEAN DEFAULT false,
  rate_limit_remaining INTEGER,
  
  -- Optional metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Service role can insert (edge functions use service role)
CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Service role can select all (for admin dashboards)
CREATE POLICY "Service role can select audit logs"
ON public.audit_logs
FOR SELECT
TO service_role
USING (true);

-- Users can only see their own audit logs
CREATE POLICY "Users can view own audit logs"
ON public.audit_logs
FOR SELECT
USING (device_user_id IS NOT NULL AND device_user_id <> '' AND length(device_user_id) >= 36);

-- Index for efficient queries
CREATE INDEX idx_audit_logs_device_user_id ON public.audit_logs(device_user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_service_endpoint ON public.audit_logs(service, endpoint);
CREATE INDEX idx_audit_logs_request_id ON public.audit_logs(request_id);

-- Auto-cleanup old logs (keep 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.audit_logs WHERE created_at < now() - INTERVAL '90 days';
END;
$$;