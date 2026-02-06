
-- Stap 1: DDL Audit tabel
CREATE TABLE public.core_ddl_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  object_type text,
  object_name text,
  command_tag text,
  executed_by text DEFAULT current_user,
  executed_at timestamptz DEFAULT now(),
  raw_command text
);

-- RLS: alleen service role
ALTER TABLE public.core_ddl_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only - ddl audit"
  ON public.core_ddl_audit
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Immutability triggers
CREATE OR REPLACE FUNCTION public.prevent_ddl_audit_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'DDL audit log is append-only';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_prevent_ddl_audit_update
  BEFORE UPDATE ON public.core_ddl_audit
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ddl_audit_mutation();

CREATE TRIGGER trigger_prevent_ddl_audit_delete
  BEFORE DELETE ON public.core_ddl_audit
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ddl_audit_mutation();

-- Stap 2: Event trigger functie
CREATE OR REPLACE FUNCTION public.log_ddl_event()
RETURNS event_trigger AS $$
BEGIN
  INSERT INTO public.core_ddl_audit (event_type, command_tag)
  VALUES (TG_EVENT, TG_TAG);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Event trigger
CREATE EVENT TRIGGER audit_ddl_commands
  ON ddl_command_end
  WHEN TAG IN ('ALTER TABLE', 'DROP TRIGGER', 'DROP FUNCTION', 'DROP TABLE')
  EXECUTE FUNCTION public.log_ddl_event();
