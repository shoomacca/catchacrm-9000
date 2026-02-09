const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: 'postgresql://postgres.anawatvgypmrpbmjfcht:3uC0J5DUgiDDCMOe@aws-1-ap-south-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function audit() {
  await client.connect();

  let output = '# SUPABASE DATABASE SCHEMA - COMPLETE AUDIT\n';
  output += `Generated: ${new Date().toISOString()}\n\n`;

  // Get all tables
  const { rows: tables } = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  output += `## Summary\n`;
  output += `Total Tables: ${tables.length}\n\n`;
  output += `---\n\n`;

  let tableIndex = 1;

  for (const table of tables) {
    const tableName = table.table_name;
    console.log(`[${tableIndex}/${tables.length}] ${tableName}`);

    // Get columns
    const { rows: columns } = await client.query(`
      SELECT
        column_name,
        data_type,
        udt_name,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position
    `, [tableName]);

    // Get primary key
    const { rows: pk } = await client.query(`
      SELECT a.attname as column_name
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = $1::regclass AND i.indisprimary
    `, [tableName]);
    const pkColumns = pk.map(p => p.column_name);

    // Get foreign keys
    const { rows: fks } = await client.query(`
      SELECT
        kcu.column_name,
        ccu.table_name AS foreign_table,
        ccu.column_name AS foreign_column
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name = $1 AND tc.constraint_type = 'FOREIGN KEY'
    `, [tableName]);
    const fkMap = {};
    fks.forEach(fk => {
      fkMap[fk.column_name] = `${fk.foreign_table}.${fk.foreign_column}`;
    });

    // Get row count
    let rowCount = 0;
    try {
      const { rows: count } = await client.query(`SELECT COUNT(*) FROM "${tableName}"`);
      rowCount = parseInt(count[0].count);
    } catch (e) {}

    output += `## ${tableIndex}. ${tableName}\n`;
    output += `Rows: ${rowCount}\n\n`;
    output += `| # | Column | Type | Nullable | Default | FK → |\n`;
    output += `|---|--------|------|----------|---------|------|\n`;

    let colIndex = 1;
    for (const col of columns) {
      let typeStr = col.data_type;
      if (col.data_type === 'character varying' && col.character_maximum_length) {
        typeStr = `varchar(${col.character_maximum_length})`;
      } else if (col.data_type === 'ARRAY') {
        typeStr = `${col.udt_name}[]`;
      } else if (col.data_type === 'USER-DEFINED') {
        typeStr = col.udt_name;
      }

      const nullable = col.is_nullable === 'YES' ? '✓' : '✗';
      const isPK = pkColumns.includes(col.column_name) ? '🔑 ' : '';
      const defaultVal = col.column_default ? col.column_default.substring(0, 30) : '-';
      const fkRef = fkMap[col.column_name] || '-';

      output += `| ${colIndex} | ${isPK}${col.column_name} | ${typeStr} | ${nullable} | ${defaultVal} | ${fkRef} |\n`;
      colIndex++;
    }

    output += `\n`;
    tableIndex++;
  }

  // Write to file
  fs.writeFileSync('SUPABASE_SCHEMA_FULL.md', output);
  console.log('\nWritten to SUPABASE_SCHEMA_FULL.md');
  console.log(`Total tables: ${tables.length}`);

  await client.end();
}

audit().catch(console.error);
