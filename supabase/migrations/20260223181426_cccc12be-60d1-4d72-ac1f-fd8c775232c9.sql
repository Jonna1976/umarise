
-- ============================================
-- LAAG 3 ATTESTATIE — VOLLEDIGE MIGRATIE
-- 23 februari 2026
-- ============================================

-- STAP 1: Attestation requests tabel
CREATE TABLE public.attestation_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  origin_id UUID NOT NULL,
  device_user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  attestant_name TEXT,
  attestant_certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_origin FOREIGN KEY (origin_id) 
    REFERENCES public.origin_attestations(origin_id)
);

CREATE INDEX idx_attestation_requests_origin ON public.attestation_requests(origin_id);
CREATE INDEX idx_attestation_requests_device ON public.attestation_requests(device_user_id);
CREATE INDEX idx_attestation_requests_status ON public.attestation_requests(status);

ALTER TABLE public.attestation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own attestation requests"
  ON public.attestation_requests FOR SELECT
  USING (device_user_id IS NOT NULL AND length(device_user_id) >= 36);

CREATE POLICY "Users insert own attestation requests"
  ON public.attestation_requests FOR INSERT
  WITH CHECK (device_user_id IS NOT NULL AND length(device_user_id) >= 36);

CREATE POLICY "Block client update attestation_requests"
  ON public.attestation_requests FOR UPDATE
  USING (false);

CREATE POLICY "Block client delete attestation_requests"
  ON public.attestation_requests FOR DELETE
  USING (false);

CREATE TRIGGER update_attestation_requests_updated_at
  BEFORE UPDATE ON public.attestation_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- STAP 2a: Signing kolommen
ALTER TABLE public.attestation_requests
  ADD COLUMN signature TEXT,
  ADD COLUMN attestant_public_key TEXT;

-- STAP 2b: Certificaat als tekst
ALTER TABLE public.attestation_requests
  ADD COLUMN attestant_certificate TEXT;

-- STAP 2c: Write-once trigger op confirmed records
CREATE OR REPLACE FUNCTION public.prevent_confirmed_attestation_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'confirmed' THEN
    RAISE EXCEPTION 'Confirmed attestation records are immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE TRIGGER lock_confirmed_attestation
  BEFORE UPDATE ON public.attestation_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_confirmed_attestation_update();

-- STAP 3: Attestants tabel
CREATE TABLE public.attestants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  public_key TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT false,
  certified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.attestants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read attestants"
  ON public.attestants FOR SELECT
  USING (active = true);

CREATE POLICY "Block client insert attestants"
  ON public.attestants FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block client update attestants"
  ON public.attestants FOR UPDATE
  USING (false);

CREATE POLICY "Block client delete attestants"
  ON public.attestants FOR DELETE
  USING (false);
