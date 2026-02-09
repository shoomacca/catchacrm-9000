-- ============================================
-- Seed Demo Organization
-- ============================================
-- Ensures the demo organization exists in the database.
-- This org is used for demo mode when users aren't authenticated.
-- Demo Org ID: 00000000-0000-0000-0000-000000000001
-- ============================================

-- Insert demo organization (skip if already exists)
INSERT INTO organizations (id, name, slug, plan, subscription_status, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Organization',
  'demo',
  'enterprise',
  'active',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create a demo user for the demo organization
INSERT INTO users (id, org_id, name, email, role, avatar, created_at, updated_at, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Demo User',
  'demo@catchacrm.com',
  'admin',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
  NOW(),
  NOW(),
  'system'
) ON CONFLICT (id) DO NOTHING;

-- Verify demo org was created
SELECT id, name, slug, plan, subscription_status
FROM organizations
WHERE id = '00000000-0000-0000-0000-000000000001';
