-- Disable delete triggers for test data cleanup
ALTER TABLE origin_attestations DISABLE TRIGGER prevent_origin_attestation_delete;

-- Remove test attestation
DELETE FROM origin_attestations WHERE origin_id = '25e8c3e4-a113-4230-947d-8eba5cd74b3d';

-- Re-enable trigger
ALTER TABLE origin_attestations ENABLE TRIGGER prevent_origin_attestation_delete;