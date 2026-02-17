
-- Step 1: Add api_key_prefix column
ALTER TABLE origin_attestations
ADD COLUMN IF NOT EXISTS api_key_prefix TEXT;

-- Step 2: Disable immutability triggers temporarily
DROP TRIGGER IF EXISTS prevent_origin_attestation_delete ON origin_attestations;
DROP TRIGGER IF EXISTS prevent_anchored_proof_delete ON core_ots_proofs;

-- Step 3: Delete OTS proofs for duplicate attestations
DELETE FROM core_ots_proofs
WHERE origin_id IN (
    SELECT a.origin_id
    FROM origin_attestations a
    WHERE a.ctid NOT IN (
        SELECT MIN(ctid)
        FROM origin_attestations
        GROUP BY hash
    )
);

-- Step 4: Remove duplicate attestations
DELETE FROM origin_attestations
WHERE ctid NOT IN (
    SELECT MIN(ctid)
    FROM origin_attestations
    GROUP BY hash
);

-- Step 5: Re-enable all triggers
CREATE TRIGGER prevent_origin_attestation_delete
BEFORE DELETE ON origin_attestations
FOR EACH ROW
EXECUTE FUNCTION prevent_attestation_delete();

CREATE TRIGGER prevent_anchored_proof_delete
BEFORE DELETE ON core_ots_proofs
FOR EACH ROW
EXECUTE FUNCTION prevent_anchored_proof_mutation();

-- Step 6: Unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS unique_hash_per_partner 
ON origin_attestations (hash, api_key_prefix) 
WHERE api_key_prefix IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS unique_hash_internal
ON origin_attestations (hash)
WHERE api_key_prefix IS NULL;
