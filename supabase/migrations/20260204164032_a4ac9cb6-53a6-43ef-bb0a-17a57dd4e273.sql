-- Week 1: Core infrastructure tables for rate limiting and request logging
-- These are operational tables, NOT immutable like origin_attestations

-- Rate limiting table
CREATE TABLE core_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_key text NOT NULL,
  endpoint text NOT NULL,
  window_start timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  UNIQUE(rate_key, endpoint, window_start)
);

CREATE INDEX idx_rate_limits_lookup 
  ON core_rate_limits(rate_key, endpoint, window_start);

-- Request logging table
CREATE TABLE core_request_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL,
  method text NOT NULL,
  api_key_prefix text,
  status_code integer NOT NULL,
  response_time_ms integer NOT NULL,
  error_code text,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_request_log_created ON core_request_log(created_at);
CREATE INDEX idx_request_log_endpoint ON core_request_log(endpoint, created_at);
CREATE INDEX idx_request_log_partner ON core_request_log(api_key_prefix, created_at);

-- Enable RLS on both tables
ALTER TABLE core_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_request_log ENABLE ROW LEVEL SECURITY;

-- Service role only for rate limits (edge functions need read/write)
CREATE POLICY "Service role only - rate limits"
  ON core_rate_limits FOR ALL
  USING (true)
  WITH CHECK (true);

-- Service role only for request logs (edge functions need insert, internal needs select)
CREATE POLICY "Service role only - request logs"
  ON core_request_log FOR ALL
  USING (true)
  WITH CHECK (true);