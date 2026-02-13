-- Seed Currencies Table
-- Run this script to populate the currencies table with standard world currencies
-- Note: Replace 'YOUR_ORG_ID' with your actual organization ID

INSERT INTO currencies (org_id, iso_code, name, symbol, conversion_rate, decimal_places, is_active, is_corporate)
VALUES
  -- Replace with your org_id
  ('YOUR_ORG_ID', 'USD', 'US Dollar', '$', 1.00, 2, true, true),
  ('YOUR_ORG_ID', 'AUD', 'Australian Dollar', 'A$', 1.00, 2, true, false),
  ('YOUR_ORG_ID', 'EUR', 'Euro', '€', 1.00, 2, true, false),
  ('YOUR_ORG_ID', 'GBP', 'British Pound', '£', 1.00, 2, true, false),
  ('YOUR_ORG_ID', 'JPY', 'Japanese Yen', '¥', 1.00, 0, true, false),
  ('YOUR_ORG_ID', 'CAD', 'Canadian Dollar', 'C$', 1.00, 2, true, false),
  ('YOUR_ORG_ID', 'NZD', 'New Zealand Dollar', 'NZ$', 1.00, 2, true, false),
  ('YOUR_ORG_ID', 'CHF', 'Swiss Franc', 'Fr', 1.00, 2, true, false),
  ('YOUR_ORG_ID', 'CNY', 'Chinese Yuan', '¥', 1.00, 2, true, false),
  ('YOUR_ORG_ID', 'INR', 'Indian Rupee', '₹', 1.00, 2, true, false),
  ('YOUR_ORG_ID', 'SGD', 'Singapore Dollar', 'S$', 1.00, 2, true, false),
  ('YOUR_ORG_ID', 'HKD', 'Hong Kong Dollar', 'HK$', 1.00, 2, true, false),
  ('YOUR_ORG_ID', 'MXN', 'Mexican Peso', 'Mex$', 1.00, 2, true, false),
  ('YOUR_ORG_ID', 'BRL', 'Brazilian Real', 'R$', 1.00, 2, true, false),
  ('YOUR_ORG_ID', 'ZAR', 'South African Rand', 'R', 1.00, 2, true, false)
ON CONFLICT (org_id, iso_code) DO NOTHING;

-- Alternative: Use this query to seed currencies for the current demo org (00000000-0000-0000-0000-000000000001)
-- Uncomment the block below to use:

/*
INSERT INTO currencies (org_id, iso_code, name, symbol, conversion_rate, decimal_places, is_active, is_corporate)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'USD', 'US Dollar', '$', 1.00, 2, true, true),
  ('00000000-0000-0000-0000-000000000001', 'AUD', 'Australian Dollar', 'A$', 1.00, 2, true, false),
  ('00000000-0000-0000-0000-000000000001', 'EUR', 'Euro', '€', 1.00, 2, true, false),
  ('00000000-0000-0000-0000-000000000001', 'GBP', 'British Pound', '£', 1.00, 2, true, false),
  ('00000000-0000-0000-0000-000000000001', 'JPY', 'Japanese Yen', '¥', 1.00, 0, true, false),
  ('00000000-0000-0000-0000-000000000001', 'CAD', 'Canadian Dollar', 'C$', 1.00, 2, true, false),
  ('00000000-0000-0000-0000-000000000001', 'NZD', 'New Zealand Dollar', 'NZ$', 1.00, 2, true, false),
  ('00000000-0000-0000-0000-000000000001', 'CHF', 'Swiss Franc', 'Fr', 1.00, 2, true, false),
  ('00000000-0000-0000-0000-000000000001', 'CNY', 'Chinese Yuan', '¥', 1.00, 2, true, false),
  ('00000000-0000-0000-0000-000000000001', 'INR', 'Indian Rupee', '₹', 1.00, 2, true, false),
  ('00000000-0000-0000-0000-000000000001', 'SGD', 'Singapore Dollar', 'S$', 1.00, 2, true, false),
  ('00000000-0000-0000-0000-000000000001', 'HKD', 'Hong Kong Dollar', 'HK$', 1.00, 2, true, false),
  ('00000000-0000-0000-0000-000000000001', 'MXN', 'Mexican Peso', 'Mex$', 1.00, 2, true, false),
  ('00000000-0000-0000-0000-000000000001', 'BRL', 'Brazilian Real', 'R$', 1.00, 2, true, false),
  ('00000000-0000-0000-0000-000000000001', 'ZAR', 'South African Rand', 'R', 1.00, 2, true, false)
ON CONFLICT (org_id, iso_code) DO NOTHING;
*/
