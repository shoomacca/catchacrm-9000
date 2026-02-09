/**
 * Path Resolution for New Genesis
 * Handles both .planning/ (v4+) and .antigravity/ (legacy) paths
 */

const fs = require('fs');
const path = require('path');

const PLANNING_DIR = './.planning';
const LEGACY_DIR = './.antigravity';

/**
 * Check if a path exists
 */
function pathExists(targetPath) {
  return fs.existsSync(targetPath);
}

/**
 * Ensure a directory exists, create if not
 */
function ensureDir(targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
}

/**
 * Resolve BRIEF.md path (checks .planning/ first, then legacy)
 */
function resolveBriefPath() {
  const planningPath = path.join(PLANNING_DIR, 'BRIEF.md');
  const legacyPath = path.join(LEGACY_DIR, 'context', 'BRIEF.md');
  const legacyBuildIdea = path.join(LEGACY_DIR, 'context', 'BUILD_IDEA.md');
  const legacyProjectBrief = path.join(LEGACY_DIR, 'context', 'PROJECT_BRIEF.md');

  if (pathExists(planningPath)) {
    return { path: planningPath, mode: 'planning' };
  }
  if (pathExists(legacyPath)) {
    return { path: legacyPath, mode: 'legacy' };
  }
  if (pathExists(legacyBuildIdea)) {
    return { path: legacyBuildIdea, mode: 'legacy' };
  }
  if (pathExists(legacyProjectBrief)) {
    return { path: legacyProjectBrief, mode: 'legacy' };
  }

  return { path: planningPath, mode: 'planning', missing: true };
}

/**
 * Resolve PROJECT_IDS.json path
 */
function resolveProjectIdsPath() {
  const planningPath = path.join(PLANNING_DIR, 'PROJECT_IDS.json');
  const legacyPath = path.join(LEGACY_DIR, 'PROJECT_IDS.json');

  if (pathExists(planningPath)) {
    return { path: planningPath, mode: 'planning' };
  }
  if (pathExists(legacyPath)) {
    return { path: legacyPath, mode: 'legacy' };
  }

  return { path: planningPath, mode: 'planning', missing: true };
}

/**
 * Resolve progress.json path
 */
function resolveProgressPath() {
  const planningPath = path.join(PLANNING_DIR, 'progress.json');
  const legacyPath = path.join(LEGACY_DIR, 'status', 'progress.json');

  if (pathExists(planningPath)) {
    return { path: planningPath, mode: 'planning' };
  }
  if (pathExists(legacyPath)) {
    return { path: legacyPath, mode: 'legacy' };
  }

  return { path: planningPath, mode: 'planning', missing: true };
}

/**
 * Resolve STATE.md path
 */
function resolveStatePath() {
  const planningPath = path.join(PLANNING_DIR, 'STATE.md');
  const legacyPath = path.join(LEGACY_DIR, 'context', 'STATE.md');

  if (pathExists(planningPath)) {
    return { path: planningPath, mode: 'planning' };
  }
  if (pathExists(legacyPath)) {
    return { path: legacyPath, mode: 'legacy' };
  }

  return { path: planningPath, mode: 'planning', missing: true };
}

/**
 * Resolve shard file path
 */
function resolveShardPath(shardFile, mode) {
  if (!shardFile) return null;

  if (mode === 'legacy') {
    return path.join(LEGACY_DIR, 'shards', shardFile);
  }
  return path.join(PLANNING_DIR, shardFile);
}

/**
 * Resolve milestone folder path
 * @param {number} milestoneNum - Milestone number (1, 2, 3, etc.)
 */
function resolveMilestonePath(milestoneNum) {
  const paddedNum = String(milestoneNum).padStart(2, '0');
  const planningPath = path.join(PLANNING_DIR, 'milestones', `${paddedNum}-*`);

  // Try to find matching folder
  const milestonesDir = path.join(PLANNING_DIR, 'milestones');
  if (pathExists(milestonesDir)) {
    const folders = fs.readdirSync(milestonesDir);
    const match = folders.find(f => f.startsWith(paddedNum + '-'));
    if (match) {
      return { path: path.join(milestonesDir, match), exists: true };
    }
  }

  return { path: path.join(milestonesDir, `${paddedNum}-milestone`), exists: false };
}

module.exports = {
  PLANNING_DIR,
  LEGACY_DIR,
  pathExists,
  ensureDir,
  resolveBriefPath,
  resolveProjectIdsPath,
  resolveProgressPath,
  resolveStatePath,
  resolveShardPath,
  resolveMilestonePath
};
