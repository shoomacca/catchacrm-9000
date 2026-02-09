
/**
 * GENESIS ORCHESTRATOR v1.1 - "Automated Team"
 *
 * Key Features:
 * - Real-time Linear updates via MCP Gateway
 * - Agents call start_shard() and complete_shard()
 * - Milestone boundary detection
 * - Auto-triggers indiana_milestone.js when milestone completes
 * - Supports both Claude Code and OpenCode
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
const ANTIGRAVITY_DIR = './.antigravity';
const SHARD_DIR = path.join(ANTIGRAVITY_DIR, 'shards');
const STATUS_FILE = path.join(ANTIGRAVITY_DIR, 'status/progress.json');
const CONTEXT_DIR = path.join(ANTIGRAVITY_DIR, 'context');
const CONFIG_FILE = path.join(ANTIGRAVITY_DIR, 'config.json');
const MCP_GATEWAY_PATH = path.resolve(__dirname, '..', 'plugins', 'n8n-gateway.js');
const MILESTONE_SCRIPT = path.resolve(__dirname, 'indiana_milestone.js');
const SCRIBE_SCRIPT = path.resolve(__dirname, 'scribe.js');
const WEBHOOK_URL = process.env.GENESIS_WEBHOOK_URL || 'https://ai.bsbsbs.au/webhook/genesis-update';

const DEFAULT_AGENT_CMD = process.env.GENESIS_AGENT_CMD || null;
const DEFAULT_AGENT_ARGS = process.env.GENESIS_AGENT_ARGS
  ? process.env.GENESIS_AGENT_ARGS.split(' ').filter(Boolean)
  : null;
const DEFAULT_SETTINGS = {
  requireVerification: true
};

// Mode detection
const MODE = process.argv.find(arg => arg.startsWith('--mode='))?.split('=')[1] || 'BUILDER';
const REVIEW_ONLY = process.argv.includes('--review-only');
// ---------------------

function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    return { settings: { ...DEFAULT_SETTINGS } };
  }

  try {
    const raw = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    return {
      ...raw,
      settings: { ...DEFAULT_SETTINGS, ...(raw.settings || {}) }
    };
  } catch (error) {
    return { settings: { ...DEFAULT_SETTINGS } };
  }
}

function sanitizeShardName(shardFile) {
  return shardFile.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
}

function readProgressEnvironment() {
  if (!fs.existsSync(STATUS_FILE)) return null;
  try {
    const status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
    return status.environment || null;
  } catch (error) {
    return null;
  }
}

function resolveAgentConfig() {
  if (DEFAULT_AGENT_CMD) {
    return {
      cmd: DEFAULT_AGENT_CMD,
      args: DEFAULT_AGENT_ARGS || ['--file', '{promptFile}'],
      supportsMcp: DEFAULT_AGENT_CMD.includes('claude')
    };
  }

  const environment = readProgressEnvironment();
  const environmentLabel = environment ? environment.toLowerCase() : '';

  if (environmentLabel.includes('opencode')) {
    // OpenCode doesn't support --mcp-server flag yet
    return {
      cmd: 'opencode',
      args: [
        'run',
        '--file',
        '{promptFile}',
        '--title',
        '{shardTitle}',
        'Follow the attached shard instructions.'
      ],
      supportsMcp: false
    };
  }

  // Default to Claude Code with MCP support
  return {
    cmd: 'claude',
    args: ['--file', '{promptFile}'],
    supportsMcp: true
  };
}

function listShardFiles(dir, prefix = '') {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  entries.forEach((entry) => {
    const entryPath = path.join(dir, entry.name);
    const relativePath = path.join(prefix, entry.name);

    if (entry.isDirectory()) {
      files.push(...listShardFiles(entryPath, relativePath));
      return;
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(relativePath.replace(/\\/g, '/'));
    }
  });

  return files.sort();
}

function normalizeStatus(status) {
  if (Array.isArray(status?.pending)) {
    return {
      mode: 'legacy',
      data: status,
      pending: status.pending || [],
      completed: status.completed || [],
      failed: status.failed || [],
      inProgress: status.in_progress || []
    };
  }

  if (Array.isArray(status?.milestones)) {
    const pending = [];
    const completed = [];
    const failed = [];
    const inProgress = [];

    status.milestones.forEach((milestone) => {
      (milestone.shards || []).forEach((shard) => {
        if (!shard.file) return;
        if (shard.status === 'complete') {
          completed.push(shard.file);
        } else if (shard.status === 'failed') {
          failed.push(shard.file);
        } else if (shard.status === 'in_progress') {
          inProgress.push(shard.file);
        } else {
          pending.push(shard.file);
        }
      });
    });

    return {
      mode: 'milestone',
      data: status,
      pending,
      completed,
      failed,
      inProgress
    };
  }

  return {
    mode: 'unknown',
    data: status,
    pending: [],
    completed: [],
    failed: [],
    inProgress: []
  };
}

function loadStatusFile() {
  if (!fs.existsSync(STATUS_FILE)) {
    return null;
  }

  const status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
  return normalizeStatus(status);
}

function updateMilestoneStatus(milestone) {
  const shards = milestone.shards || [];

  if (shards.length === 0) {
    milestone.status = 'pending';
    return;
  }

  if (shards.every((shard) => shard.status === 'complete')) {
    milestone.status = 'complete';
    return;
  }

  if (shards.some((shard) => shard.status === 'failed')) {
    milestone.status = 'in_progress';
    return;
  }

  if (shards.some((shard) => shard.status === 'in_progress')) {
    milestone.status = 'in_progress';
    return;
  }

  milestone.status = 'pending';
}

function findShard(statusData, shardFile) {
  for (const milestone of statusData.milestones || []) {
    const shard = (milestone.shards || []).find((entry) => entry.file === shardFile);
    if (shard) {
      return { milestone, shard };
    }
  }
  return null;
}

function initializeStatus() {
  if (!fs.existsSync(STATUS_FILE)) {
    console.log('🆕 Initializing Genesis Status...');

    if (!fs.existsSync(SHARD_DIR)) {
      console.error('❌ ERROR: No shards directory found at', SHARD_DIR);
      console.error('   Create .antigravity/shards/ and add your shard files.');
      process.exit(1);
    }

    const allShards = listShardFiles(SHARD_DIR);

    if (allShards.length === 0) {
      console.error('❌ ERROR: No shard files found in', SHARD_DIR);
      console.error('   Create shard files like: M01/M01_01_SCHEMA.md');
      process.exit(1);
    }

    const statusDir = path.dirname(STATUS_FILE);
    if (!fs.existsSync(statusDir)) {
      fs.mkdirSync(statusDir, { recursive: true });
    }

    const initialStatus = {
      version: '1.1',
      pending: allShards,
      completed: [],
      failed: [],
      in_progress: [],
      lastUpdate: new Date().toISOString()
    };

    fs.writeFileSync(STATUS_FILE, JSON.stringify(initialStatus, null, 2));
    console.log(`✅ Initialized ${allShards.length} shards in queue`);
    return normalizeStatus(initialStatus);
  }

  const existing = loadStatusFile();
  if (!existing) {
    console.error('❌ ERROR: progress.json could not be parsed');
    process.exit(1);
  }

  return existing;
}

function loadContext() {
  let context = '';

  const briefPath = path.join(CONTEXT_DIR, 'BRIEF.md');
  if (fs.existsSync(briefPath)) {
    context += fs.readFileSync(briefPath, 'utf8') + '\n\n';
  } else {
    console.warn('⚠️  WARNING: No BRIEF.md found in context/');
  }

  const stackPath = path.join(CONTEXT_DIR, 'STACK.md');
  if (fs.existsSync(stackPath)) {
    context += fs.readFileSync(stackPath, 'utf8') + '\n\n';
  } else {
    console.warn('⚠️  WARNING: No STACK.md found in context/');
  }

  return context;
}

function extractShardId(shardFile) {
  // Extract M01_01 from "M01/M01_01_SCHEMA.md"
  const match = shardFile.match(/(M\d+_\d+)/);
  return match ? match[1] : shardFile.replace(/\.md$/, '').replace(/\//g, '_');
}

function buildPrompt(globalContext, shardInstructions, shardFile, supportsMcp, requireVerification) {
  const shardId = extractShardId(shardFile);

  const completionLabel = requireVerification ? 'after verification passes' : 'once work is complete';
  const mcpInstructions = supportsMcp
    ? `
═══════════════════════════════════════════════════════════════════
                    CRITICAL: MCP TOOL USAGE
═══════════════════════════════════════════════════════════════════

YOU MUST CALL THESE TOOLS:

1. AT THE START (before any work):
   start_shard({ shardId: "${shardId}" })

2. AT THE END (${completionLabel}):
   complete_shard({
     shardId: "${shardId}",
     notes: "Brief summary of what you built"
   })

THESE TOOLS UPDATE LINEAR IN REAL-TIME.
If you skip them, the user won't see your progress!

═══════════════════════════════════════════════════════════════════
`
    : `
═══════════════════════════════════════════════════════════════════
                    NOTE: MCP Tools Not Available
═══════════════════════════════════════════════════════════════════

Your environment doesn't support MCP tools yet.
Just execute the shard and say "SHARD COMPLETE" when done.

═══════════════════════════════════════════════════════════════════
`;

  return `
🔴 GENESIS SYSTEM INSTRUCTION - READ CAREFULLY 🔴

YOU ARE A FRESH BUILDER AGENT WITH COMPLETE AMNESIA.
You have NO MEMORY of any previous shards, chats, or work.
Your ONLY job is to execute THIS shard and exit.

═══════════════════════════════════════════════════════════════════
                        YOUR GLOBAL CONTEXT
═══════════════════════════════════════════════════════════════════

${globalContext}

═══════════════════════════════════════════════════════════════════
                     YOUR IMMEDIATE MISSION
                         SHARD: ${shardFile}
                         SHARD ID: ${shardId}
═══════════════════════════════════════════════════════════════════

${shardInstructions}

${mcpInstructions}

═══════════════════════════════════════════════════════════════════
                        EXECUTION PROTOCOL
═══════════════════════════════════════════════════════════════════

WORKFLOW:

${supportsMcp ? '1. CALL start_shard({ shardId: "' + shardId + '" })' : '1. BEGIN execution'}
2. READ the mission objective carefully
3. WRITE the code to fulfill the mission requirements
${requireVerification ? '4. VERIFY your work (run build, run tests if specified)' : '4. VERIFY only if the shard explicitly requires it'}
${supportsMcp ? '5. CALL complete_shard({ shardId: "' + shardId + '", notes: "..." })' : '5. Say "SHARD COMPLETE"'}
6. STOP - Do not continue to other work

RULES YOU MUST FOLLOW:

- DO NOT read or update STATE.md, PLAN.md, or progress.json
- DO NOT work on any other shards or tasks
${requireVerification ? '- DO NOT skip verification steps' : '- Verification is optional unless the shard explicitly requires it'}
- DO commit your changes with format: feat(${shardId}): description
${supportsMcp ? '- DO call both start_shard and complete_shard tools' : ''}

YOU ARE A BUILDER, NOT A MANAGER.
Focus only on the code. The orchestrator handles everything else.

═══════════════════════════════════════════════════════════════════

BEGIN EXECUTION NOW.
`.trim();
}

function resolveAgentArgs(agentArgs, promptFile, shardTitle) {
  return agentArgs.map((arg) =>
    arg
      .replace('{promptFile}', promptFile)
      .replace('{shardTitle}', shardTitle)
  );
}

async function executeShard(shardFile, globalContext, agentConfig, requireVerification) {
  const shardPath = path.join(SHARD_DIR, shardFile);
  const shardInstructions = fs.readFileSync(shardPath, 'utf8');

  const prompt = buildPrompt(
    globalContext,
    shardInstructions,
    shardFile,
    agentConfig.supportsMcp,
    requireVerification
  );

  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log(`🚀 SPAWNING GENESIS AGENT FOR: ${shardFile}`);
  console.log(`   Shard ID: ${extractShardId(shardFile)}`);
  console.log(`   Agent: ${agentConfig.cmd}`);
  console.log(`   MCP Gateway: ${agentConfig.supportsMcp ? 'Enabled' : 'Not available'}`);
  console.log('═══════════════════════════════════════════════════════════════════\n');

  ensureDirExists(ANTIGRAVITY_DIR);
  const promptFileName = `.genesis_prompt_${sanitizeShardName(shardFile)}.md`;
  const promptFile = path.join(ANTIGRAVITY_DIR, promptFileName);
  fs.writeFileSync(promptFile, prompt);

  const promptFileArg = path.resolve(promptFile);
  const shardTitle = `Genesis: ${shardFile}`;

  // Build spawn arguments
  let spawnArgs = resolveAgentArgs(agentConfig.args, promptFileArg, shardTitle);

  // Add MCP server if supported
  if (agentConfig.supportsMcp && fs.existsSync(MCP_GATEWAY_PATH)) {
    spawnArgs.push('--mcp-server', `node ${MCP_GATEWAY_PATH}`);
  }

  return new Promise((resolve, reject) => {
    const agentProcess = spawn(agentConfig.cmd, spawnArgs, {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true,
      cwd: process.cwd(),
      env: {
        ...process.env,
        GENESIS_WEBHOOK_URL: WEBHOOK_URL
      }
    });

    let output = '';

    agentProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });

    agentProcess.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stderr.write(text);
    });

    agentProcess.on('exit', (code) => {
      if (fs.existsSync(promptFile)) {
        fs.unlinkSync(promptFile);
      }

      if (code === 0) {
        resolve({ output });
      } else {
        reject(new Error(`Agent exited with code ${code}`));
      }
    });

    agentProcess.on('error', (err) => {
      reject(err);
    });
  });
}

function markShardComplete(shardFile) {
  const statusState = loadStatusFile();
  if (!statusState) {
    console.error('❌ ERROR: progress.json could not be read');
    process.exit(1);
  }

  if (statusState.mode === 'legacy') {
    statusState.data.pending = statusState.data.pending.filter((entry) => entry !== shardFile);
    statusState.data.completed = [...(statusState.data.completed || []), shardFile];
    statusState.data.in_progress = (statusState.data.in_progress || []).filter(
      (entry) => entry !== shardFile
    );
    statusState.data.lastUpdate = new Date().toISOString();

    fs.writeFileSync(STATUS_FILE, JSON.stringify(statusState.data, null, 2));
  } else if (statusState.mode === 'milestone') {
    const match = findShard(statusState.data, shardFile);
    if (!match) {
      console.error(`❌ ERROR: Shard ${shardFile} not found in progress.json`);
      process.exit(1);
    }

    match.shard.status = 'complete';
    updateMilestoneStatus(match.milestone);
    statusState.data.in_progress = (statusState.data.in_progress || []).filter(
      (entry) => entry !== shardFile
    );
    statusState.data.lastUpdate = new Date().toISOString();

    fs.writeFileSync(STATUS_FILE, JSON.stringify(statusState.data, null, 2));

    // Check if milestone is now complete
    return match.milestone;
  } else {
    console.error('❌ ERROR: Unknown progress.json format');
    process.exit(1);
  }

  const updatedStatus = loadStatusFile();
  const completedCount = updatedStatus ? updatedStatus.completed.length : 0;
  const pendingCount = updatedStatus ? updatedStatus.pending.length : 0;

  console.log(`\n✅ SHARD ${shardFile} COMPLETED`);
  console.log(`📊 Progress: ${completedCount}/${completedCount + pendingCount} shards done`);

  return null;
}

function markShardFailed(shardFile, error) {
  const statusState = loadStatusFile();
  if (!statusState) {
    console.error('❌ ERROR: progress.json could not be read');
    process.exit(1);
  }

  if (statusState.mode === 'legacy') {
    statusState.data.pending = statusState.data.pending.filter((entry) => entry !== shardFile);
    statusState.data.failed = [
      ...(statusState.data.failed || []),
      {
        shard: shardFile,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    ];
    statusState.data.in_progress = (statusState.data.in_progress || []).filter(
      (entry) => entry !== shardFile
    );
    statusState.data.lastUpdate = new Date().toISOString();

    fs.writeFileSync(STATUS_FILE, JSON.stringify(statusState.data, null, 2));
  } else if (statusState.mode === 'milestone') {
    const match = findShard(statusState.data, shardFile);
    if (!match) {
      console.error(`❌ ERROR: Shard ${shardFile} not found in progress.json`);
      process.exit(1);
    }

    match.shard.status = 'failed';
    updateMilestoneStatus(match.milestone);
    statusState.data.failed = [
      ...(statusState.data.failed || []),
      {
        shard: shardFile,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    ];
    statusState.data.in_progress = (statusState.data.in_progress || []).filter(
      (entry) => entry !== shardFile
    );
    statusState.data.lastUpdate = new Date().toISOString();

    fs.writeFileSync(STATUS_FILE, JSON.stringify(statusState.data, null, 2));
  } else {
    console.error('❌ ERROR: Unknown progress.json format');
    process.exit(1);
  }

  console.error(`\n❌ SHARD ${shardFile} FAILED`);
  console.error(`   Error: ${error.message}`);
}

function markShardInProgress(shardFile) {
  const statusState = loadStatusFile();
  if (!statusState) {
    console.error('❌ ERROR: progress.json could not be read');
    process.exit(1);
  }

  if (statusState.mode === 'legacy') {
    statusState.data.pending = statusState.data.pending.filter((entry) => entry !== shardFile);
    statusState.data.in_progress = [...(statusState.data.in_progress || []), shardFile];
    statusState.data.lastUpdate = new Date().toISOString();
    fs.writeFileSync(STATUS_FILE, JSON.stringify(statusState.data, null, 2));
    return;
  }

  if (statusState.mode === 'milestone') {
    const match = findShard(statusState.data, shardFile);
    if (!match) {
      console.error(`❌ ERROR: Shard ${shardFile} not found in progress.json`);
      process.exit(1);
    }

    match.shard.status = 'in_progress';
    updateMilestoneStatus(match.milestone);
    statusState.data.in_progress = [...(statusState.data.in_progress || []), shardFile];
    statusState.data.lastUpdate = new Date().toISOString();
    fs.writeFileSync(STATUS_FILE, JSON.stringify(statusState.data, null, 2));
  }
}

function triggerMilestoneScribe(milestone) {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log(`║  MILESTONE ${milestone.id} COMPLETE: ${milestone.name}`);
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  console.log('📝 Triggering The Scribe (scribe.js)...\n');

  try {
    // Call scribe.js - it will:
    // 1. Read git log for this milestone
    // 2. Use LLM to generate summary
    // 3. Save summary to .antigravity/milestones/
    // 4. Call indiana_milestone.js to post to n8n
    const agent = milestone.owner || '@Developer';
    const command = `node "${SCRIBE_SCRIPT}" "${milestone.id}" "${agent}"`;

    console.log(`Running: ${command}\n`);

    execSync(command, { stdio: 'inherit', cwd: process.cwd() });

    console.log('\n✅ Milestone report complete');
    console.log('🔗 Linear tasks updated');
    console.log('📤 GitHub commit pushed');
    console.log('📬 Summary posted to Slack/Telegram\n');
  } catch (error) {
    console.warn('⚠️  Warning: scribe.js failed:', error.message);
    console.warn('   Continuing to next milestone...\n');
  }
}

function getMilestoneFromShard(shardFile, statusData) {
  const match = findShard(statusData, shardFile);
  return match ? match.milestone : null;
}

function isNewMilestone(currentShardFile, nextShardFile, statusData) {
  if (!nextShardFile) return false;

  const currentMilestone = getMilestoneFromShard(currentShardFile, statusData);
  const nextMilestone = getMilestoneFromShard(nextShardFile, statusData);

  if (!currentMilestone || !nextMilestone) return false;

  return currentMilestone.id !== nextMilestone.id;
}

async function executeGenesis() {
  const modeLabel = MODE === 'ARCHITECT' ? 'ARCHITECT (Planning)' : 'BUILDER (Execution)';

  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                    GENESIS ORCHESTRATOR v1.1                      ║');
  console.log(`║                     ${modeLabel.padEnd(45)}║`);
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  const statusState = initializeStatus();

  // ARCHITECT mode: Review and plan only, don't execute
  if (MODE === 'ARCHITECT' || REVIEW_ONLY) {
    console.log('📋 ARCHITECT MODE - Review Only\n');
    console.log('📊 Current Status:');
    console.log(`   Pending shards: ${statusState.pending.length}`);
    console.log(`   Completed shards: ${statusState.completed.length}`);
    console.log(`   Failed shards: ${statusState.failed.length}`);

    if (statusState.pending.length > 0) {
      console.log('\n📝 Next 5 shards to execute:');
      statusState.pending.slice(0, 5).forEach((shard, idx) => {
        console.log(`   ${idx + 1}. ${shard}`);
      });
    }

    if (statusState.failed.length > 0) {
      console.log('\n⚠️  Failed shards (need attention):');
      statusState.failed.forEach((entry) => {
        const name = entry.shard || entry;
        console.log(`   - ${name}`);
      });
    }

    console.log('\n✅ ARCHITECT review complete');
    console.log('   To execute: Run genesis.js without --mode or --review-only');
    process.exit(0);
  }

  if (statusState.pending.length === 0) {
    console.log('✨ ALL SHARDS COMPLETED. SYSTEM STANDBY.');
    console.log(
      `📊 Final Stats: ${statusState.completed.length} completed, ${statusState.failed.length} failed`
    );

    if (statusState.failed.length > 0) {
      console.log('\n⚠️  Failed shards:');
      statusState.failed.forEach((entry) => {
        const name = entry.shard || entry;
        console.log(`   - ${name}`);
      });
    }

    process.exit(0);
  }

  console.log('📖 Loading global context...');
  const globalContext = loadContext();
  const config = loadConfig();
  const requireVerification = config.settings?.requireVerification !== false;

  console.log('🔧 Resolving agent configuration...');
  const agentConfig = resolveAgentConfig();
  console.log(`   Agent: ${agentConfig.cmd}`);
  console.log(`   MCP Support: ${agentConfig.supportsMcp ? 'Yes' : 'No'}\n`);

  if (!agentConfig.supportsMcp) {
    console.warn('⚠️  WARNING: MCP tools not available in this environment');
    console.warn('   Linear updates will only happen at milestone boundaries\n');
  }

  let previousMilestone = null;

  while (statusState.pending.length > 0) {
    const shardFile = statusState.pending[0];
    const nextShardFile = statusState.pending[1];

    markShardInProgress(shardFile);

    try {
      const result = await executeShard(shardFile, globalContext, agentConfig, requireVerification);
      const output = result.output || '';

      if (!output.includes('SHARD COMPLETE') && !output.includes('complete_shard')) {
        throw new Error('Shard did not report completion (missing SHARD COMPLETE or complete_shard call)');
      }

      const milestone = markShardComplete(shardFile);

      // Reload status to get updated state
      const updatedStatus = loadStatusFile();
      if (!updatedStatus) {
        throw new Error('progress.json could not be reloaded');
      }

      statusState.pending = updatedStatus.pending;
      statusState.completed = updatedStatus.completed;
      statusState.failed = updatedStatus.failed;
      statusState.inProgress = updatedStatus.inProgress;

      // Check if milestone just completed
      if (milestone && milestone.status === 'complete' && milestone.id !== previousMilestone?.id) {
        triggerMilestoneScribe(milestone);
        previousMilestone = milestone;
      }

      // Check if next shard is a new milestone
      if (nextShardFile && isNewMilestone(shardFile, nextShardFile, updatedStatus.data)) {
        console.log('\n🛑 MILESTONE BOUNDARY DETECTED');
        console.log('   Pausing for milestone completion...\n');
        // The milestone scribe was already triggered above if the milestone is complete
        console.log('✅ Milestone processing complete. Continuing to next milestone...\n');
      }
    } catch (error) {
      markShardFailed(shardFile, error);

      console.log('\n🛑 STOPPING ORCHESTRATOR DUE TO FAILURE');
      console.log('   Fix the issue and re-run genesis.js to continue');
      process.exit(1);
    }
  }

  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                  ✨ ALL SHARDS COMPLETED! ✨                      ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');
  console.log('📊 Final Stats:');
  console.log(`   ✅ Completed: ${statusState.completed.length}`);
  console.log(`   ❌ Failed: ${statusState.failed.length}`);
  console.log('\n🎉 Genesis execution complete!');
  process.exit(0);
}

executeGenesis().catch((error) => {
  console.error('\n💥 ORCHESTRATOR CRASHED:', error.message);
  process.exit(1);
});
