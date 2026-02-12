/**
 * Run Missing Tables Migration
 * Creates the 5 new tables for modules that were using mock data
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://anawatvgypmrpbmjfcht.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuYXdhdHZneXBtcnBibWpmY2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MDQzMDksImV4cCI6MjA4NDI4MDMwOX0.69tc4MZjKiG1svlT77O0LTmxqUxpOUJIok1nF845X_U';

const supabase = createClient(supabaseUrl, supabaseKey);

// Tables to create (without RLS policies which need service role)
const tables = [
  {
    name: 'tactical_queue',
    sql: `
      CREATE TABLE IF NOT EXISTS tactical_queue (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        org_id UUID NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT NOT NULL DEFAULT 'medium',
        priority_score INTEGER DEFAULT 50,
        status TEXT NOT NULL DEFAULT 'open',
        assignee_id UUID,
        sla_deadline TIMESTAMPTZ,
        escalation_level INTEGER DEFAULT 0,
        related_to_type TEXT,
        related_to_id UUID,
        related_to_name TEXT,
        notes JSONB DEFAULT '[]'::jsonb,
        resolved_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        created_by UUID,
        owner_id UUID
      );
    `
  },
  {
    name: 'warehouse_locations',
    sql: `
      CREATE TABLE IF NOT EXISTS warehouse_locations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        org_id UUID NOT NULL,
        warehouse_id UUID,
        name TEXT NOT NULL,
        code TEXT,
        type TEXT DEFAULT 'bin',
        description TEXT,
        capacity INTEGER,
        current_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        is_pickable BOOLEAN DEFAULT true,
        is_receivable BOOLEAN DEFAULT true,
        parent_location_id UUID,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        created_by UUID,
        owner_id UUID
      );
    `
  },
  {
    name: 'dispatch_alerts',
    sql: `
      CREATE TABLE IF NOT EXISTS dispatch_alerts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        org_id UUID NOT NULL,
        title TEXT NOT NULL,
        message TEXT,
        type TEXT NOT NULL DEFAULT 'info',
        related_to_type TEXT,
        related_to_id UUID,
        is_acknowledged BOOLEAN DEFAULT false,
        acknowledged_by UUID,
        acknowledged_at TIMESTAMPTZ,
        expires_at TIMESTAMPTZ,
        is_dismissed BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        created_by UUID,
        owner_id UUID
      );
    `
  },
  {
    name: 'rfqs',
    sql: `
      CREATE TABLE IF NOT EXISTS rfqs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        org_id UUID NOT NULL,
        rfq_number TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        supplier_ids UUID[],
        line_items JSONB DEFAULT '[]'::jsonb,
        issue_date DATE,
        due_date DATE,
        valid_until DATE,
        purchase_order_id UUID,
        job_id UUID,
        winning_supplier_id UUID,
        awarded_at TIMESTAMPTZ,
        total_value NUMERIC(12,2),
        notes TEXT,
        terms TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        created_by UUID,
        owner_id UUID
      );
    `
  },
  {
    name: 'supplier_quotes',
    sql: `
      CREATE TABLE IF NOT EXISTS supplier_quotes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        org_id UUID NOT NULL,
        quote_number TEXT,
        rfq_id UUID,
        supplier_id UUID NOT NULL,
        status TEXT NOT NULL DEFAULT 'received',
        line_items JSONB DEFAULT '[]'::jsonb,
        subtotal NUMERIC(12,2),
        tax_total NUMERIC(12,2),
        total NUMERIC(12,2),
        received_date DATE,
        valid_until DATE,
        evaluation_score INTEGER,
        evaluation_notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        created_by UUID,
        owner_id UUID
      );
    `
  }
];

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);

    return !error;
  } catch (e) {
    return false;
  }
}

async function runMigration() {
  console.log('='.repeat(60));
  console.log('  MISSING TABLES MIGRATION');
  console.log('='.repeat(60));
  console.log('');

  const results = [];

  for (const table of tables) {
    const exists = await checkTableExists(table.name);

    if (exists) {
      console.log(`✅ ${table.name} - Already exists`);
      results.push({ table: table.name, status: 'exists' });
    } else {
      console.log(`⚠️  ${table.name} - Does NOT exist`);
      console.log(`   To create this table, run the SQL in Supabase Dashboard:`);
      console.log(`   supabase/MISSING_TABLES_MIGRATION.sql`);
      results.push({ table: table.name, status: 'missing' });
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('  SUMMARY');
  console.log('='.repeat(60));

  const existing = results.filter(r => r.status === 'exists').length;
  const missing = results.filter(r => r.status === 'missing').length;

  console.log(`Tables existing: ${existing}`);
  console.log(`Tables missing:  ${missing}`);

  if (missing > 0) {
    console.log('');
    console.log('⚠️  MANUAL ACTION REQUIRED:');
    console.log('   1. Go to Supabase Dashboard → SQL Editor');
    console.log('   2. Run: supabase/MISSING_TABLES_MIGRATION.sql');
    console.log('   3. This requires service_role key for full migration');
  }

  return results;
}

runMigration().catch(console.error);
