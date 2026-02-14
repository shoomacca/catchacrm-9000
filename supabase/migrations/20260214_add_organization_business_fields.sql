-- Add business details fields to organizations table for invoicing

-- Company details
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS abn TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Address
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS address_line1 TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS address_line2 TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS postcode TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Australia';

-- Contact details
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS website TEXT;

-- Bank details
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS bank_bsb TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS bank_account_name TEXT;

-- Invoice settings
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS invoice_prefix TEXT DEFAULT 'INV';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS invoice_next_number INTEGER DEFAULT 1;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS default_tax_rate DECIMAL(5,2) DEFAULT 10.00;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS default_payment_terms INTEGER DEFAULT 30;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS invoice_notes TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS invoice_footer TEXT;

-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_organizations_abn ON organizations(abn);

-- Add comments for documentation
COMMENT ON COLUMN organizations.abn IS 'Australian Business Number (11 digits)';
COMMENT ON COLUMN organizations.bank_bsb IS 'Bank State Branch code (XXX-XXX format)';
COMMENT ON COLUMN organizations.default_tax_rate IS 'Default GST/tax rate percentage (e.g., 10.00 for 10%)';
COMMENT ON COLUMN organizations.default_payment_terms IS 'Default payment terms in days (e.g., 30 for Net 30)';
COMMENT ON COLUMN organizations.invoice_prefix IS 'Prefix for invoice numbers (e.g., INV, TAX)';
COMMENT ON COLUMN organizations.invoice_next_number IS 'Next sequential number for invoice auto-numbering';
