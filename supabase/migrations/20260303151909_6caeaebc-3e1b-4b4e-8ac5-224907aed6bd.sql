
-- Add credit_balance column to partner_api_keys
-- Default NULL = unlimited (backwards compatible for existing partners)
-- 0 = no credits remaining
ALTER TABLE public.partner_api_keys
ADD COLUMN credit_balance integer DEFAULT NULL;

-- Add a comment explaining the semantics
COMMENT ON COLUMN public.partner_api_keys.credit_balance IS 
  'NULL = unlimited (legacy/founding partners). 0 = depleted. Positive integer = remaining anchors.';
