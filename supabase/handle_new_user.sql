-- ============================================
-- Handle New User Trigger
-- ============================================
-- This trigger fires when a new user signs up via Supabase Auth.
-- It creates:
-- 1. A new organization for the user
-- 2. Links the user to the org in organization_users
-- 3. Creates a CRM user record in the users table
-- 4. Stores org_id in user metadata for easy access
-- ============================================

-- First, ensure the organization_users table exists
CREATE TABLE IF NOT EXISTS organization_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'manager', 'member'
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_organization_users_user_id ON organization_users(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_org_id ON organization_users(org_id);

-- Enable RLS on organization_users
ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own org memberships
CREATE POLICY IF NOT EXISTS "organization_users_own_access" ON organization_users
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- The Main Trigger Function
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  company_name TEXT;
  user_name TEXT;
BEGIN
  -- Extract metadata from the new user
  company_name := COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Organization');
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  -- Create organization
  INSERT INTO organizations (name, slug, plan, subscription_status)
  VALUES (
    company_name,
    LOWER(REGEXP_REPLACE(company_name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || SUBSTR(NEW.id::TEXT, 1, 8),
    'free',
    'active'
  )
  RETURNING id INTO new_org_id;

  -- Link user to org as owner
  INSERT INTO organization_users (org_id, user_id, role, active)
  VALUES (new_org_id, NEW.id, 'owner', true);

  -- Create CRM user record
  INSERT INTO users (org_id, name, email, role, avatar)
  VALUES (
    new_org_id,
    user_name,
    NEW.email,
    'admin',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id::TEXT
  );

  -- Store org_id in user metadata for easy access
  UPDATE auth.users SET raw_user_meta_data =
    raw_user_meta_data || jsonb_build_object('org_id', new_org_id)
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Grant necessary permissions
-- ============================================

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO anon;

-- Grant necessary permissions on tables
GRANT INSERT ON organizations TO authenticated;
GRANT INSERT ON organization_users TO authenticated;
GRANT INSERT ON users TO authenticated;
