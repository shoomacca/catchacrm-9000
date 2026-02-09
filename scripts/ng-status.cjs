
/**
 * ng-status.js
 * Quick project status overview - reads progress.json and displays current position
 *
 * Usage: node scripts/ng-status.js
 */

const fs = require('fs');
const path = require('path');

const PROGRESS_PATH = path.join(__dirname, '..', '.antigravity', 'status', 'progress.json');

function buildProgressBar(completed, total, width = 20) {
  if (total === 0) return '○'.repeat(width);
  const filled = Math.round((completed / total) * width);
  return '●'.repeat(filled) + '○'.repeat(width - filled);
}

function getCurrentMilestone(milestones) {
  return (
    milestones.find((milestone) => milestone.status === 'in_progress') ||
    milestones.find((milestone) => milestone.status === 'pending') ||
    milestones[milestones.length - 1]
  );
}

function getCurrentShard(milestone) {
  if (!milestone?.shards?.length) return null;
  return (
    milestone.shards.find((shard) => shard.status === 'in_progress') ||
    milestone.shards.find((shard) => shard.status === 'pending') ||
    milestone.shards[milestone.shards.length - 1]
  );
}

function parseProgress() {
  if (!fs.existsSync(PROGRESS_PATH)) {
    console.error('❌ progress.json not found at:', PROGRESS_PATH);
    process.exit(1);
  }

  const content = fs.readFileSync(PROGRESS_PATH, 'utf-8');
  const progress = JSON.parse(content);

  const milestones = progress.milestones || [];
  const completed = milestones.filter((milestone) => milestone.status === 'complete').length;
  const total = milestones.length;

  const currentMilestone = getCurrentMilestone(milestones);
  const currentShard = getCurrentShard(currentMilestone);

  return {
    project: progress.project || 'Unknown',
    archetype: progress.archetype || 'Unknown',
    environment: progress.environment || 'Unknown',
    lastUpdate: progress.lastUpdate || 'Unknown',
    completed,
    total,
    progressBar: buildProgressBar(completed, total),
    currentMilestone,
    currentShard
  };
}

function displayStatus() {
  console.log('\n' + '='.repeat(80));
  console.log('  NEW GENESIS - PROJECT STATUS');
  console.log('='.repeat(80) + '\n');

  const state = parseProgress();

  console.log(`📌 PROJECT: ${state.project}`);
  console.log(`🧭 ARCHETYPE: ${state.archetype}`);
  console.log(`🧪 ENVIRONMENT: ${state.environment}`);
  console.log(`📅 LAST UPDATE: ${state.lastUpdate}`);
  console.log(`📊 PROGRESS: ${state.progressBar} ${state.completed}/${state.total}\n`);

  if (state.currentMilestone) {
    console.log(`🎯 CURRENT MILESTONE: ${state.currentMilestone.id} - ${state.currentMilestone.name}`);
    console.log(`   STATUS: ${state.currentMilestone.status}`);
  }

  if (state.currentShard) {
    console.log(`⚙️  CURRENT SHARD: ${state.currentShard.id} - ${state.currentShard.name}`);
    console.log(`   FILE: ${state.currentShard.file}`);
    console.log(`   STATUS: ${state.currentShard.status}\n`);
  }

  console.log('='.repeat(80));
  console.log('💡 TIP: Run "node scripts/ng-verify-milestone.js" before completion');
  console.log('='.repeat(80) + '\n');
}

if (require.main === module) {
  displayStatus();
}

module.exports = { parseProgress };
