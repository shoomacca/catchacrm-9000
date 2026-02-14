-- Add payment token to invoices for secure public payment links

-- Add payment_token column with UUID default
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_token UUID DEFAULT gen_random_uuid();

-- Create unique index for fast lookups and to ensure uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_payment_token ON invoices(payment_token);

-- Add comment for documentation
COMMENT ON COLUMN invoices.payment_token IS 'Secure UUID token for public payment link access (no auth required)';

-- Backfill existing invoices with payment tokens (if any exist without tokens)
UPDATE invoices SET payment_token = gen_random_uuid() WHERE payment_token IS NULL;

-- Make payment_token NOT NULL after backfill
ALTER TABLE invoices ALTER COLUMN payment_token SET NOT NULL;
