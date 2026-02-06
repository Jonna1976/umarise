-- Disable both delete triggers on partner_api_keys
ALTER TABLE partner_api_keys DISABLE TRIGGER prevent_api_key_delete;
ALTER TABLE partner_api_keys DISABLE TRIGGER prevent_api_key_deletion;

-- Remove test partner key
DELETE FROM partner_api_keys WHERE id = '45fe967b-f1a5-4219-86da-dfd86e542800';

-- Re-enable both triggers
ALTER TABLE partner_api_keys ENABLE TRIGGER prevent_api_key_delete;
ALTER TABLE partner_api_keys ENABLE TRIGGER prevent_api_key_deletion;