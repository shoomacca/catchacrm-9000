/**
 * Indiana Genesis - Infrastructure Creation
 * Creates GitHub repo, Linear project, and Vercel project
 */

const fs = require('fs');
const path = require('path');
const { resolveBriefPath, PLANNING_DIR, LEGACY_DIR, ensureDir } = require('./paths.js');

// Configuration
const INDIANA_WEBHOOK = process.env.INDIANA_WEBHOOK || 'https://ai.bsbsbs.au/webhook/indiana-genesis';
const RESEARCH_WEBHOOK_URL = process.env.RESEARCH_WEBHOOK_URL || 'https://ai.bsbsbs.au/webhook/research_role';
const GITHUB_ORG = process.env.GITHUB_ORG || 'shoomacca';
const DRY_RUN = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true';

/**
 * Fetch with retry logic
 */
async function fetchWithRetry(url, options = {}, retries = 3, timeout = 30000) {
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
 * Validate BRIEF.md structure
 */
function validateBrief(brief) {
  const errors = [];

  if (!brief.includes('PROJECT BRIEF')) {
    errors.push('Missing PROJECT BRIEF header');
  }
  if (!brief.includes('Archetype')) {
    errors.push('Missing Archetype field');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Sanitize values to remove template expressions
 */
function sanitizeValue(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();

  // Detect unresolved template expressions
  if (
    trimmed.startsWith('={{') ||
    trimmed.includes('{{') ||
    trimmed.includes('}}') ||
    trimmed.includes('$(')
  ) {
    return null;
  }

  return value;
}

/**
 * Build fallback task mapping
 */
function buildTaskFallback(tasks) {
  return tasks.reduce((acc, task) => {
    acc[task.id] = {
      linearId: null,
      linearIdentifier: null,
      linearUrl: null,
      title: task.title || ''
    };
    return acc;
  }, {});
}

/**
 * Main Indiana Genesis function
 */
async function triggerIndiana() {
  console.log('Indiana Genesis - Starting infrastructure creation...\n');

  // 1. Find and read BRIEF.md
  const briefResolution = resolveBriefPath();
  if (briefResolution.missing || !fs.existsSync(briefResolution.path)) {
    console.error('Error: BRIEF.md not found');
    console.error('Expected at: .planning/BRIEF.md');
    console.error('Run /ng:new-project first to create project specification.');
    process.exit(1);
  }

  console.log(`Reading: ${briefResolution.path}`);
  const brief = fs.readFileSync(briefResolution.path, 'utf8');

  // 2. Validate BRIEF.md
  const validation = validateBrief(brief);
  if (!validation.valid) {
    console.error('BRIEF.md validation failed:');
    validation.errors.forEach(e => console.error('  -', e));
    process.exit(1);
  }

  // 3. Extract project info
  const nameMatch = brief.match(/# PROJECT BRIEF: (.*)/i) || brief.match(/# (.*)/);
  const projectName = nameMatch
    ? nameMatch[1].trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase()
    : 'project-' + Date.now();

  // 4. Extract tasks
  const taskRegex = /- \[ \] (TASK-\d+): (.+)/g;
  const tasks = [];
  let match;
  while ((match = taskRegex.exec(brief)) !== null) {
    tasks.push({ id: match[1], title: match[2].trim() });
  }

  // 5. Extract archetype
  const archetypeMatch = brief.match(/Archetype.*?TYPE (\d+)/i);
  const archetype = archetypeMatch ? 'TYPE ' + archetypeMatch[1] : 'Unknown';

  console.log(`\nProject: ${projectName}`);
  console.log(`Archetype: ${archetype}`);
  console.log(`Tasks: ${tasks.length}`);

  // 6. Build payload
  const payload = {
    projectName,
    archetype,
    brief,
    tasks,
    researchWebhookUrl: RESEARCH_WEBHOOK_URL,
    timestamp: new Date().toISOString()
  };

  // 7. Dry run mode
  if (DRY_RUN) {
    console.log('\n[DRY RUN] Would send to:', INDIANA_WEBHOOK);
    console.log('[DRY RUN] Payload:', JSON.stringify({ projectName, archetype, taskCount: tasks.length }, null, 2));
    return;
  }

  // 8. Call webhook
  console.log('\nCalling Indiana Genesis webhook...');
  const response = await fetchWithRetry(INDIANA_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 3, 60000);

  if (!response.ok) {
    console.error(`HTTP ${response.status}: ${response.statusText}`);
    process.exit(1);
  }

  const result = await response.json();
  const resultData = Array.isArray(result) ? result[0] : result;

  if (!resultData || !resultData.success) {
    console.error('Genesis failed:', resultData?.error || 'unknown error');
    process.exit(1);
  }

  // 9. Build PROJECT_IDS.json
  const projectIds = {
    projectName: sanitizeValue(resultData.project?.name) || projectName,
    archetype: sanitizeValue(resultData.archetype) || archetype,
    createdAt: new Date().toISOString(),
    github: {
      id: sanitizeValue(resultData.project?.github?.id) || null,
      nodeId: sanitizeValue(resultData.project?.github?.nodeId) || null,
      url: sanitizeValue(resultData.project?.github?.url || resultData.githubUrl) || null
    },
    linear: {
      projectId: sanitizeValue(resultData.project?.linear?.projectId) || null,
      teamId: resultData.project?.linear?.teamId || 'bsbsbs',
      projectUrl: sanitizeValue(resultData.project?.linear?.url || resultData.linearUrl) || null
    },
    vercel: {
      projectId: sanitizeValue(resultData.project?.vercel?.projectId) || null,
      url: sanitizeValue(resultData.project?.vercel?.url || resultData.vercelUrl) || null
    },
    tasks: {},
    webhooks: {
      research: RESEARCH_WEBHOOK_URL
    }
  };

  // 10. Map tasks
  if (Array.isArray(resultData.tasks) && resultData.tasks.length > 0) {
    resultData.tasks.forEach(task => {
      projectIds.tasks[task.taskId] = {
        linearId: sanitizeValue(task.linear?.id) || null,
        linearIdentifier: sanitizeValue(task.linear?.identifier) || null,
        linearUrl: sanitizeValue(task.linear?.url) || null,
        title: task.title || ''
      };
    });
  } else {
    projectIds.tasks = buildTaskFallback(tasks);
  }

  // 11. Save PROJECT_IDS.json
  ensureDir(PLANNING_DIR);
  const planningIdsPath = path.join(PLANNING_DIR, 'PROJECT_IDS.json');
  fs.writeFileSync(planningIdsPath, JSON.stringify(projectIds, null, 2));
  console.log(`\nSaved: ${planningIdsPath}`);

  // 12. Also save to legacy path if exists
  if (briefResolution.mode === 'legacy' || fs.existsSync(LEGACY_DIR)) {
    ensureDir(LEGACY_DIR);
    const legacyIdsPath = path.join(LEGACY_DIR, 'PROJECT_IDS.json');
    fs.writeFileSync(legacyIdsPath, JSON.stringify(projectIds, null, 2));
    console.log(`Saved: ${legacyIdsPath} (legacy)`);
  }

  // 13. Output summary
  console.log('\n' + '='.repeat(50));
  console.log('INDIANA GENESIS COMPLETE');
  console.log('='.repeat(50));
  if (projectIds.github.url) console.log(`GitHub:  ${projectIds.github.url}`);
  if (projectIds.linear.projectUrl) console.log(`Linear:  ${projectIds.linear.projectUrl}`);
  if (projectIds.vercel.url) console.log(`Vercel:  ${projectIds.vercel.url}`);
  console.log('='.repeat(50));
}

// Run
triggerIndiana().catch(error => {
  console.error('Indiana Genesis failed:', error.message);
  process.exit(1);
});
