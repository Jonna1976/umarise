-- Phase 1: Add user_id column for authenticated users
ALTER TABLE pages ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE pages ADD COLUMN IF NOT EXISTS device_fingerprint_hash TEXT;

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages(user_id);

-- Phase 3: Witnesses table
CREATE TABLE IF NOT EXISTS witnesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) NOT NULL,
  witness_email TEXT NOT NULL DEFAULT '',
  witness_confirmed_at TIMESTAMPTZ,
  confirmation_hash TEXT,
  verification_token TEXT UNIQUE,
  token_expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  ots_status TEXT DEFAULT 'pending',
  ots_proof BYTEA,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE witnesses ENABLE ROW LEVEL SECURITY;

-- Makers can see witnesses for their marks
CREATE POLICY "Makers see own witnesses"
  ON witnesses FOR SELECT
  USING (page_id IN (SELECT id FROM pages WHERE user_id = auth.uid()));

-- Anyone can insert a witness record (via verification token flow)
CREATE POLICY "Anyone can create witness via verification"
  ON witnesses FOR INSERT
  WITH CHECK (true);

-- Public can update witness (confirm) via valid, non-expired token
CREATE POLICY "Anyone confirms via valid token"
  ON witnesses FOR UPDATE
  USING (
    verification_token IS NOT NULL 
    AND token_expires_at > now()
  );

-- RLS for pages: Users read own pages via user_id
-- Keep existing device_user_id policy for legacy access
CREATE POLICY "Users read own pages via user_id"
  ON pages FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own pages
CREATE POLICY "Users update own pages via user_id"
  ON pages FOR UPDATE
  USING (auth.uid() = user_id);