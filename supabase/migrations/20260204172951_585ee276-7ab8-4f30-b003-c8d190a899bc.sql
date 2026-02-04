-- Core OTS Proofs table for Bitcoin anchoring
-- Single-table model: one proof per attestation, standard .ots format
CREATE TABLE public.core_ots_proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_id uuid NOT NULL REFERENCES origin_attestations(origin_id),
  ots_proof bytea NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'anchored', 'failed')),
  bitcoin_block_height integer,
  anchored_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  upgraded_at timestamptz,
  UNIQUE(origin_id)
);

-- Performance indexes
CREATE INDEX idx_ots_proofs_status ON core_ots_proofs(status);
CREATE INDEX idx_ots_proofs_origin ON core_ots_proofs(origin_id);
CREATE INDEX idx_ots_proofs_pending_created ON core_ots_proofs(created_at) WHERE status = 'pending';

-- Immutability: only anchored proofs are protected
-- pending → anchored: allowed
-- pending → failed: allowed  
-- failed → pending (retry): allowed
-- anchored → anything: blocked
CREATE OR REPLACE FUNCTION public.prevent_anchored_proof_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'anchored' THEN
    RAISE EXCEPTION 'Cannot modify anchored proof';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER prevent_anchored_proof_update
  BEFORE UPDATE ON core_ots_proofs
  FOR EACH ROW EXECUTE FUNCTION prevent_anchored_proof_mutation();

CREATE TRIGGER prevent_anchored_proof_delete
  BEFORE DELETE ON core_ots_proofs
  FOR EACH ROW EXECUTE FUNCTION prevent_anchored_proof_mutation();

-- RLS: Service role only (worker access)
ALTER TABLE core_ots_proofs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only - ots proofs"
  ON core_ots_proofs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Public read access for proof downloads
CREATE POLICY "Public can read anchored proofs"
  ON core_ots_proofs
  FOR SELECT
  USING (status = 'anchored');

COMMENT ON TABLE core_ots_proofs IS 'Bitcoin-anchored OTS proofs for origin attestations. Standard .ots format, verifiable with opentimestamps-client.';