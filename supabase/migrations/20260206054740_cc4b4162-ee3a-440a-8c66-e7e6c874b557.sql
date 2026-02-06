-- Stap 1: Drop BEIDE triggers eerst
DROP TRIGGER IF EXISTS trigger_prevent_attestation_delete ON origin_attestations;
DROP TRIGGER IF EXISTS trigger_prevent_attestation_update ON origin_attestations