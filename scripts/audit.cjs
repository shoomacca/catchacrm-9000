/**
 * GENESIS v1.1 - System Audit Script
 *
 * Purpose: Health check for Genesis v1.1 components
 *
 * Checks:
 * 1. Shard files vs progress.json consistency
 * 2. Linear task mappings in PROJECT_IDS.json
 * 3. n8n Gateway reachability
 * 4. Required dependencies installed
 * 5. Environment variables configured
 *
 * Usage: npm run audit
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}`),
};

let issueCount = 0;

function listShardFiles(baseDir, currentDir = '') {
  const targetDir = path.join(baseDir, currentDir);
  if (!fs.existsSync(targetDir)) return [];

  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  const files = [];

  entries.forEach((entry) => {
    const entryPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listShardFiles(baseDir, entryPath));
      return;
    }
    if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(entryPath.replace(/\\/g, '/'));
    }
  });

  return files;
}

function extractShardIdFromPath(shardPath) {
  const match = shardPath.match(/(M\d+_\d+)/);
  if (match) return match[1];
  return shardPath.replace(/\.md$/, '').replace(/\//g, '_');
}

/**
 * Check if shards directory exists and has files
 */
function checkShardsDirectory() {
  log.section('📁 Checking Shards Directory');

  const shardsDir = path.resolve(process.cwd(), '.antigravity', 'shards');

  if (!fs.existsSync(shardsDir)) {
    log.warning('Shards directory not found: .antigravity/shards/');
    log.info('This is expected if no project has been initialized yet.');
    return { exists: false, shards: [] };
  }

  const files = listShardFiles(shardsDir);
  log.success(`Found ${files.length} shard files`);

  return { exists: true, shards: files };
}

/**
 * Check if progress.json exists and is valid
 */
function checkProgressFile() {
  log.section('📊 Checking Progress File');

  const progressPath = path.resolve(process.cwd(), '.antigravity', 'status', 'progress.json');

  if (!fs.existsSync(progressPath)) {
    log.warning('progress.json not found: .antigravity/status/progress.json');
    log.info('This is expected if no project has been initialized yet.');
    return { exists: false, data: null };
  }

  try {
    const data = JSON.parse(fs.readFileSync(progressPath, 'utf8'));
    log.success('progress.json is valid JSON');

    if (data.milestones) {
      const totalShards = data.milestones.reduce((sum, m) => sum + m.shards.length, 0);
      const completed = data.milestones.reduce((sum, m) =>
        sum + m.shards.filter(s => s.status === 'complete').length, 0);

      log.info(`Total shards: ${totalShards}`);
      log.info(`Completed: ${completed}`);
      log.info(`Pending: ${totalShards - completed}`);
    }

    return { exists: true, data };
  } catch (error) {
    log.error(`Invalid progress.json: ${error.message}`);
    issueCount++;
    return { exists: true, data: null };
  }
}

/**
 * Check if PROJECT_IDS.json exists and has Linear mappings
 */
function checkProjectIds() {
  log.section('🔗 Checking PROJECT_IDS.json');

  const antigravityPath = path.resolve(process.cwd(), '.antigravity', 'PROJECT_IDS.json');
  const projectIdsPath = path.resolve(process.cwd(), '.genesis', 'project_ids.json');
  const altPath = path.resolve(process.cwd(), '.genesis', 'PROJECT_IDS.json');

  let finalPath = null;
  if (fs.existsSync(antigravityPath)) {
    finalPath = antigravityPath;
  } else if (fs.existsSync(projectIdsPath)) {
    finalPath = projectIdsPath;
  } else if (fs.existsSync(altPath)) {
    finalPath = altPath;
  }

  if (!finalPath) {
    log.warning('PROJECT_IDS.json not found in .genesis/');
    log.info('Run: node scripts/indiana.js to create GitHub/Linear/Vercel projects');
    return { exists: false, data: null };
  }

  try {
    const data = JSON.parse(fs.readFileSync(finalPath, 'utf8'));
    log.success('PROJECT_IDS.json found and valid');

    if (data.tasks) {
      const taskCount = Object.keys(data.tasks).length;
      log.info(`Linear task mappings: ${taskCount}`);

      // Check for ANT-### identifiers
      const hasLinearIds = Object.values(data.tasks).some(t => t.linearIdentifier);
      if (hasLinearIds) {
        log.success('Linear identifiers (ANT-###) present');
      } else {
        log.warning('No Linear identifiers found in task mappings');
        issueCount++;
      }
    } else {
      log.warning('No task mappings found in PROJECT_IDS.json');
      issueCount++;
    }

    return { exists: true, data };
  } catch (error) {
    log.error(`Invalid PROJECT_IDS.json: ${error.message}`);
    issueCount++;
    return { exists: true, data: null };
  }
}

/**
 * Cross-check shards vs progress.json vs PROJECT_IDS.json
 */
function crossCheckShards(shardFiles, progressData, projectIdsData) {
  log.section('🔍 Cross-Checking Shard Consistency');

  if (!shardFiles.length || !progressData || !projectIdsData) {
    log.info('Skipping consistency check (missing data)');
    return;
  }

  // Get all shard IDs from progress.json
  const progressShardIds = new Set();
  const progressShardFiles = new Set();
  progressData.milestones?.forEach(m => {
    m.shards.forEach(s => {
      if (s.id) {
        progressShardIds.add(s.id);
      }
      if (s.file) {
        progressShardFiles.add(s.file);
        if (!s.id) {
          progressShardIds.add(extractShardIdFromPath(s.file));
        }
      }
    });
  });

  // Get all shard IDs from PROJECT_IDS.json
  const linearShards = new Set([...
    Object.keys(projectIdsData.tasks || {}),
    ...Object.keys(projectIdsData.shards || {})
  ]);

  // Get shard IDs from filenames
  const fileShardIds = new Set(shardFiles.map(extractShardIdFromPath));
  const shardFilePaths = new Set(shardFiles);

  log.info(`Shard files: ${shardFilePaths.size}`);
  log.info(`progress.json shard IDs: ${progressShardIds.size}`);
  log.info(`PROJECT_IDS.json entries: ${linearShards.size}`);

  // Find mismatches
  let mismatches = 0;

  // Shards in files but not in progress.json
  shardFilePaths.forEach(shard => {
    if (!progressShardFiles.has(shard)) {
      log.warning(`Shard file exists but not in progress.json: ${shard}`);
      mismatches++;
    }
  });

  // Shards in progress.json but no file
  progressShardFiles.forEach(shard => {
    if (!shardFilePaths.has(shard)) {
      log.warning(`Shard in progress.json but no file: ${shard}`);
      mismatches++;
    }
  });

  // Shards without Linear task ID
  progressShardIds.forEach(shard => {
    if (!linearShards.has(shard)) {
      log.warning(`Shard has no Linear task mapping: ${shard}`);
      mismatches++;
    }
  });

  if (mismatches === 0) {
    log.success('All shards are consistent across files, progress.json, and PROJECT_IDS.json');
  } else {
    log.error(`Found ${mismatches} consistency issues`);
    issueCount += mismatches;
  }
}

/**
 * Check if n8n webhook is reachable
 */
async function checkWebhookReachability() {
  log.section('🌐 Checking n8n Webhook');

  const webhookUrl = process.env.GENESIS_WEBHOOK_URL;

  if (!webhookUrl) {
    log.warning('GENESIS_WEBHOOK_URL not set in environment');
    log.info('Set: export GENESIS_WEBHOOK_URL="https://your-n8n.app/webhook/..."');
    return;
  }

  log.info(`Testing webhook: ${webhookUrl}`);

  return new Promise((resolve) => {
    try {
      const url = new URL(webhookUrl);
      const protocol = url.protocol === 'https:' ? https : http;

      const testPayload = JSON.stringify({
        action: 'health_check',
        source: 'audit.js',
        timestamp: new Date().toISOString()
      });

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(testPayload)
        }
      };

      const req = protocol.request(webhookUrl, options, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          log.success(`Webhook reachable (HTTP ${res.statusCode})`);
        } else {
          log.warning(`Webhook responded with HTTP ${res.statusCode}`);
        }
        resolve();
      });

      req.on('error', (error) => {
        log.error(`Webhook unreachable: ${error.message}`);
        issueCount++;
        resolve();
      });

      req.setTimeout(5000, () => {
        log.error('Webhook timeout (5 seconds)');
        issueCount++;
        req.destroy();
        resolve();
      });

      req.write(testPayload);
      req.end();
    } catch (error) {
      log.error(`Invalid webhook URL: ${error.message}`);
      issueCount++;
      resolve();
    }
  });
}

/**
 * Check if required dependencies are installed
 */
function checkDependencies() {
  log.section('📦 Checking Dependencies');

  const packageJsonPath = path.resolve(__dirname, '..', 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    log.error('package.json not found');
    issueCount++;
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = packageJson.dependencies || {};

  const required = ['node-schedule', 'axios'];

  required.forEach(dep => {
    if (deps[dep]) {
      log.success(`${dep} installed (${deps[dep]})`);
    } else {
      log.error(`${dep} NOT installed`);
      issueCount++;
    }
  });

  // Check if MCP SDK is in plugins/package.json
  const pluginPackagePath = path.resolve(__dirname, '..', 'plugins', 'package.json');
  if (fs.existsSync(pluginPackagePath)) {
    const pluginPackage = JSON.parse(fs.readFileSync(pluginPackagePath, 'utf8'));
    const pluginDeps = pluginPackage.dependencies || {};

    if (pluginDeps['@modelcontextprotocol/sdk']) {
      log.success(`@modelcontextprotocol/sdk installed in plugins/ (${pluginDeps['@modelcontextprotocol/sdk']})`);
    } else {
      log.error('@modelcontextprotocol/sdk NOT installed in plugins/');
      issueCount++;
    }
  } else {
    log.warning('plugins/package.json not found');
  }
}

/**
 * Check environment variables
 */
function checkEnvironmentVariables() {
  log.section('🔐 Checking Environment Variables');

  const requiredVars = [
    { name: 'GENESIS_WEBHOOK_URL', optional: false },
    { name: 'RESEARCH_WEBHOOK_URL', optional: true },
    { name: 'ANTHROPIC_API_KEY', optional: true },
    { name: 'OPENAI_API_KEY', optional: true }
  ];

  requiredVars.forEach(v => {
    if (process.env[v.name]) {
      const value = process.env[v.name];
      const masked = value.substring(0, 10) + '...';
      log.success(`${v.name} is set (${masked})`);
    } else {
      if (v.optional) {
        log.info(`${v.name} not set (optional for Scribe)`);
      } else {
        log.warning(`${v.name} not set`);
      }
    }
  });

  // At least one LLM API key should be set for Scribe
  if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
    log.warning('No LLM API key set - Scribe will use fallback basic summaries');
    log.info('Set ANTHROPIC_API_KEY or OPENAI_API_KEY for intelligent release notes');
  }
}

/**
 * Check if core scripts exist
 */
function checkCoreScripts() {
  log.section('📜 Checking Core Scripts');

  const scripts = [
    'scripts/genesis.js',
    'scripts/chronos.js',
    'scripts/scribe.js',
    'scripts/indiana.js',
    'scripts/indiana_milestone.js',
    'plugins/n8n-gateway.js'
  ];

  scripts.forEach(script => {
    const scriptPath = path.resolve(__dirname, '..', script);
    if (fs.existsSync(scriptPath)) {
      log.success(`${script}`);
    } else {
      log.error(`${script} NOT FOUND`);
      issueCount++;
    }
  });
}

/**
 * Main audit function
 */
async function runAudit() {
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║              GENESIS v1.1 - SYSTEM AUDIT                         ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  // Run checks
  checkCoreScripts();
  checkDependencies();
  checkEnvironmentVariables();

  const shardsCheck = checkShardsDirectory();
  const progressCheck = checkProgressFile();
  const projectIdsCheck = checkProjectIds();

  // Cross-check if all data available
  if (shardsCheck.exists && progressCheck.data && projectIdsCheck.data) {
    crossCheckShards(shardsCheck.shards, progressCheck.data, projectIdsCheck.data);
  }

  // Check webhook
  await checkWebhookReachability();

  // Final report
  log.section('📋 Audit Summary');

  if (issueCount === 0) {
    log.success('All checks passed! System is healthy.');
    console.log('\n✨ Genesis v1.1 is ready to run.\n');
    process.exit(0);
  } else {
    log.error(`Found ${issueCount} issue(s) that need attention.`);
    console.log('\n⚠️  Fix the issues above before running Genesis.\n');
    process.exit(1);
  }
}

// Run audit
runAudit().catch(error => {
  console.error('\n❌ Audit failed with error:', error);
  process.exit(1);
});
