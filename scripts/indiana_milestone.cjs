const fs = require('fs');
const { execSync } = require('child_process');

const MILESTONE_WEBHOOK = process.env.MILESTONE_WEBHOOK || "https://ai.bsbsbs.au/webhook/indiana-milestone";
const GITHUB_ORG = process.env.GITHUB_ORG || 'shoomacca';

async function fetchWithRetry(url, options = {}, retries = 3, timeout = 30000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (attempt === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
    }
  }
}

function loadProjectIds() {
  const idsPath = './.antigravity/PROJECT_IDS.json';
  if (!fs.existsSync(idsPath)) {
    console.error('PROJECT_IDS.json not found at ./.antigravity/PROJECT_IDS.json');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(idsPath, 'utf8'));
}

function loadProgress() {
  const progressPath = './.antigravity/status/progress.json';
  if (!fs.existsSync(progressPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(progressPath, 'utf8'));
  } catch {
    return null;
  }
}

function extractSection(content, heading) {
  const regex = new RegExp(`##\s+${heading}([\s\S]*?)(?=\n##\s+|$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

function parseListLines(section) {
  return section
    .split('\n')
    .map((line) => line.replace(/^[-*\d.\s]+/, '').trim())
    .filter(Boolean);
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  entries.forEach((entry) => {
    const fullPath = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      files.push(...listFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  });

  return files;
}

function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch {
    return 0;
  }
}

function summarizeArtifacts() {
  const trackedDirs = ['app', 'lib', 'supabase/migrations', 'types'];
  const artifacts = trackedDirs
    .map((dir) => ({ dir, files: listFiles(dir) }))
    .filter((entry) => entry.files.length > 0);

  const totals = artifacts.reduce(
    (acc, entry) => {
      const lineCount = entry.files.reduce((sum, file) => sum + countLines(file), 0);
      acc.files += entry.files.length;
      acc.lines += lineCount;
      return acc;
    },
    { files: 0, lines: 0 }
  );

  return { artifacts, totals };
}

function buildMilestoneNotes(progress, milestoneId) {
  if (!progress?.milestones?.length || !milestoneId) return '';

  const milestone = progress.milestones.find((entry) => entry.id === milestoneId);
  if (!milestone) return '';

  const shardDetails = (milestone.shards || []).map((shard) => {
    const shardPath = `./.antigravity/shards/${shard.file}`;
    let objective = '';
    let actions = [];

    if (shard.file && fs.existsSync(shardPath)) {
      const content = fs.readFileSync(shardPath, 'utf8');
      objective = extractSection(content, 'Objective') || '';
      const actionsSection = extractSection(content, 'Actions');
      actions = parseListLines(actionsSection).slice(0, 6);
    }

    return {
      id: shard.id,
      name: shard.name,
      status: shard.status,
      objective,
      actions
    };
  });

  const completedShards = shardDetails.filter((detail) => detail.status === 'complete');
  const { artifacts, totals } = summarizeArtifacts();

  const nextMilestone = progress.milestones.find((entry) => entry.status !== 'complete');
  const nextShard = nextMilestone?.shards?.find((shard) => shard.status !== 'complete');

  const lines = [];
  lines.push(`## Milestone ${milestone.id}: ${milestone.name} - COMPLETE`);
  lines.push('');
  lines.push(`Status: ${completedShards.length}/${shardDetails.length} shards complete`);
  lines.push('');
  lines.push('### What Was Built');
  shardDetails.forEach((detail) => {
    lines.push(`- ${detail.id} ${detail.name} (${detail.status})`);
    if (detail.objective) {
      lines.push(`  - Objective: ${detail.objective}`);
    }
    if (detail.actions.length) {
      lines.push(`  - Actions: ${detail.actions.join('; ')}`);
    }
  });

  if (artifacts.length) {
    lines.push('');
    lines.push(`### Artifacts (${totals.lines} lines across ${totals.files} files)`);
    artifacts.forEach((entry) => {
      lines.push(`- ${entry.dir}: ${entry.files.length} files`);
      entry.files.slice(0, 6).forEach((file) => {
        lines.push(`  - ${file}`);
      });
      if (entry.files.length > 6) {
        lines.push(`  - ... +${entry.files.length - 6} more`);
      }
    });
  }

  lines.push('');
  lines.push('### Next Steps');
  if (nextShard && nextMilestone) {
    lines.push(
      `- Next shard: ${nextMilestone.id}/${nextShard.id} ${nextShard.name} (status: ${nextShard.status})`
    );
  } else {
    lines.push('- All milestones complete. Ready for audit and ship.');
  }

  return lines.join('\n');
}

async function reportMilestone() {
  const projectIds = loadProjectIds();
  const args = process.argv.slice(2);

  const agent = args[0] || '@Developer';
  const milestone = args[1] || 'CHECKPOINT';
  const nextAgent = args[2] || 'TBD';
  const summary = args[3] || 'Milestone reached';
  const completedTasks = args[4] ? JSON.parse(args[4]) : [];
  const manualNotes = args[5] || '';
  const milestoneIdMatch = milestone.match(/(M\d+)/i);
  const milestoneId = milestoneIdMatch ? milestoneIdMatch[1].toUpperCase() : null;
  const progress = loadProgress();
  const autoNotes = buildMilestoneNotes(progress, milestoneId);
  const milestoneNotes = [autoNotes, manualNotes].filter(Boolean).join('\n\n');

  const completedLinearTasks = completedTasks
    .map(taskId => {
      const task = projectIds.tasks?.[taskId];
      if (!task) return null;
      return {
        taskId,
        linearId: task.linearId,
        linearIdentifier: task.linearIdentifier,
        linearUrl: task.linearUrl
      };
    })
    .filter(Boolean);

  const payload = {
    projectName: projectIds.projectName,
    agent,
    milestone,
    completedTasks,
    completedLinearTasks,
    nextAgent,
    summary,
    milestone_notes: milestoneNotes,
    linearProjectId: projectIds.linear?.projectId,
    linearTeamId: projectIds.linear?.teamId,
    githubRepoId: projectIds.github?.id,
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetchWithRetry(MILESTONE_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, 3, 30000);

    if (!response.ok) {
      console.error(`Milestone webhook failed: HTTP ${response.status} ${response.statusText}`);
    } else {
      const result = await response.json().catch(() => null);
      console.log('Milestone webhook response:', result || { ok: true });
    }
  } catch (error) {
    console.error('Milestone webhook failed:', error.message);
  }

  try {
    if (!fs.existsSync('./.git')) {
      execSync('git init', { stdio: 'inherit' });
    }

    const remoteUrl = projectIds.github?.url;
    if (remoteUrl) {
      try {
        execSync('git remote get-url origin', { stdio: 'ignore' });
      } catch {
        execSync(`git remote add origin ${remoteUrl}`, { stdio: 'inherit' });
      }
    }

    execSync('git add -A', { stdio: 'inherit' });
    execSync(`git commit -m "[${agent}] ${milestone}: ${summary}"`, { stdio: 'inherit' });

    try {
      execSync('git rev-parse --verify dev', { stdio: 'ignore' });
    } catch {
      execSync('git checkout -b dev', { stdio: 'inherit' });
    }

    if (remoteUrl) {
      execSync('git push -u origin dev', { stdio: 'inherit' });
    } else {
      console.log('No GitHub remote URL available; skipping push.');
    }
  } catch {
    console.log('Git commit/push skipped or failed.');
  }
}

reportMilestone();
