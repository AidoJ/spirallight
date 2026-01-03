-- Add signature fields to sessions table
-- Run this in your Supabase SQL Editor

ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS client_signature TEXT,
ADD COLUMN IF NOT EXISTS therapist_signature TEXT;

-- Add comments for documentation
COMMENT ON COLUMN sessions.client_signature IS 'Base64 encoded signature image from client intake form';
COMMENT ON COLUMN sessions.therapist_signature IS 'Base64 encoded signature image from therapist when approving session';

