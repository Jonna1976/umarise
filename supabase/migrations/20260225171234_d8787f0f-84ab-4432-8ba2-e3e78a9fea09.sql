
-- Step 1: Add column (nullable initially)
ALTER TABLE public.origin_attestations ADD COLUMN short_token VARCHAR(8);

-- Step 2: Disable user triggers to allow backfill UPDATE
ALTER TABLE public.origin_attestations DISABLE TRIGGER USER;

-- Step 3: Backfill
UPDATE public.origin_attestations
SET short_token = UPPER(LEFT(encode(digest(origin_id::text, 'sha256'), 'hex'), 8));

-- Step 4: Re-enable
ALTER TABLE public.origin_attestations ENABLE TRIGGER USER;

-- Step 5: Unique index + NOT NULL
CREATE UNIQUE INDEX idx_origin_attestations_short_token ON public.origin_attestations (short_token);
ALTER TABLE public.origin_attestations ALTER COLUMN short_token SET NOT NULL;

-- Step 6: Trigger function for new inserts
CREATE OR REPLACE FUNCTION public.generate_short_token()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  NEW.short_token := UPPER(LEFT(encode(digest(NEW.origin_id::text, 'sha256'), 'hex'), 8));
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_generate_short_token
BEFORE INSERT ON public.origin_attestations
FOR EACH ROW EXECUTE FUNCTION public.generate_short_token();
