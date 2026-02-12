/**
 * Execute SQL Migration via Supabase REST API
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://anawatvgypmrpbmjfcht.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuYXdhdHZneXBtcnBibWpmY2h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODcwNDMwOSwiZXhwIjoyMDg0MjgwMzA5fQ.njigvMg4pdmKMtoWngrgNtw1c59JcM9K_aAaHv-ddwU';

// Read the SQL file
const sqlFile = path.join(__dirname, '..', 'supabase', 'FIX_MISSING_COLUMNS.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

// Split into individual statements
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

async function executeSql(statement) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      },
      body: JSON.stringify({ sql_query: statement })
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: text };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function main() {
  console.log('🔧 Executing SQL migration...\n');
  console.log(`Found ${statements.length} SQL statements\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (stmt.startsWith('SELECT')) {
      console.log(`[${i + 1}/${statements.length}] Skipping SELECT statement`);
      continue;
    }

    // Extract table name for display
    const match = stmt.match(/ALTER TABLE (\w+)/i);
    const table = match ? match[1] : 'unknown';

    process.stdout.write(`[${i + 1}/${statements.length}] ${table}... `);

    const result = await executeSql(stmt);
    if (result.success) {
      console.log('✅');
      success++;
    } else {
      console.log('❌', result.error?.substring(0, 50) || 'Failed');
      failed++;
    }
  }

  console.log(`\n📊 Results: ${success} succeeded, ${failed} failed`);
}

main().catch(console.error);
