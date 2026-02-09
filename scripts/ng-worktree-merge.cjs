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
  return execSync(command, { stdio: 'inherit' });
}

function removeWorktree(worktreePath) {
  if (!fs.existsSync(worktreePath)) {
    return;
  }

  try {
    runGitCommand(`git worktree remove "${worktreePath}"`);
  } catch (error) {
    console.warn(`Warning: Failed to remove worktree at ${worktreePath}`);
  }
}

function deleteBranch(branchName) {
  try {
    runGitCommand(`git branch -d ${branchName}`);
  } catch (error) {
    console.warn(`Warning: Could not delete branch ${branchName}`);
  }
}

function showUsage() {
  console.log('Usage: node scripts/ng-worktree-merge.js <shard-file-or-branch>');
  console.log('Example: node scripts/ng-worktree-merge.js M01/M01_01_SCHEMA.md');
  console.log('Example: node scripts/ng-worktree-merge.js shard/m01_01_schema');
}

const shardInput = process.argv[2];
if (!shardInput) {
  showUsage();
  process.exit(1);
}

const config = loadConfig();
const worktreeConfig = config.worktrees || { ...DEFAULT_WORKTREE_CONFIG };
const branchPrefix = worktreeConfig.branchPrefix || DEFAULT_WORKTREE_CONFIG.branchPrefix;
const shardSlug = sanitizeShardName(shardInput);
const branchName = shardInput.startsWith(branchPrefix)
  ? shardInput
  : `${branchPrefix}${shardSlug}`;
const worktreePath = path.resolve(worktreeConfig.baseDir || DEFAULT_WORKTREE_CONFIG.baseDir, shardSlug);

runGitCommand(`git merge --no-ff ${branchName}`);

if (worktreeConfig.cleanupOnSuccess) {
  removeWorktree(worktreePath);
  deleteBranch(branchName);
}

console.log(`Merged ${branchName} into current branch.`);
