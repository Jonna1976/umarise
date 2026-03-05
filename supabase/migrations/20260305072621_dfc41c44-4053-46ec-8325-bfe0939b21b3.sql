-- Add environment column with sandbox as default
ALTER TABLE public.partner_api_keys 
ADD COLUMN environment text NOT NULL DEFAULT 'sandbox';

-- Add check constraint via trigger for valid values
CREATE OR REPLACE FUNCTION public.validate_partner_environment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.environment NOT IN ('sandbox', 'production') THEN
    RAISE EXCEPTION 'environment must be sandbox or production';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_partner_environment
  BEFORE INSERT OR UPDATE ON public.partner_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_partner_environment();