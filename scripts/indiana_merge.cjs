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
    console.error('PROJECT_IDS.json not found');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(idsPath, 'utf8'));
}

async function mergeAndDeploy() {
  const projectIds = loadProjectIds();

  execSync('git fetch origin', { stdio: 'inherit' });
  try {
    execSync('git checkout main', { stdio: 'pipe' });
  } catch {
    execSync('git checkout -b main', { stdio: 'pipe' });
  }

  try {
    execSync('git pull origin main', { stdio: 'pipe' });
  } catch {
    // ignore
  }

  execSync('git merge dev -m "Merge dev: Project complete"', { stdio: 'inherit' });
  execSync('git push -u origin main', { stdio: 'inherit' });

  const payload = {
    projectName: projectIds.projectName,
    agent: '@Overseer',
    milestone: 'SHIPPED',
    completedTasks: Object.keys(projectIds.tasks || {}),
    nextAgent: 'None',
    summary: 'Project shipped',
    linearProjectId: projectIds.linear?.projectId,
    linearTeamId: projectIds.linear?.teamId,
    githubRepoId: projectIds.github?.id,
    timestamp: new Date().toISOString()
  };

  try {
    await fetchWithRetry(MILESTONE_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, 3, 30000);
  } catch (error) {
    console.error('Completion webhook failed:', error.message);
  }

  try {
    execSync('node ng-export.js', { stdio: 'inherit' });
  } catch {
    console.log('Report generation failed.');
  }

  console.log('<promise>SHIPPED</promise>');
}

mergeAndDeploy();
