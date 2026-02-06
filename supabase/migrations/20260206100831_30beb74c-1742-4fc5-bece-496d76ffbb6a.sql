
-- Tijdelijk delete-trigger uitschakelen voor test-attestatie verwijdering
ALTER TABLE origin_attestations DISABLE TRIGGER prevent_origin_attestation_delete;

-- Verwijder test-attestatie
DELETE FROM origin_attestations WHERE origin_id = '064fef45-c41c-44f9-9fd9-36cf68b8f2bd';

-- Trigger direct weer inschakelen
ALTER TABLE origin_attestations ENABLE TRIGGER prevent_origin_attestation_delete;
