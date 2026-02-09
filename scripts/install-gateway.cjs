
/**
 * NEW GENESIS Gateway Installation Script
 *
 * Purpose: Automates MCP server setup for Claude Code or OpenCode
 * Usage: node scripts/install-gateway.js [claude-code|opencode]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const ENVIRONMENT = process.argv[2] || 'claude-code';
const WEBHOOK_URL = process.env.GENESIS_WEBHOOK_URL || 'https://ai.bsbsbs.au/webhook/genesis-update';

console.log('🚀 NEW GENESIS n8n Gateway Installation\n');
console.log(`Environment: ${ENVIRONMENT}`);
console.log(`Webhook URL: ${WEBHOOK_URL}\n`);

// Step 1: Install npm dependencies
console.log('📦 Installing dependencies in plugins/...');
try {
  execSync('npm install', {
    cwd: path.join(__dirname, '..', 'plugins'),
    stdio: 'inherit'
  });
  console.log('✅ Dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Step 2: Get absolute path to n8n-gateway.js
const gatewayPath = path.resolve(__dirname, '..', 'plugins', 'n8n-gateway.js');
console.log(`📍 Gateway path: ${gatewayPath}\n`);

// Step 3: Configure based on environment
if (ENVIRONMENT === 'claude-code') {
  console.log('⚙️  Configuring for Claude Code...');

  const homeDir = os.homedir();
  const claudeConfigDir = path.join(homeDir, '.claude');
  const mcpConfigPath = path.join(claudeConfigDir, 'mcp.json');

  // Create .claude directory if it doesn't exist
  if (!fs.existsSync(claudeConfigDir)) {
    fs.mkdirSync(claudeConfigDir, { recursive: true });
    console.log(`  Created ${claudeConfigDir}`);
  }

  // Read existing config or create new one
  let mcpConfig = { mcpServers: {} };
  if (fs.existsSync(mcpConfigPath)) {
    try {
      mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
    } catch {
      console.log('  ⚠️  Existing mcp.json is invalid, creating new config');
    }
  }

  // Add genesis-gateway to config
  mcpConfig.mcpServers = mcpConfig.mcpServers || {};
  mcpConfig.mcpServers['genesis-gateway'] = {
    command: 'node',
    args: [gatewayPath],
    env: {
      GENESIS_WEBHOOK_URL: WEBHOOK_URL
    }
  };

  // Write config
  fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2));
  console.log(`✅ Updated ${mcpConfigPath}`);
  console.log('\n⚠️  Restart Claude Code to load the MCP server');

} else if (ENVIRONMENT === 'opencode') {
  console.log('⚙️  Configuring for OpenCode...');
  console.log('\nAdd this to your project\'s opencode.json:\n');
  console.log(JSON.stringify({
    mcp: {
      'genesis-gateway': {
        command: 'node',
        args: [gatewayPath],
        env: {
          GENESIS_WEBHOOK_URL: WEBHOOK_URL
        }
      }
    }
  }, null, 2));
  console.log('\n');

} else {
  console.error('❌ Invalid environment. Use: claude-code or opencode');
  process.exit(1);
}

// Step 4: Instructions
console.log('\n📋 Next Steps:');
console.log('  1. Test the connection:');
console.log(`     node ${path.join(__dirname, 'test-gateway.js')} start_shard ANT-001`);
console.log('\n  2. Verify n8n workflow is active:');
console.log(`     ${WEBHOOK_URL}`);
console.log('\n  3. Run a Genesis project and use the tools:');
console.log('     start_shard({ shardId: "M01_01" })');
console.log('     complete_shard({ shardId: "M01_01", notes: "Done" })');
console.log('\n✨ Installation complete!');
