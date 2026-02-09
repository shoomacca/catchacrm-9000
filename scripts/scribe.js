/**
 * Scribe - State Management for New Genesis
 * Updates progress.json, syncs milestone completion, and tracks Linear tasks
 *
 * This script manages project state and coordinates with indiana_milestone.js
 * to send detailed updates to Linear.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { validateProjectIds } = require('./identity.js');
const { resolveProgressPath, resolveShardPath, resolveStatePath, resolveMilestonePath, PLANNING_DIR } = require('./paths.js');

/**
 * Load progress.json
 */
function loadProgress() {
  const { path: progressPath, mode, missing } = resolveProgressPath();

  if (missing || !fs.existsSync(progressPath)) {
    console.error('progress.json not found.');
    console.error('Run /ng:shatter first to create milestone shards.');
    process.exit(1);
  }

  const progress = JSON.parse(fs.readFileSync(progressPath, 'utf8'));
  return { progress, progressPath, mode };
}

/**
 * Save progress.json
 */
function saveProgress(progress, progressPath) {
  progress.lastUpdate = new Date().toISOString();
  fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
}

/**
 * Update shard status
 */
function updateShardStatus(shardId, status) {
  const { progress, progressPath } = loadProgress();

  let found = false;
  let milestoneId = null;

  for (const milestone of progress.milestones || []) {
    for (const shard of milestone.shards || []) {
      if (shard.id === shardId) {
        shard.status = status;
        if (status === 'complete') {
          shard.completedAt = new Date().toISOString();
        }
        found = true;
        milestoneId = milestone.id;
      }
    }
  }

  if (!found) {
    console.error(`Shard ${shardId} not found in progress.json`);
    process.exit(1);
  }

  saveProgress(progress, progressPath);
  console.log(`Updated ${shardId} to ${status}`);

  // Update STATE.md
  updateStateFile(shardId, status, milestoneId);

  return { milestoneId };
}

/**
 * Update STATE.md with current position
 */
function updateStateFile(shardId, status, milestoneId) {
  const { path: statePath, missing } = resolveStatePath();
  if (missing) return;

  const timestamp = new Date().toISOString();
  const stateContent = `# Project State

**Last Updated:** ${timestamp}

## Current Position
- **Milestone:** ${milestoneId}
- **Last Shard:** ${shardId}
- **Status:** ${status}

## Next Session
${status === 'complete' ? `Continue with next shard or run \`/ng:verify ${milestoneId.replace('M', '')}\` if all shards complete.` : `Resume ${shardId} - currently ${status}`}

---

*Updated by scribe.js*
`;

  try {
    // Read existing STATE.md and preserve important sections
    let existingState = '';
    if (fs.existsSync(statePath)) {
      existingState = fs.readFileSync(statePath, 'utf8');
    }

    // Preserve decisions and blockers sections
    const decisionsMatch = existingState.match(/## Key Decisions[\s\S]*?(?=\n## |$)/);
    const blockersMatch = existingState.match(/## Blockers[\s\S]*?(?=\n## |$)/);

    let newContent = stateContent;
    if (decisionsMatch) {
      newContent += '\n' + decisionsMatch[0];
    }
    if (blockersMatch) {
      newContent += '\n' + blockersMatch[0];
    }

    fs.writeFileSync(statePath, newContent);
  } catch (error) {
    console.warn('Warning: Could not update STATE.md:', error.message);
  }
}

/**
 * List files recursively
 */
function listFilesRecursive(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listFilesRecursive(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Count lines in file
 */
function countLines(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8').split('\n').length;
  } catch {
    return 0;
  }
}

/**
 * Extract section from markdown
 */
function extractSection(content, heading) {
  const regex = new RegExp(`##\\s+${heading}([\\s\\S]*?)(?=\\n##|$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

/**
 * Build detailed notes for milestone
 */
function buildDetailedNotes(milestoneId, mode) {
  const { progress } = loadProgress();
  const milestone = progress.milestones?.find(m => m.id === milestoneId);
  if (!milestone) return '';

  const lines = [];
  lines.push(`## Milestone ${milestone.id}: ${milestone.name} - COMPLETE`);
  lines.push(`**Completed:** ${new Date().toISOString()}`);
  lines.push('');

  const shards = milestone.shards || [];
  const completedShards = shards.filter(s => s.status === 'complete');
  lines.push(`**Progress:** ${completedShards.length}/${shards.length} shards complete`);
  lines.push('');

  // Shard details
  lines.push('### Shards Completed');
  for (const shard of shards) {
    const statusIcon = shard.status === 'complete' ? '[x]' : '[ ]';
    lines.push(`- ${statusIcon} **${shard.id}: ${shard.name}**`);

    // Try to load shard file for more details
    const shardPath = resolveShardPath(shard.file, mode);
    if (shardPath && fs.existsSync(shardPath)) {
      const content = fs.readFileSync(shardPath, 'utf8');
      const objective = extractSection(content, 'Objective') || extractSection(content, 'Goal');
      if (objective) {
        lines.push(`  - ${objective.substring(0, 150)}`);
      }
    }
  }
  lines.push('');

  // Count artifacts
  const trackedDirs = ['app', 'lib', 'src', 'components', 'pages', 'api', 'supabase', 'types', 'utils', 'hooks'];
  const artifacts = [];

  for (const dir of trackedDirs) {
    if (fs.existsSync(dir)) {
      const files = listFilesRecursive(dir);
      const codeFiles = files.filter(f => /\.(ts|tsx|js|jsx|css|sql)$/.test(f));
      if (codeFiles.length > 0) {
        const totalLines = codeFiles.reduce((sum, f) => sum + countLines(f), 0);
        artifacts.push({ dir, files: codeFiles.length, lines: totalLines });
      }
    }
  }

  if (artifacts.length > 0) {
    const totalFiles = artifacts.reduce((sum, a) => sum + a.files, 0);
    const totalLines = artifacts.reduce((sum, a) => sum + a.lines, 0);

    lines.push(`### Artifacts Created`);
    lines.push(`**Total:** ${totalFiles} files, ${totalLines.toLocaleString()} lines of code`);
    lines.push('');
    for (const artifact of artifacts) {
      lines.push(`- **${artifact.dir}/**: ${artifact.files} files (${artifact.lines.toLocaleString()} lines)`);
    }
  }

  return lines.join('\n');
}

/**
 * Get all task IDs for a milestone from BRIEF.md
 */
function getMilestoneTaskIds(milestoneId) {
  const briefPath = path.join(PLANNING_DIR, 'BRIEF.md');
  if (!fs.existsSync(briefPath)) return [];

  const brief = fs.readFileSync(briefPath, 'utf8');

  // Find tasks in the milestone section
  const milestoneNum = milestoneId.replace(/\D/g, '');
  const regex = new RegExp(`##.*M${milestoneNum}[:\\s][\\s\\S]*?(?=\\n## |$)`, 'i');
  const section = brief.match(regex);

  if (!section) {
    // Fallback: find all TASK-XXX in the document that might relate to this milestone
    const taskRegex = /- \[ \] (TASK-\d+):/g;
    const tasks = [];
    let match;
    while ((match = taskRegex.exec(brief)) !== null) {
      tasks.push(match[1]);
    }
    // Return subset based on milestone number (rough estimate)
    const start = (parseInt(milestoneNum, 10) - 1) * 5;
    return tasks.slice(start, start + 5);
  }

  // Extract TASK-XXX from the section
  const taskRegex = /- \[ \] (TASK-\d+):/g;
  const tasks = [];
  let match;
  while ((match = taskRegex.exec(section[0])) !== null) {
    tasks.push(match[1]);
  }

  return tasks;
}

/**
 * Complete a milestone - main function
 */
function completeMilestone(milestoneId, agent, summary, explicitTaskIds = []) {
  console.log('\n' + '='.repeat(60));
  console.log(`SCRIBE - Completing Milestone ${milestoneId}`);
  console.log('='.repeat(60));

  // Validate project IDs exist
  let projectIds;
  try {
    projectIds = validateProjectIds();
  } catch (error) {
    console.error('Error: PROJECT_IDS.json not found or invalid');
    console.error('Run /ng:new-project and node scripts/indiana.js first');
    process.exit(1);
  }

  const { progress, progressPath, mode } = loadProgress();

  // Find milestone
  const milestone = progress.milestones?.find(m => m.id === milestoneId);
  if (!milestone) {
    console.error(`Milestone ${milestoneId} not found in progress.json`);
    process.exit(1);
  }

  // Check all shards are complete
  const shards = milestone.shards || [];
  const incompleteShards = shards.filter(s => s.status !== 'complete');

  if (incompleteShards.length > 0) {
    console.error('\nError: Not all shards are complete!');
    console.error('Incomplete shards:');
    incompleteShards.forEach(s => console.error(`  - ${s.id}: ${s.name} (${s.status})`));
    console.error('\nRun /ng:execute for each incomplete shard first.');
    process.exit(1);
  }

  // Get task IDs - explicit or from BRIEF.md
  let taskIds = explicitTaskIds.length > 0
    ? explicitTaskIds
    : getMilestoneTaskIds(milestoneId);

  console.log(`\nMilestone: ${milestone.name}`);
  console.log(`Shards: ${shards.length} complete`);
  console.log(`Tasks: ${taskIds.length} to mark as DONE`);
  if (taskIds.length > 0) {
    console.log(`  ${taskIds.join(', ')}`);
  }

  // Build detailed notes
  const detailedNotes = buildDetailedNotes(milestoneId, mode);

  console.log('\n--- Milestone Notes Preview ---');
  console.log(detailedNotes.substring(0, 500) + (detailedNotes.length > 500 ? '...' : ''));
  console.log('--- End Preview ---\n');

  // Determine next agent/milestone
  const milestoneIndex = progress.milestones.findIndex(m => m.id === milestoneId);
  const nextMilestone = progress.milestones[milestoneIndex + 1];
  const nextAgent = nextMilestone ? nextMilestone.id : '@Overseer';

  // Call indiana_milestone.js with comprehensive data
  const scriptPath = path.join(__dirname, 'indiana_milestone.js');
  const args = [
    agent,
    `${milestoneId}_COMPLETE`,
    nextAgent,
    summary,
    JSON.stringify(taskIds),
    detailedNotes
  ].map(a => `"${String(a).replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`).join(' ');

  console.log('Calling indiana_milestone.js...');
  try {
    execSync(`node "${scriptPath}" ${args}`, { stdio: 'inherit', cwd: process.cwd() });
  } catch (error) {
    console.warn('\nWarning: indiana_milestone.js reported issues');
    console.warn('Continuing with local state update...');
  }

  // Update progress.json
  milestone.status = 'complete';
  milestone.completedAt = new Date().toISOString();
  saveProgress(progress, progressPath);

  // Create SUMMARY.md in milestone folder
  const milestoneNum = parseInt(milestoneId.replace(/\D/g, ''), 10);
  const { path: milestonePath, exists } = resolveMilestonePath(milestoneNum);

  if (exists) {
    const summaryPath = path.join(milestonePath, 'SUMMARY.md');
    const summaryContent = `# ${milestone.name} - Summary

**Status:** Complete
**Completed:** ${new Date().toISOString()}

## Summary
${summary}

${detailedNotes}

---
*Generated by scribe.js*
`;
    fs.writeFileSync(summaryPath, summaryContent);
    console.log(`Created: ${summaryPath}`);
  }

  // Final output
  console.log('\n' + '='.repeat(60));
  console.log('MILESTONE COMPLETE');
  console.log('='.repeat(60));
  console.log(`Milestone: ${milestoneId} - ${milestone.name}`);
  console.log(`Tasks marked DONE: ${taskIds.length}`);
  console.log(`Next: ${nextAgent}`);
  console.log('='.repeat(60));

  return { milestone, nextAgent, taskIds };
}

/**
 * Show current status
 */
function showStatus() {
  const { progress } = loadProgress();

  console.log('\n' + '='.repeat(50));
  console.log('PROJECT STATUS');
  console.log('='.repeat(50));
  console.log(`Project: ${progress.project || 'Unknown'}`);
  console.log(`Version: ${progress.version || '4.3'}`);
  console.log(`Last Update: ${progress.lastUpdate || 'N/A'}`);
  console.log('');

  for (const milestone of progress.milestones || []) {
    const shards = milestone.shards || [];
    const complete = shards.filter(s => s.status === 'complete').length;
    const statusIcon = milestone.status === 'complete' ? '[x]' : complete > 0 ? '[-]' : '[ ]';

    console.log(`${statusIcon} ${milestone.id}: ${milestone.name} (${complete}/${shards.length} shards)`);

    for (const shard of shards) {
      const shardIcon = shard.status === 'complete' ? '[x]' : '[ ]';
      console.log(`    ${shardIcon} ${shard.id}: ${shard.name}`);
    }
  }

  console.log('='.repeat(50));
}

/**
 * Print help
 */
function printHelp() {
  console.log(`
Scribe - New Genesis State Manager

Usage:
  node scripts/scribe.js <command> [options]

Commands:
  --status
      Show current project status and progress

  --complete <SHARD_ID>
      Mark a shard as complete
      Example: node scripts/scribe.js --complete M01_01

  --milestone <ID> <AGENT> <SUMMARY> [TASK_IDS...]
      Complete a milestone and sync to Linear
      Example: node scripts/scribe.js --milestone M01 @Developer "Built foundation" TASK-001 TASK-002

  --help
      Show this help message

What --milestone does:
  1. Validates all shards are complete
  2. Builds detailed completion notes
  3. Calls indiana_milestone.js to update Linear
  4. Creates SUMMARY.md in milestone folder
  5. Updates progress.json and STATE.md

Examples:
  # Mark single shard complete
  node scripts/scribe.js --complete M01_01

  # Complete milestone with auto-detected tasks
  node scripts/scribe.js --milestone M01 @Developer "Built foundation with auth"

  # Complete milestone with explicit task IDs
  node scripts/scribe.js --milestone M01 @Developer "Built auth" TASK-001 TASK-002 TASK-003
`);
}

// Parse arguments
const args = process.argv.slice(2);

if (args[0] === '--help' || args[0] === '-h' || args.length === 0) {
  printHelp();
} else if (args[0] === '--complete') {
  const shardId = args[1];
  if (!shardId) {
    console.error('Error: SHARD_ID required');
    console.error('Usage: node scripts/scribe.js --complete <SHARD_ID>');
    process.exit(1);
  }
  updateShardStatus(shardId, 'complete');
} else if (args[0] === '--milestone') {
  const [, milestoneId, agent, summary, ...taskIds] = args;
  if (!milestoneId || !agent || !summary) {
    console.error('Error: Missing required arguments');
    console.error('Usage: node scripts/scribe.js --milestone <ID> <AGENT> <SUMMARY> [TASK_IDS...]');
    process.exit(1);
  }
  completeMilestone(milestoneId, agent, summary, taskIds);
} else if (args[0] === '--status') {
  showStatus();
} else {
  console.error('Unknown command:', args[0]);
  printHelp();
  process.exit(1);
}

module.exports = { updateShardStatus, completeMilestone, buildDetailedNotes, showStatus };
