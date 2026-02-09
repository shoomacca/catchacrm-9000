const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG_FILE = path.join(process.cwd(), '.antigravity', 'config.json');
const DEFAULT_WORKTREE_CONFIG = {
  enabled: true,
  baseDir: 'build',
  branchPrefix: 'shard/',
  maxConcurrent: 2,
  cleanupOnSuccess: true,
  cleanupOnFailure: false
};

function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    return { worktrees: { ...DEFAULT_WORKTREE_CONFIG } };
  }

  try {
    const raw = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    return {
      ...raw,
      worktrees: { ...DEFAULT_WORKTREE_CONFIG, ...(raw.worktrees || {}) }
    };
  } catch (error) {
    return { worktrees: { ...DEFAULT_WORKTREE_CONFIG } };
  }
}

function sanitizeShardName(shardFile) {
  return shardFile.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
}

function runGitCommand(command) {
  return execSync(command, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
}

function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createWorktree(shardFile, worktreeConfig) {
  const baseDir = path.resolve(worktreeConfig.baseDir || DEFAULT_WORKTREE_CONFIG.baseDir);
  ensureDirExists(baseDir);

  const shardSlug = sanitizeShardName(shardFile);
  const worktreePath = path.join(baseDir, shardSlug);
  const branchName = `${worktreeConfig.branchPrefix || DEFAULT_WORKTREE_CONFIG.branchPrefix}${shardSlug}`;

  if (!fs.existsSync(worktreePath)) {
    const branchExists = runGitCommand(`git branch --list ${branchName}`);
    const addCommand = branchExists
      ? `git worktree add "${worktreePath}" ${branchName}`
      : `git worktree add -b ${branchName} "${worktreePath}"`;
    runGitCommand(addCommand);
  }

  return { worktreePath, branchName };
}

function showUsage() {
  console.log('Usage: node scripts/ng-worktree.js <shard-file>');
  console.log('Example: node scripts/ng-worktree.js M01/M01_01_SCHEMA.md');
}

const shardFile = process.argv[2];
if (!shardFile) {
  showUsage();
  process.exit(1);
}

const config = loadConfig();
const worktreeConfig = config.worktrees || { ...DEFAULT_WORKTREE_CONFIG };
const worktreeInfo = createWorktree(shardFile, worktreeConfig);

console.log('Worktree ready:');
console.log(`- Path: ${worktreeInfo.worktreePath}`);
console.log(`- Branch: ${worktreeInfo.branchName}`);
