
/**
 * ng-handoff.js - v1.0
 * Generates shard-focused handoff prompts for AntiGravity Genesis projects
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VALID_ROLES = ['manager', 'consultant', 'developer', 'automator', 'tools'];
const VALID_AGENTS = ['claude', 'opencode'];

function getTemplatesDir() {
  const localPrompts = path.join(__dirname, '..', 'prompts');
  if (fs.existsSync(localPrompts)) return localPrompts;

  const masterTemplates = path.join(
    process.env.USERPROFILE || process.env.HOME,
    '.antigravity',
    'new_genesis_pro',
    'prompts'
  );

  if (fs.existsSync(masterTemplates)) return masterTemplates;
  return localPrompts;
}

const TEMPLATES_DIR = getTemplatesDir();
const ANTIGRAVITY_DIR = '.antigravity';

function parseArgs(argv) {
  if (argv.length < 2) {
    showUsage();
    process.exit(1);
  }

  const args = {
    role: argv[0].toLowerCase(),
    agent: argv[1].toLowerCase(),
    options: {}
  };

  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--shard' && argv[i + 1]) {
      args.options.shard = argv[i + 1];
      i++;
    } else if (argv[i] === '--model' && argv[i + 1]) {
      args.options.model = argv[i + 1];
      i++;
    }
  }

  return args;
}

function validateArgs(args) {
  if (!VALID_ROLES.includes(args.role)) {
    throw new Error(`Invalid role: ${args.role}. Valid roles: ${VALID_ROLES.join(', ')}`);
  }

  if (!VALID_AGENTS.includes(args.agent)) {
    throw new Error(`Invalid agent: ${args.agent}. Valid agents: ${VALID_AGENTS.join(', ')}`);
  }
}

function showUsage() {
  console.log(`
==================================================
ng-handoff - AntiGravity Agent Handoff v1.0
==================================================

Usage:
  node ng-handoff.js <role> <agent> [options]

Options:
  --shard <id>       Start from a specific shard (e.g., M01_02_API)
  --model <model>    Suggest specific model for OpenCode
`);
}

function checkProjectStructure() {
  if (!fs.existsSync(ANTIGRAVITY_DIR)) {
    throw new Error('Not in an AntiGravity project directory.');
  }

  const requiredFiles = [
    'context/BRIEF.md',
    'context/STACK.md',
    'PLAN.md',
    'status/progress.json'
  ];

  const missing = requiredFiles.filter(file =>
    !fs.existsSync(path.join(ANTIGRAVITY_DIR, file))
  );

  if (missing.length > 0) {
    throw new Error(`Missing required files in .antigravity/: ${missing.join(', ')}`);
  }
}

function readProjectContext() {
  const context = {};
  context.brief = fs.readFileSync(path.join(ANTIGRAVITY_DIR, 'context', 'BRIEF.md'), 'utf8');
  context.stack = fs.readFileSync(path.join(ANTIGRAVITY_DIR, 'context', 'STACK.md'), 'utf8');
  context.plan = fs.readFileSync(path.join(ANTIGRAVITY_DIR, 'PLAN.md'), 'utf8');
  return context;
}

function generatePrompt(agent, shardId) {
  const templatePath = path.join(TEMPLATES_DIR, `${agent}_handoff.md`);
  if (fs.existsSync(templatePath)) {
    return fs.readFileSync(templatePath, 'utf8');
  }

  return `
Read only:
- .antigravity/context/BRIEF.md
- .antigravity/context/STACK.md
- .antigravity/shards/${shardId || '[NEXT_SHARD]'}

Do not read progress.json.
`.trim();
}

function copyToClipboard(text) {
  try {
    if (process.platform === 'darwin') {
      execSync('pbcopy', { input: text });
    } else if (process.platform === 'win32') {
      execSync('clip', { input: text });
    } else {
      execSync('xclip -selection clipboard', { input: text });
    }
    return true;
  } catch {
    return false;
  }
}

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    validateArgs(args);
    checkProjectStructure();

    const context = readProjectContext();
    const prompt = generatePrompt(args.agent, args.options.shard);
    copyToClipboard(prompt);

    console.log('==================================================');
    console.log(`HANDOFF: @${args.role.toUpperCase()} (${args.agent.toUpperCase()})`);
    console.log('==================================================');
    console.log('Prompt copied to clipboard.');

    const handoffPath = path.join(ANTIGRAVITY_DIR, 'last_handoff.md');
    fs.writeFileSync(handoffPath, prompt);
  } catch (error) {
    console.error(`\nError: ${error.message}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
