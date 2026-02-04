-- Add rate_limit_tier column to partner_api_keys for tiered rate limiting
ALTER TABLE public.partner_api_keys 
ADD COLUMN IF NOT EXISTS rate_limit_tier text NOT NULL DEFAULT 'standard' 
CHECK (rate_limit_tier IN ('standard', 'premium', 'unlimited'));