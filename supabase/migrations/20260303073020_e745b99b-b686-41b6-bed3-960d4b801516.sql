-- Add webhook support to partner_api_keys
ALTER TABLE public.partner_api_keys 
  ADD COLUMN webhook_url TEXT DEFAULT NULL,
  ADD COLUMN webhook_secret TEXT DEFAULT NULL;

-- Track webhook delivery attempts
CREATE TABLE public.webhook_delivery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_id UUID NOT NULL,
  partner_key_prefix TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  status_code INTEGER,
  attempt INTEGER NOT NULL DEFAULT 1,
  error_message TEXT,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webhook_delivery_log ENABLE ROW LEVEL SECURITY;

-- Service role only
CREATE POLICY "Service role only - webhook_delivery_log"
  ON public.webhook_delivery_log
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Index for lookup by origin_id
CREATE INDEX idx_webhook_delivery_origin ON public.webhook_delivery_log(origin_id);

-- Index for cleanup
CREATE INDEX idx_webhook_delivery_created ON public.webhook_delivery_log(created_at);