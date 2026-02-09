/**
 * Indiana Merge - Production Deployment
 * Merges dev to main and triggers production deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const { resolveProjectIdsPath } = require('./paths.js');

// Configuration
const MERGE_WEBHOOK = process.env.MERGE_WEBHOOK || 'https://ai.bsbsbs.au/webhook/indiana-merge';
const DRY_RUN = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true';

/**
 * Run git command
 */
function git(cmd) {
  console.log(`$ git ${cmd}`);
  try {
    return execSync(`git ${cmd}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (error) {
    throw new Error(`Git failed: ${error.message}`);
  }
}

/**
 * Fetch with retry
 */
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

/**
 * Main merge function
 */
async function triggerMerge() {
  console.log('='.repeat(50));
  console.log('INDIANA MERGE - Production Deployment');
  console.log('='.repeat(50));

  // 1. Check we're on dev branch
  const currentBranch = git('branch --show-current').trim();
  if (currentBranch !== 'dev') {
    console.error(`Error: Must be on 'dev' branch (currently on '${currentBranch}')`);
    console.error('Run: git checkout dev');
    process.exit(1);
  }
  console.log(`Current branch: ${currentBranch}`);

  // 2. Check for uncommitted changes
  const status = git('status --porcelain');
  if (status.trim()) {
    console.error('Error: Uncommitted changes detected');
    console.error('Commit or stash changes before merging');
    process.exit(1);
  }
  console.log('Working directory clean');

  // 3. Pull latest
  console.log('\nPulling latest from remote...');
  git('pull origin dev');

  // 4. Checkout main
  console.log('\nSwitching to main...');
  git('checkout main');
  git('pull origin main');

  // 5. Merge dev into main
  console.log('\nMerging dev into main...');
  if (DRY_RUN) {
    console.log('[DRY RUN] Would run: git merge dev');
  } else {
    git('merge dev --no-edit');
  }

  // 6. Push to main
  console.log('\nPushing to origin/main...');
  if (DRY_RUN) {
    console.log('[DRY RUN] Would run: git push origin main');
  } else {
    git('push origin main');
  }

  // 7. Switch back to dev
  git('checkout dev');

  // 8. Load project info
  const { path: idsPath, missing } = resolveProjectIdsPath();
  let projectName = 'unknown';
  let vercelUrl = null;

  if (!missing && fs.existsSync(idsPath)) {
    const ids = JSON.parse(fs.readFileSync(idsPath, 'utf8'));
    projectName = ids.projectName || 'unknown';
    vercelUrl = ids.vercel?.url;
  }

  // 9. Notify webhook
  if (!DRY_RUN) {
    try {
      await fetchWithRetry(MERGE_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          action: 'merge',
          timestamp: new Date().toISOString()
        })
      });
    } catch {
      console.warn('Warning: Webhook notification failed (deployment still triggered)');
    }
  }

  // 10. Output
  console.log('\n' + '='.repeat(50));
  console.log('MERGE COMPLETE');
  console.log('='.repeat(50));
  console.log('Branch: main updated with dev');
  console.log('Vercel: Auto-deploying to production');
  if (vercelUrl) {
    console.log(`URL: ${vercelUrl}`);
  }
  console.log('='.repeat(50));
  console.log('\n<promise>SHIPPED</promise>');
}

// Run
triggerMerge().catch(error => {
  console.error('Indiana Merge failed:', error.message);
  // Try to switch back to dev
  try {
    execSync('git checkout dev', { stdio: 'ignore' });
  } catch {}
  process.exit(1);
});
