
CREATE OR REPLACE FUNCTION public.generate_short_token()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.short_token := UPPER(LEFT(encode(sha256(NEW.origin_id::text::bytea), 'hex'), 8));
  RETURN NEW;
END;
$function$;
