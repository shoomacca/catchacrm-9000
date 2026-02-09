/**
 * Indiana Milestone - Milestone Completion Reporter
 * Syncs milestone completion to Linear with DETAILED notes and marks tasks as DONE
 *
 * This script sends comprehensive milestone data to the webhook which:
 * 1. Marks all specified Linear tasks as DONE
 * 2. Adds detailed completion notes to each task
 * 3. Sends Telegram notification with summary
 */

const fs = require('fs');
const path = require('path');
const { resolveProjectIdsPath, resolveProgressPath, resolveMilestonePath, PLANNING_DIR } = require('./paths.js');

// Configuration
const MILESTONE_WEBHOOK = process.env.MILESTONE_WEBHOOK || 'https://ai.bsbsbs.au/webhook/indiana-milestone';
const DRY_RUN = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true';

/**
 * Fetch with retry logic
 */
async function fetchWithRetry(url, options = {}, retries = 3, timeout = 60000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (attempt === retries) throw error;
      console.log(`Retry ${attempt}/${retries}...`);
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
    }
  }
}

/**
 * List files recursively in a directory
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
 * Count lines of code in a file
 */
function countLines(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8').split('\n').length;
  } catch {
    return 0;
  }
}

/**
 * Get git diff stats for the milestone
 */
function getGitStats() {
  try {
    const { execSync } = require('child_process');
    const diffStat = execSync('git diff --stat HEAD~5 2>/dev/null || echo ""', { encoding: 'utf8' });
    const commitCount = execSync('git rev-list --count HEAD 2>/dev/null || echo "0"', { encoding: 'utf8' }).trim();
    return { diffStat: diffStat.trim(), commitCount: parseInt(commitCount, 10) };
  } catch {
    return { diffStat: '', commitCount: 0 };
  }
}

/**
 * Build comprehensive artifact summary
 */
function buildArtifactSummary() {
  const trackedDirs = ['app', 'lib', 'src', 'components', 'pages', 'api', 'supabase', 'types', 'utils', 'hooks'];
  const artifacts = [];

  for (const dir of trackedDirs) {
    if (fs.existsSync(dir)) {
      const files = listFilesRecursive(dir);
      const codeFiles = files.filter(f => /\.(ts|tsx|js|jsx|css|sql|json)$/.test(f));
      const totalLines = codeFiles.reduce((sum, f) => sum + countLines(f), 0);
      if (codeFiles.length > 0) {
        artifacts.push({
          directory: dir,
          fileCount: codeFiles.length,
          lineCount: totalLines,
          files: codeFiles.slice(0, 10).map(f => path.relative('.', f)) // Top 10 files
        });
      }
    }
  }

  return artifacts;
}

/**
 * Load shard details from milestone folder
 */
function loadShardDetails(milestoneId) {
  const milestoneNum = parseInt(milestoneId.replace(/\D/g, ''), 10);
  const { path: milestonePath, exists } = resolveMilestonePath(milestoneNum);

  if (!exists) return [];

  const shards = [];
  const files = fs.readdirSync(milestonePath);

  for (const file of files) {
    if (file.match(/^\d+-SHARD\.md$/i)) {
      const shardPath = path.join(milestonePath, file);
      const content = fs.readFileSync(shardPath, 'utf8');

      // Extract goal/objective
      const goalMatch = content.match(/##\s*(?:Goal|Objective)\s*\n([^\n#]+)/i);
      const goal = goalMatch ? goalMatch[1].trim() : '';

      // Extract tasks completed
      const tasksMatch = content.match(/##\s*Tasks[\s\S]*?(?=\n##|$)/i);
      const tasks = tasksMatch ? tasksMatch[0] : '';

      // Extract "Done When" criteria
      const doneMatch = content.match(/##\s*Done When[\s\S]*?(?=\n##|$)/i);
      const doneWhen = doneMatch ? doneMatch[0] : '';

      shards.push({
        file,
        goal,
        tasks: tasks.substring(0, 500), // Truncate for payload size
        doneWhen: doneWhen.substring(0, 300)
      });
    }
  }

  return shards;
}

/**
 * Build detailed notes for Linear task update
 */
function buildDetailedNotes(milestoneId, summary, shards, artifacts, gitStats) {
  const lines = [];
  const timestamp = new Date().toISOString();

  lines.push(`## Milestone ${milestoneId} - COMPLETE`);
  lines.push(`**Completed:** ${timestamp}`);
  lines.push('');
  lines.push(`### Summary`);
  lines.push(summary);
  lines.push('');

  // Shard breakdown
  if (shards.length > 0) {
    lines.push('### Shards Completed');
    for (const shard of shards) {
      lines.push(`- **${shard.file}**: ${shard.goal}`);
    }
    lines.push('');
  }

  // Artifact summary
  if (artifacts.length > 0) {
    const totalFiles = artifacts.reduce((sum, a) => sum + a.fileCount, 0);
    const totalLines = artifacts.reduce((sum, a) => sum + a.lineCount, 0);

    lines.push(`### Artifacts Created`);
    lines.push(`Total: **${totalFiles} files** with **${totalLines.toLocaleString()} lines of code**`);
    lines.push('');
    for (const artifact of artifacts) {
      lines.push(`- **${artifact.directory}/**: ${artifact.fileCount} files (${artifact.lineCount.toLocaleString()} lines)`);
    }
    lines.push('');
  }

  // Git stats
  if (gitStats.diffStat) {
    lines.push('### Git Changes');
    lines.push('```');
    lines.push(gitStats.diffStat.substring(0, 500));
    lines.push('```');
  }

  return lines.join('\n');
}

/**
 * Main function
 */
async function triggerMilestoneComplete() {
  // Parse arguments
  const args = process.argv.slice(2).filter(a => !a.startsWith('--'));

  if (args.length < 4) {
    console.log(`
Indiana Milestone - Report milestone completion with DETAILED Linear updates

Usage:
  node scripts/indiana_milestone.js <agent> <milestone> <nextAgent> <summary> [taskIds...] [notes]

Arguments:
  agent       Current agent (e.g., "@Developer")
  milestone   Milestone ID (e.g., "M01_COMPLETE" or "M01")
  nextAgent   Next agent/milestone (e.g., "@Automator" or "M02")
  summary     Brief summary of work done
  taskIds     (Optional) Completed task IDs as JSON array (e.g., '["TASK-001","TASK-002"]')
  notes       (Optional) Additional notes

What this does:
  1. Marks specified Linear tasks as DONE
  2. Adds detailed completion notes to each task
  3. Sends Telegram notification
  4. Logs milestone completion

Example:
  node scripts/indiana_milestone.js "@Developer" "M01_COMPLETE" "M02" "Built foundation with auth and database"
  node scripts/indiana_milestone.js "@Developer" "M01" "@Automator" "Built auth system" '["TASK-001","TASK-002"]'
`);
    process.exit(1);
  }

  const [agent, milestone, nextAgent, summary, taskIdsJson, additionalNotes] = args;

  // Parse task IDs
  let taskIds = [];
  if (taskIdsJson) {
    try {
      taskIds = JSON.parse(taskIdsJson);
      if (!Array.isArray(taskIds)) taskIds = [taskIds];
    } catch {
      taskIds = taskIdsJson.split(',').map(t => t.trim()).filter(Boolean);
    }
  }

  // Load PROJECT_IDS.json
  const { path: idsPath, missing } = resolveProjectIdsPath();
  if (missing || !fs.existsSync(idsPath)) {
    console.error('PROJECT_IDS.json not found.');
    console.error('Run /ng:new-project and node scripts/indiana.js first.');
    process.exit(1);
  }

  const projectIds = JSON.parse(fs.readFileSync(idsPath, 'utf8'));

  // Build Linear task references with identifiers (ANT-XXX format)
  const linearTasks = taskIds.map(taskId => {
    const task = projectIds.tasks[taskId];
    if (!task) {
      console.warn(`Warning: Task ${taskId} not found in PROJECT_IDS.json`);
      return { taskId, found: false };
    }
    return {
      taskId,
      found: true,
      linearId: task.linearId,
      linearIdentifier: task.linearIdentifier, // ANT-XXX format
      linearUrl: task.linearUrl,
      title: task.title,
      markAsDone: true // Signal to webhook to mark as DONE
    };
  });

  const foundTasks = linearTasks.filter(t => t.found);
  const missingTasks = linearTasks.filter(t => !t.found);

  // Extract milestone ID for shard loading
  const milestoneId = milestone.replace('_COMPLETE', '');

  // Gather comprehensive data
  const shards = loadShardDetails(milestoneId);
  const artifacts = buildArtifactSummary();
  const gitStats = getGitStats();

  // Build detailed notes
  const detailedNotes = buildDetailedNotes(milestoneId, summary, shards, artifacts, gitStats);

  // Combine with additional notes if provided
  const fullNotes = additionalNotes
    ? `${detailedNotes}\n\n---\n\n### Additional Notes\n${additionalNotes}`
    : detailedNotes;

  // Build payload
  const payload = {
    // Core identifiers
    agent,
    milestone: milestoneId,
    milestoneComplete: milestone.includes('COMPLETE'),
    nextAgent,

    // Project info
    projectName: projectIds.projectName,
    linearProjectId: projectIds.linear?.projectId,
    linearTeamId: projectIds.linear?.teamId || 'bsbsbs',
    githubUrl: projectIds.github?.url,

    // Tasks to mark as DONE
    linearTasks: foundTasks,
    taskIdentifiers: foundTasks.map(t => t.linearIdentifier).filter(Boolean), // ANT-XXX list

    // Detailed information
    summary,
    detailedNotes: fullNotes,

    // Metrics
    shardsCompleted: shards.length,
    shardDetails: shards,
    artifacts: artifacts,
    gitStats: {
      diffSummary: gitStats.diffStat.substring(0, 200),
      totalCommits: gitStats.commitCount
    },

    // Metadata
    timestamp: new Date().toISOString(),
    version: '4.3'
  };

  console.log('\n' + '='.repeat(60));
  console.log('INDIANA MILESTONE - Reporting to Linear');
  console.log('='.repeat(60));
  console.log(`Project:    ${projectIds.projectName}`);
  console.log(`Agent:      ${agent}`);
  console.log(`Milestone:  ${milestoneId}`);
  console.log(`Next:       ${nextAgent}`);
  console.log(`Tasks:      ${foundTasks.length} to mark as DONE`);
  if (foundTasks.length > 0) {
    console.log(`            ${foundTasks.map(t => t.linearIdentifier || t.taskId).join(', ')}`);
  }
  console.log(`Shards:     ${shards.length} completed`);
  console.log(`Artifacts:  ${artifacts.reduce((s, a) => s + a.fileCount, 0)} files`);
  console.log('='.repeat(60));

  if (missingTasks.length > 0) {
    console.log(`\nWarning: ${missingTasks.length} tasks not found in PROJECT_IDS.json:`);
    missingTasks.forEach(t => console.log(`  - ${t.taskId}`));
  }

  // Dry run mode
  if (DRY_RUN) {
    console.log('\n[DRY RUN] Would send to:', MILESTONE_WEBHOOK);
    console.log('[DRY RUN] Payload preview:');
    console.log(JSON.stringify({
      ...payload,
      detailedNotes: payload.detailedNotes.substring(0, 200) + '...'
    }, null, 2));
    return;
  }

  // Call webhook
  console.log('\nSending to webhook...');
  try {
    const response = await fetchWithRetry(MILESTONE_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, 3, 60000);

    if (!response.ok) {
      console.error(`HTTP ${response.status}: ${response.statusText}`);
      const text = await response.text();
      console.error('Response:', text.substring(0, 500));
    }

    let result;
    try {
      result = await response.json();
    } catch {
      result = { success: response.ok };
    }

    console.log('\n' + '='.repeat(60));
    if (result.success) {
      console.log('MILESTONE REPORTED SUCCESSFULLY');
      console.log('='.repeat(60));
      console.log(`Linear tasks marked DONE: ${foundTasks.length}`);
      if (result.linearUpdates) {
        console.log(`Linear response: ${JSON.stringify(result.linearUpdates)}`);
      }
      if (result.telegramSent) {
        console.log('Telegram notification: Sent');
      }
    } else {
      console.log('MILESTONE REPORTED (with warnings)');
      console.log('='.repeat(60));
      console.log('Check webhook logs for details');
      if (result.error) console.log(`Error: ${result.error}`);
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\nWebhook call failed:', error.message);
    console.log('Milestone data saved locally - manual Linear update may be needed');

    // Save failed payload for manual recovery
    const failedPath = path.join(PLANNING_DIR, `failed_milestone_${milestoneId}_${Date.now()}.json`);
    try {
      fs.writeFileSync(failedPath, JSON.stringify(payload, null, 2));
      console.log(`Payload saved to: ${failedPath}`);
    } catch {}
  }
}

// Run
triggerMilestoneComplete().catch(error => {
  console.error('Indiana Milestone failed:', error.message);
  process.exit(0); // Don't fail the pipeline for notification issues
});
