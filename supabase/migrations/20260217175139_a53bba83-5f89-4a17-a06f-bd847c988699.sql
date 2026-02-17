
-- Add object_identity column for full qualified names (e.g. "public.origin_attestations")
ALTER TABLE public.core_ddl_audit
  ADD COLUMN IF NOT EXISTS object_identity text;

-- Enhance log_ddl_event to capture all available fields from pg_event_trigger_ddl_commands()
CREATE OR REPLACE FUNCTION public.log_ddl_event()
  RETURNS event_trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT * FROM pg_event_trigger_ddl_commands() LOOP
    INSERT INTO public.core_ddl_audit (
      event_type,
      command_tag,
      object_type,
      object_name,
      object_identity,
      executed_by,
      raw_command
    ) VALUES (
      TG_EVENT,
      r.command_tag,
      r.object_type,
      r.object_identity,
      r.object_identity,
      current_user,
      left(current_query(), 1000)
    );
  END LOOP;
END;
$function$;

-- Attach write-once triggers to core_ddl_audit (prevent UPDATE and DELETE)
CREATE TRIGGER prevent_ddl_audit_update
  BEFORE UPDATE ON public.core_ddl_audit
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_ddl_audit_mutation();

CREATE TRIGGER prevent_ddl_audit_delete
  BEFORE DELETE ON public.core_ddl_audit
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_ddl_audit_mutation();
