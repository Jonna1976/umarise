-- Database function for atomic rate limit check
-- Uses UPSERT to atomically increment counter and check limit

CREATE OR REPLACE FUNCTION core_check_rate_limit(
  p_rate_key text,
  p_endpoint text,
  p_limit integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start timestamptz;
  v_count integer;
  v_allowed boolean;
BEGIN
  -- Calculate current minute window
  v_window_start := date_trunc('minute', now());
  
  -- UPSERT: increment counter or create new record
  INSERT INTO core_rate_limits (rate_key, endpoint, window_start, request_count)
  VALUES (p_rate_key, p_endpoint, v_window_start, 1)
  ON CONFLICT (rate_key, endpoint, window_start)
  DO UPDATE SET request_count = core_rate_limits.request_count + 1
  RETURNING request_count INTO v_count;
  
  -- Check if within limit
  v_allowed := v_count <= p_limit;
  
  RETURN jsonb_build_object('count', v_count, 'allowed', v_allowed);
END;
$$;