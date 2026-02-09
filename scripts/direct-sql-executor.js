/**
 * Direct SQL Executor using PostgreSQL connection
 * Executes SQL files directly against Supabase PostgreSQL
 */

import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const projectRef = 'anawatvgypmrpbmjfcht';

console.log('🔌 Connecting to Supabase PostgreSQL...\n');

// Try different connection methods
async function tryConnection() {
  // Method 1: Try using service role key as password
  const connectionStrings = [
    // Supabase connection pooler (transaction mode)
    `postgresql://postgres.${projectRef}:${process.env.SUPABASE_SERVICE_ROLE_KEY}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
    // Supabase connection pooler (session mode)
    `postgresql://postgres.${projectRef}:${process.env.SUPABASE_SERVICE_ROLE_KEY}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
    // Direct connection (requires DB password - will likely fail)
    `postgresql://postgres:[PASSWORD]@db.${projectRef}.supabase.co:5432/postgres`
  ];

  for (let i = 0; i < connectionStrings.length; i++) {
    const connStr = connectionStrings[i];

    if (connStr.includes('[PASSWORD]')) {
      console.log(`Skipping method ${i + 1} - requires database password\n`);
      continue;
    }

    console.log(`Attempting connection method ${i + 1}...`);

    const client = new Client({
      connectionString: connStr,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 10000
    });

    try {
      await client.connect();
      console.log('✅ Connected successfully!\n');

      // Test the connection
      const result = await client.query('SELECT current_database(), current_user');
      console.log('Database:', result.rows[0].current_database);
      console.log('User:', result.rows[0].current_user);
      console.log('');

      return client;
    } catch (error) {
      console.log(`❌ Failed: ${error.message}\n`);
      try {
        await client.end();
      } catch (e) {
        // Ignore
      }
    }
  }

  throw new Error('Could not establish PostgreSQL connection with any method');
}

async function executeSQL(client, sql) {
  try {
    const result = await client.query(sql);
    return result;
  } catch (error) {
    throw new Error(`SQL execution failed: ${error.message}`);
  }
}

async function main() {
  let client;

  try {
    // Try to connect
    client = await tryConnection();

    console.log('═══════════════════════════════════════════════\n');
    console.log('🗑️  DROPPING ALL TABLES\n');

    // Read and execute drop SQL
    const dropSQL = fs.readFileSync(
      path.resolve(__dirname, '../supabase/00_drop_all_tables.sql'),
      'utf-8'
    );

    console.log('Executing drop statements...');
    await client.query(dropSQL);
    console.log('✅ All tables dropped\n');

    console.log('═══════════════════════════════════════════════\n');
    console.log('🏗️  CREATING FRESH SCHEMA\n');

    // Read and execute schema SQL
    const schemaSQL = fs.readFileSync(
      path.resolve(__dirname, '../supabase/schema_from_frontend.sql'),
      'utf-8'
    );

    console.log('Executing schema creation...');
    await client.query(schemaSQL);
    console.log('✅ Schema created successfully\n');

    console.log('═══════════════════════════════════════════════\n');
    console.log('✅ DATABASE RESET COMPLETE!\n');
    console.log('Now loading Matrix data...\n');

    // Close connection
    await client.end();

    // Now load the data
    console.log('🎭 Loading Matrix mock data...\n');

    // Import and run the data loader
    const { default: loadData } = await import('./load-matrix-data.js');
    await loadData();

    console.log('\n═══════════════════════════════════════════════');
    console.log('🎉 FRESH START COMPLETE!\n');
    console.log('✅ Tables reset');
    console.log('✅ Schema created');
    console.log('✅ Matrix data loaded\n');
    console.log('Next: Open http://localhost:3002\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nThis likely means:');
    console.error('  1. Connection string is incorrect');
    console.error('  2. Service role key cannot be used as DB password');
    console.error('  3. Database password is required\n');

    console.error('═══════════════════════════════════════════════\n');
    console.error('SUPABASE SECURITY LIMITATION:\n');
    console.error('DDL operations require one of:\n');
    console.error('  1. Supabase Dashboard SQL Editor (web UI)');
    console.error('  2. Database password for direct psql connection');
    console.error('  3. Supabase CLI (supabase db push)\n');
    console.error('The service role API key only works for REST API,');
    console.error('not for direct PostgreSQL connections.\n');
    console.error('═══════════════════════════════════════════════\n');

    process.exit(1);
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (e) {
        // Ignore
      }
    }
  }
}

main();
