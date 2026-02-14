-- Add Gmail OAuth fields to organizations table for email sending

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS gmail_email TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS gmail_refresh_token TEXT; -- Should be encrypted in production

-- Add index for Gmail-enabled organizations
CREATE INDEX IF NOT EXISTS idx_organizations_gmail_email ON organizations(gmail_email) WHERE gmail_email IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN organizations.gmail_email IS 'Gmail account email address for sending invoices';
COMMENT ON COLUMN organizations.gmail_refresh_token IS 'OAuth 2.0 refresh token for Gmail API (should be encrypted)';
