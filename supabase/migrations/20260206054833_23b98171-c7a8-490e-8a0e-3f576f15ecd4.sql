-- Drop ALLE immutability triggers op origin_attestations (er blijken duplicates te zijn)
DROP TRIGGER IF EXISTS trigger_prevent_attestation_update ON origin_attestations;
DROP TRIGGER IF EXISTS trigger_prevent_attestation_delete ON origin_attestations;
DROP TRIGGER IF EXISTS prevent_origin_attestation_update ON origin_attestations;
DROP TRIGGER IF EXISTS prevent_origin_attestation_delete ON origin_attestations