-- Add business details fields to organizations table for invoicing
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS abn TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS address_line1 TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS address_line2 TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS postcode TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Australia';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS bank_bsb TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS bank_account_name TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS invoice_prefix TEXT DEFAULT 'INV';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS invoice_next_number INTEGER DEFAULT 1;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS default_tax_rate DECIMAL(5,2) DEFAULT 10.00;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS default_payment_terms INTEGER DEFAULT 30;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS invoice_notes TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS invoice_footer TEXT;

-- Add comment for documentation
COMMENT ON COLUMN organizations.abn IS 'Australian Business Number (11 digits)';
COMMENT ON COLUMN organizations.bank_bsb IS 'Bank State Branch number (XXX-XXX format)';
COMMENT ON COLUMN organizations.default_tax_rate IS 'Default GST/tax rate for invoices (10% in Australia)';
COMMENT ON COLUMN organizations.default_payment_terms IS 'Default payment terms in days (e.g., 30 for NET 30)';
