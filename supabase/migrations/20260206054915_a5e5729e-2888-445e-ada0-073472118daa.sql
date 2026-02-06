-- Herstel ALLE immutability triggers met consistente naamgeving

-- 1. origin_attestations - UPDATE blokkeren
CREATE TRIGGER prevent_origin_attestation_update
  BEFORE UPDATE ON public.origin_attestations
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_attestation_update();

-- 2. origin_attestations - DELETE blokkeren  
CREATE TRIGGER prevent_origin_attestation_delete
  BEFORE DELETE ON public.origin_attestations
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_attestation_delete();

-- 3. partner_api_keys - DELETE blokkeren (check of deze nog bestaat)
DROP TRIGGER IF EXISTS trigger_prevent_api_key_delete ON partner_api_keys;
DROP TRIGGER IF EXISTS prevent_api_key_delete ON partner_api_keys;

CREATE TRIGGER prevent_api_key_delete
  BEFORE DELETE ON public.partner_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_api_key_delete();

-- 4. core_ots_proofs - anchored proofs immutable (check of deze nog bestaat)
DROP TRIGGER IF EXISTS trigger_prevent_anchored_proof_mutation ON core_ots_proofs;
DROP TRIGGER IF EXISTS prevent_anchored_proof_mutation ON core_ots_proofs;

CREATE TRIGGER prevent_anchored_proof_mutation
  BEFORE UPDATE ON public.core_ots_proofs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_anchored_proof_mutation()