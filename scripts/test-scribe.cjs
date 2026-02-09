
/**
 * THE SCRIBE - Test Script
 *
 * Purpose: Test The Scribe without requiring a full Genesis project
 * Usage: node scripts/test-scribe.js
 *
 * This script:
 * 1. Creates a fake progress.json with test milestone
 * 2. Creates fake git commits
 * 3. Calls scribe.js to generate summary
 * 4. Shows the output without posting to n8n
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TEST_DIR = path.join(__dirname, '..', '.test-scribe');
const ANTIGRAVITY_DIR = path.join(TEST_DIR, '.antigravity');

function cleanup() {
  if (fs.existsSync(TEST_DIR)) {
    console.log('🧹 Cleaning up previous test directory...');
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

function setup() {
  console.log('📦 Setting up test environment...\n');

  // Create directories
  fs.mkdirSync(path.join(ANTIGRAVITY_DIR, 'status'), { recursive: true });
  fs.mkdirSync(path.join(ANTIGRAVITY_DIR, 'milestones'), { recursive: true });

  // Create fake progress.json
  const progress = {
    version: '1.1',
    environment: 'Claude Code',
    milestones: [
      {
        id: 'M01',
        name: 'Foundation Setup',
        status: 'complete',
        owner: '@Developer',
        shards: [
          {
            id: 'M01_01',
            name: 'Database Schema',
            file: 'M01/M01_01_SCHEMA.md',
            status: 'complete'
          },
          {
            id: 'M01_02',
            name: 'API Layer',
            file: 'M01/M01_02_API.md',
            status: 'complete'
          },
          {
            id: 'M01_03',
            name: 'Authentication',
            file: 'M01/M01_03_AUTH.md',
            status: 'complete'
          }
        ]
      }
    ],
    lastUpdate: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(ANTIGRAVITY_DIR, 'status/progress.json'),
    JSON.stringify(progress, null, 2)
  );

  console.log('✅ Created test progress.json');

  // Initialize git repo
  try {
    execSync('git init', { cwd: TEST_DIR, stdio: 'ignore' });
    execSync('git config user.name "Test User"', { cwd: TEST_DIR, stdio: 'ignore' });
    execSync('git config user.email "test@example.com"', { cwd: TEST_DIR, stdio: 'ignore' });

    // Create fake commits
    const commits = [
      'feat(M01_01): Add users table with UUID primary key',
      'feat(M01_01): Add posts table with foreign key to users',
      'feat(M01_01): Add comments table with nested threading support',
      'fix(M01_01): Fix timestamp defaults to use NOW()',
      'feat(M01_02): Implement GET /api/users endpoint',
      'feat(M01_02): Implement POST /api/users endpoint with validation',
      'feat(M01_02): Add pagination support to list endpoints',
      'feat(M01_03): Setup Supabase auth client',
      'feat(M01_03): Add login/logout functionality',
      'fix(M01_03): Fix session refresh token handling',
      'docs(M01): Update API documentation'
    ];

    // Create dummy file and commit for each message
    commits.forEach((message, index) => {
      const fileName = `test-${index}.txt`;
      fs.writeFileSync(path.join(TEST_DIR, fileName), `Test commit ${index}`);
      execSync(`git add ${fileName}`, { cwd: TEST_DIR, stdio: 'ignore' });
      execSync(`git commit -m "${message}"`, { cwd: TEST_DIR, stdio: 'ignore' });
    });

    console.log(`✅ Created ${commits.length} test commits\n`);
  } catch (error) {
    console.error('❌ Failed to create git commits:', error.message);
    process.exit(1);
  }
}

function testLLMConnection() {
  console.log('🔍 Checking LLM configuration...\n');

  const provider = process.env.SCRIBE_LLM_PROVIDER || 'anthropic';
  const hasAnthropicKey = !!(process.env.SCRIBE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY);
  const hasOpenAIKey = !!(process.env.SCRIBE_OPENAI_API_KEY || process.env.OPENAI_API_KEY);

  console.log(`Provider: ${provider}`);
  console.log(`Anthropic API Key: ${hasAnthropicKey ? '✅ Set' : '❌ Not set'}`);
  console.log(`OpenAI API Key: ${hasOpenAIKey ? '✅ Set' : '❌ Not set'}`);
  console.log('');

  if (provider === 'anthropic' && !hasAnthropicKey) {
    console.warn('⚠️  WARNING: ANTHROPIC_API_KEY not set');
    console.warn('   Scribe will fall back to basic summary (no LLM)');
    console.warn('   Set ANTHROPIC_API_KEY or SCRIBE_ANTHROPIC_API_KEY to use LLM\n');
  } else if (provider === 'openai' && !hasOpenAIKey) {
    console.warn('⚠️  WARNING: OPENAI_API_KEY not set');
    console.warn('   Scribe will fall back to basic summary (no LLM)');
    console.warn('   Set OPENAI_API_KEY or SCRIBE_OPENAI_API_KEY to use LLM\n');
  }
}

function runScribe() {
  console.log('🚀 Running The Scribe...\n');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  try {
    const scribeScript = path.resolve(__dirname, 'scribe.js');

    // Override indiana_milestone.js to prevent actual posting
    const fakeReporter = path.join(TEST_DIR, 'fake-reporter.js');
    fs.writeFileSync(
      fakeReporter,
      `#!/usr/bin/env node
console.log('\\n📬 [TEST MODE] Would have posted to n8n, but this is a test');
console.log('Arguments received:', process.argv.slice(2));
console.log('✅ Test milestone report complete\\n');`
    );

    // Run scribe from test directory
    execSync(`node "${scribeScript}" M01 "@Developer"`, {
      cwd: TEST_DIR,
      stdio: 'inherit',
      env: {
        ...process.env,
        // Override milestone script path for testing
        NODE_PATH: TEST_DIR
      }
    });
  } catch (error) {
    console.error('\n❌ Scribe failed:', error.message);
    process.exit(1);
  }
}

function showResults() {
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('📋 Test Results');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  const summaryPath = path.join(ANTIGRAVITY_DIR, 'milestones/M01_SUMMARY.md');

  if (fs.existsSync(summaryPath)) {
    console.log('✅ Summary file created:', summaryPath);
    console.log('\n📄 Summary contents:');
    console.log('─────────────────────────────────────────────────────────────────');
    const summary = fs.readFileSync(summaryPath, 'utf8');
    console.log(summary);
    console.log('─────────────────────────────────────────────────────────────────\n');
  } else {
    console.error('❌ Summary file not created');
  }

  console.log('✨ Test complete!\n');
  console.log('Test directory: ' + TEST_DIR);
  console.log('To clean up: rm -rf ' + TEST_DIR);
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                  THE SCRIBE - TEST SCRIPT                         ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  cleanup();
  setup();
  testLLMConnection();
  runScribe();
  showResults();
}

main().catch((error) => {
  console.error('\n💥 Test failed:', error.message);
  cleanup();
  process.exit(1);
});
