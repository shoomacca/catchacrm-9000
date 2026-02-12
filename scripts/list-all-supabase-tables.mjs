/**
 * List ALL tables and columns from Supabase
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://anawatvgypmrpbmjfcht.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuYXdhdHZneXBtcnBibWpmY2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MDQzMDksImV4cCI6MjA4NDI4MDMwOX0.69tc4MZjKiG1svlT77O0LTmxqUxpOUJIok1nF845X_U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAllTables() {
  console.log('Fetching all tables from Supabase...\n');

  // Query information_schema for all tables
  const { data: tables, error } = await supabase
    .rpc('get_all_tables_and_columns');

  if (error) {
    console.log('RPC not available, trying direct query...');

    // Try to get table list by attempting to select from known tables
    const knownTables = [
      'accounts', 'audit_log', 'automation_workflows', 'bank_transactions',
      'calculators', 'calendar_events', 'campaigns', 'chat_messages',
      'chat_widgets', 'communications', 'contacts', 'conversations',
      'crews', 'deals', 'documents', 'equipment', 'expenses',
      'inbound_forms', 'industry_templates', 'inventory_items', 'invoices',
      'jobs', 'leads', 'notifications', 'organizations', 'payments',
      'products', 'purchase_orders', 'quotes', 'referral_rewards',
      'reviews', 'services', 'subscriptions', 'tasks', 'tickets',
      'users', 'warehouses', 'webhooks', 'zones',
      // Additional possible tables
      'profiles', 'user_profiles', 'settings', 'org_settings',
      'attachments', 'files', 'media', 'images',
      'notes', 'comments', 'activities', 'activity_log',
      'tags', 'labels', 'categories',
      'pipelines', 'pipeline_stages', 'stages',
      'email_templates', 'sms_templates', 'templates',
      'workflows', 'workflow_runs', 'workflow_logs',
      'integrations', 'integration_configs',
      'api_keys', 'tokens', 'sessions',
      'reports', 'dashboards', 'widgets',
      'forms', 'form_submissions', 'submissions',
      'customers', 'vendors', 'suppliers',
      'orders', 'order_items', 'line_items',
      'payments_history', 'payment_methods',
      'addresses', 'locations',
      'roles', 'permissions', 'user_roles',
      'teams', 'team_members',
      'projects', 'project_tasks',
      'milestones', 'goals',
      'custom_fields', 'field_definitions',
      'audit_trails', 'change_logs',
      'email_logs', 'sms_logs', 'call_logs',
      'appointments', 'bookings', 'schedules',
      'assets', 'asset_tracking',
      'stock', 'stock_movements', 'inventory_transactions',
      'credits', 'credit_notes',
      'tax_rates', 'taxes',
      'currencies', 'exchange_rates',
      'countries', 'states', 'cities',
      'notification_preferences', 'user_settings',
      'feature_flags', 'features',
      'subscriptions_history', 'billing_history',
      'coupons', 'discounts', 'promotions'
    ];

    const existingTables = [];
    const tableColumns = {};

    for (const table of knownTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(0);

        if (!error) {
          existingTables.push(table);
          // Get column info from the response
          // We can't easily get columns without data, so we'll try with 1 row
          const { data: sample } = await supabase
            .from(table)
            .select('*')
            .limit(1);

          if (sample && sample.length > 0) {
            tableColumns[table] = Object.keys(sample[0]);
          } else {
            tableColumns[table] = ['(empty table - columns unknown)'];
          }
        }
      } catch (e) {
        // Table doesn't exist
      }
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`  SUPABASE TABLES FOUND: ${existingTables.length}`);
    console.log(`${'='.repeat(70)}\n`);

    existingTables.sort().forEach((table, i) => {
      console.log(`${i + 1}. ${table}`);
      if (tableColumns[table]) {
        console.log(`   Columns: ${tableColumns[table].join(', ')}`);
      }
      console.log('');
    });

    // Output as markdown
    console.log('\n\n--- MARKDOWN OUTPUT ---\n');
    console.log('| # | Table Name | Column Count |');
    console.log('|---|------------|--------------|');
    existingTables.forEach((table, i) => {
      const colCount = tableColumns[table] ? tableColumns[table].length : 0;
      console.log(`| ${i + 1} | \`${table}\` | ${colCount} |`);
    });

    return { existingTables, tableColumns };
  }

  return tables;
}

listAllTables().catch(console.error);
