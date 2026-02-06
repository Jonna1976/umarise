-- Opdracht 1: Koppel immutability triggers aan bestaande functies
-- Deze functies bestaan al, maar hangen nergens aan

-- 1. Prevent UPDATE op origin_attestations
CREATE TRIGGER trigger_prevent_attestation_update
  BEFORE UPDATE ON public.origin_attestations
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_attestation_update();

-- 2. Prevent DELETE op origin_attestations  
CREATE TRIGGER trigger_prevent_attestation_delete
  BEFORE DELETE ON public.origin_attestations
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_attestation_delete();

-- 3. Prevent DELETE op partner_api_keys
CREATE TRIGGER trigger_prevent_api_key_delete
  BEFORE DELETE ON public.partner_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_api_key_delete();

-- 4. Prevent mutation op anchored OTS proofs
CREATE TRIGGER trigger_prevent_anchored_proof_mutation
  BEFORE UPDATE ON public.core_ots_proofs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_anchored_proof_mutation();