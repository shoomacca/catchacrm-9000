/**
 * FULL SUPABASE AUDIT - Every table, every column
 * Outputs complete markdown for audit document
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://anawatvgypmrpbmjfcht.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuYXdhdHZneXBtcnBibWpmY2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MDQzMDksImV4cCI6MjA4NDI4MDMwOX0.69tc4MZjKiG1svlT77O0LTmxqUxpOUJIok1nF845X_U';

const supabase = createClient(supabaseUrl, supabaseKey);

// Exhaustive list of potential table names
const allPossibleTables = [
  // Core CRM
  'accounts', 'contacts', 'leads', 'deals', 'opportunities',
  'tasks', 'activities', 'notes', 'comments',

  // Communications
  'communications', 'emails', 'calls', 'sms', 'chat_messages',
  'conversations', 'messages', 'email_logs', 'sms_logs', 'call_logs',
  'email_templates', 'sms_templates', 'notification_templates',

  // Calendar & Events
  'calendar_events', 'events', 'appointments', 'bookings', 'meetings',
  'schedules', 'availabilities', 'time_slots',

  // Tickets & Support
  'tickets', 'ticket_messages', 'ticket_comments', 'support_tickets',
  'cases', 'incidents', 'issues',

  // Marketing
  'campaigns', 'campaign_members', 'campaign_activities',
  'inbound_forms', 'form_submissions', 'forms',
  'chat_widgets', 'calculators', 'landing_pages',
  'email_campaigns', 'marketing_lists', 'segments',

  // Sales
  'quotes', 'quote_items', 'proposals',
  'invoices', 'invoice_items', 'invoice_payments',
  'orders', 'order_items', 'order_lines',
  'subscriptions', 'subscription_items',
  'products', 'services', 'price_books', 'price_book_entries',
  'line_items', 'credit_notes', 'credit_note_items',

  // Payments & Finance
  'payments', 'payment_methods', 'payment_links',
  'bank_transactions', 'bank_accounts', 'bank_feeds',
  'expenses', 'expense_reports', 'expense_categories',
  'budgets', 'forecasts',
  'tax_rates', 'taxes', 'tax_codes',
  'currencies', 'exchange_rates',
  'refunds', 'chargebacks',

  // Field Operations
  'jobs', 'job_items', 'job_tasks', 'job_notes',
  'crews', 'crew_members', 'crew_assignments',
  'zones', 'territories', 'regions', 'areas',
  'routes', 'route_stops',
  'equipment', 'equipment_assignments', 'equipment_maintenance',
  'inventory_items', 'inventory_transactions', 'stock_levels',
  'warehouses', 'warehouse_locations', 'bins',
  'purchase_orders', 'po_items', 'po_receipts',
  'suppliers', 'vendors', 'vendor_contacts',

  // Reviews & Reputation
  'reviews', 'review_responses', 'review_requests',
  'referral_rewards', 'referrals', 'referral_codes',
  'testimonials', 'ratings',

  // Automation & Workflows
  'automation_workflows', 'workflow_runs', 'workflow_steps',
  'webhooks', 'webhook_logs', 'webhook_deliveries',
  'triggers', 'actions', 'conditions',
  'scheduled_tasks', 'cron_jobs',

  // Users & Permissions
  'users', 'user_profiles', 'profiles',
  'roles', 'permissions', 'role_permissions',
  'teams', 'team_members', 'departments',
  'organizations', 'org_members', 'org_settings',

  // Documents & Files
  'documents', 'files', 'attachments', 'media',
  'document_versions', 'file_versions',
  'folders', 'document_folders',

  // Templates & Config
  'industry_templates', 'templates', 'layouts',
  'custom_fields', 'field_definitions', 'field_sets',
  'pipelines', 'pipeline_stages', 'stages',
  'statuses', 'status_configs',

  // Audit & Logging
  'audit_log', 'audit_logs', 'audit_trail',
  'activity_logs', 'change_logs', 'history',
  'login_logs', 'access_logs', 'security_logs',

  // Notifications
  'notifications', 'notification_preferences', 'push_tokens',
  'alerts', 'reminders',

  // Analytics & Reports
  'reports', 'dashboards', 'widgets', 'kpis',
  'metrics', 'analytics', 'stats',

  // Integrations
  'integrations', 'integration_configs', 'connected_apps',
  'oauth_tokens', 'api_keys', 'api_logs',

  // E-commerce
  'carts', 'cart_items', 'checkout_sessions',
  'shipping_methods', 'shipping_zones',
  'discounts', 'coupons', 'promotions',

  // Additional
  'settings', 'configs', 'preferences',
  'tags', 'labels', 'categories',
  'addresses', 'locations', 'geo_data',
  'countries', 'states', 'cities', 'postcodes',
  'features', 'feature_flags',
  'migrations', 'schema_migrations',
  'sessions', 'tokens', 'refresh_tokens'
];

async function fullAudit() {
  console.log('# COMPLETE SUPABASE DATABASE AUDIT\n');
  console.log(`Generated: ${new Date().toISOString()}\n`);
  console.log('---\n');

  const existingTables = {};
  const emptyTables = [];
  let totalColumns = 0;

  // Test each table
  for (const table of [...new Set(allPossibleTables)]) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (!error) {
        if (data && data.length > 0) {
          const columns = Object.keys(data[0]);
          existingTables[table] = columns;
          totalColumns += columns.length;
        } else {
          // Table exists but is empty - try to get schema another way
          emptyTables.push(table);
          existingTables[table] = ['(empty - schema unknown)'];
        }
      }
    } catch (e) {
      // Table doesn't exist, skip
    }
  }

  const sortedTables = Object.keys(existingTables).sort();

  console.log(`## SUMMARY\n`);
  console.log(`| Metric | Value |`);
  console.log(`|--------|-------|`);
  console.log(`| Total Tables | ${sortedTables.length} |`);
  console.log(`| Tables with Data | ${sortedTables.length - emptyTables.length} |`);
  console.log(`| Empty Tables | ${emptyTables.length} |`);
  console.log(`| Total Columns | ${totalColumns} |`);
  console.log(`\n---\n`);

  console.log(`## ALL TABLES WITH COLUMNS\n`);

  sortedTables.forEach((table, index) => {
    const columns = existingTables[table];
    console.log(`### ${index + 1}. \`${table}\`\n`);
    console.log(`**Columns (${columns.length}):**\n`);
    console.log('| Column Name | Exists in DB |');
    console.log('|-------------|--------------|');
    columns.forEach(col => {
      console.log(`| \`${col}\` | ✅ |`);
    });
    console.log('\n');
  });

  // Output JSON for further processing
  console.log('\n---\n');
  console.log('## RAW JSON DATA\n');
  console.log('```json');
  console.log(JSON.stringify(existingTables, null, 2));
  console.log('```');
}

fullAudit().catch(console.error);
