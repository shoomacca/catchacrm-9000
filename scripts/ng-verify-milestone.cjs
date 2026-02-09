
/**
 * ng-verify-milestone.js
 * Verify milestone completion checklist before marking as complete
 *
 * Usage: node scripts/ng-verify-milestone.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..');
const PROGRESS_PATH = path.join(PROJECT_ROOT, '.antigravity', 'status', 'progress.json');

function readProgress() {
  if (!fs.existsSync(PROGRESS_PATH)) {
    console.log('   ❌ progress.json not found\n');
    return null;
  }

  const content = fs.readFileSync(PROGRESS_PATH, 'utf-8');
  return JSON.parse(content);
}

function getActiveMilestone(progress) {
  const milestones = progress?.milestones || [];
  return (
    milestones.find((milestone) => milestone.status === 'in_progress') ||
    milestones.find((milestone) => milestone.status === 'pending') ||
    milestones[milestones.length - 1]
  );
}

function checkBuildPasses() {
  console.log('🔨 Checking if build passes...');

  try {
    execSync('npm run build', { cwd: PROJECT_ROOT, stdio: 'ignore' });
    console.log('   ✅ Build successful\n');
    return true;
  } catch (err) {
    console.log('   ❌ Build failed\n');
    return false;
  }
}

function checkMilestoneShards(milestone) {
  console.log('🧩 Checking milestone shard completion...\n');

  if (!milestone) {
    console.log('   ⚠️  No milestone found\n');
    return null;
  }

  const shards = milestone.shards || [];
  const incomplete = shards.filter((shard) => shard.status !== 'complete');

  console.log(`   Milestone ${milestone.id}: ${milestone.name}`);
  console.log(`   Status: ${milestone.status}`);
  console.log(`   Shards complete: ${shards.length - incomplete.length}/${shards.length}\n`);

  if (incomplete.length === 0) {
    console.log('   ✅ All shards complete\n');
    return true;
  }

  console.log('   ⚠️  Incomplete shards:');
  incomplete.forEach((shard) => {
    console.log(`      - ${shard.id}: ${shard.name} (${shard.status})`);
  });
  console.log('');
  return false;
}

function checkGitStatus() {
  console.log('🔍 Checking git status...\n');

  try {
    const status = execSync('git status --short', {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8'
    });

    if (status.trim() === '') {
      console.log('   ✅ Working directory clean (all changes committed)\n');
      return true;
    }

    console.log('   ⚠️  Uncommitted changes detected:\n');
    console.log(status.split('\n').map((line) => `      ${line}`).join('\n'));
    console.log('');
    return false;
  } catch (err) {
    console.log('   ⚠️  Could not check git status\n');
    return null;
  }
}

function checkRecentCommits() {
  console.log('📜 Checking recent commits...\n');

  try {
    const commits = execSync('git log --oneline -5', {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8'
    });

    console.log('   Recent commits:');
    console.log(commits.split('\n').map((line) => `      ${line}`).join('\n'));
    console.log('');

    const commitLines = commits.split('\n').filter((line) => line.trim());
    const properFormat = commitLines.every((line) =>
      /^[a-f0-9]+\s+(feat|fix|docs|test|refactor|style|chore)\([^)]+\):/.test(line)
    );

    if (properFormat) {
      console.log('   ✅ All commits follow proper format\n');
      return true;
    }

    console.log('   ⚠️  Some commits may not follow Genesis format\n');
    return false;
  } catch (err) {
    console.log('   ⚠️  Could not check git commits\n');
    return null;
  }
}

function checkProgressFreshness() {
  console.log('📄 Checking progress.json freshness...\n');

  if (!fs.existsSync(PROGRESS_PATH)) {
    console.log('   ❌ progress.json not found\n');
    return false;
  }

  const stats = fs.statSync(PROGRESS_PATH);
  const hoursSinceUpdate = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);

  if (hoursSinceUpdate < 24) {
    console.log(`   ✅ progress.json updated recently (${Math.round(hoursSinceUpdate)} hours ago)\n`);
    return true;
  }

  console.log(`   ⚠️  progress.json not updated in ${Math.round(hoursSinceUpdate)} hours\n`);
  return false;
}

function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('  NEW GENESIS - MILESTONE VERIFICATION');
  console.log('='.repeat(80) + '\n');

  const progress = readProgress();
  const activeMilestone = getActiveMilestone(progress);

  const checks = {
    build: checkBuildPasses(),
    shards: checkMilestoneShards(activeMilestone),
    git: checkGitStatus(),
    commits: checkRecentCommits(),
    progressFresh: checkProgressFreshness()
  };

  console.log('='.repeat(80));
  console.log('📊 VERIFICATION SUMMARY:\n');

  const checklist = [
    { name: 'Build passes', status: checks.build },
    { name: 'All shards complete', status: checks.shards },
    { name: 'Working directory clean', status: checks.git },
    { name: 'Commits properly formatted', status: checks.commits },
    { name: 'progress.json updated', status: checks.progressFresh }
  ];

  checklist.forEach((item) => {
    const icon = item.status === true ? '✅' : item.status === false ? '❌' : '⚠️';
    console.log(`   ${icon} ${item.name}`);
  });

  const allPassed = checklist.every((item) => item.status === true);

  console.log('\n' + '='.repeat(80));

  if (allPassed && activeMilestone) {
    console.log('✅ MILESTONE READY FOR COMPLETION!\n');
    console.log('Next steps:');
    console.log('   1. Create SUMMARY.md documenting accomplishments');
    console.log(
      `   2. Run: node indiana_milestone.js "@Developer" "${activeMilestone.id}_COMPLETE" "@NextAgent" "Summary" '["TASK-IDs"]'`
    );
    console.log('   3. Update progress.json with milestone status');
    console.log('   4. Push to GitHub dev branch\n');
  } else {
    console.log('⚠️  MILESTONE NOT READY FOR COMPLETION\n');
    console.log('Please address the issues above before marking milestone complete.\n');
  }

  console.log('='.repeat(80) + '\n');

  return allPassed;
}

if (require.main === module) {
  const passed = generateReport();
  process.exit(passed ? 0 : 1);
}

module.exports = { generateReport };
