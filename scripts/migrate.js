/**
 * Migrate legacy projects to New Genesis V1 schema
 */

const fs = require('fs');
const path = require('path');
const { ensureDir, PLANNING_DIR } = require('./paths.js');

function readIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
}

function writeIfMissing(filePath, content) {
  if (fs.existsSync(filePath)) return false;
  fs.writeFileSync(filePath, content);
  return true;
}

function migrateProgress(progressPath) {
  const raw = JSON.parse(fs.readFileSync(progressPath, 'utf8'));
  if (Array.isArray(raw.milestones)) return false;

  const milestonesObj = raw.milestones || {};
  const milestones = Object.keys(milestonesObj).map(id => {
    const m = milestonesObj[id] || {};
    return {
      id,
      name: m.name || id,
      status: m.status || 'pending',
      progress: m.progress || 0,
      started: m.started || null,
      completed: m.completed || null,
      shards: []
    };
  });

  raw.milestones = milestones;
  fs.writeFileSync(progressPath, JSON.stringify(raw, null, 2));
  return true;
}

function main() {
  ensureDir(PLANNING_DIR);

  const created = [];
  const updated = [];

  const briefPath = path.join(PLANNING_DIR, 'BRIEF.md');
  const projectPath = path.join(PLANNING_DIR, 'PROJECT.md');
  const archetypePath = path.join(PLANNING_DIR, 'ARCHETYPE.md');

  const projectContent = readIfExists(projectPath) || '';
  const archetypeContent = readIfExists(archetypePath) || '';

  if (!fs.existsSync(briefPath)) {
    const titleLine = projectContent.match(/^#\s+(.+)$/m)?.[1] || 'PROJECT BRIEF: Migrated Project';
    const archetypeLine = archetypeContent.match(/TYPE\s+\d+.*$/m)?.[0] || 'TYPE 00 - Unknown';
    const briefTemplate = `# PROJECT BRIEF: ${titleLine}\n\n**Project Name:** ${titleLine}\n**Archetype:** ${archetypeLine}\n\n---\n\n## Vision\n\n[Describe vision]\n\n---\n\n## Requirements\n\n### v1 (MVP)\n- [Feature]\n\n### v2 (Post-launch)\n- [Feature]\n\n### Out of Scope\n- [Explicitly not building]\n\n---\n\n## Milestones\n\n### Milestone 1: Foundation\n- [ ] TASK-001: [Task description]\n\n---\n\n## Success Criteria\n\n- [Success criteria]\n\n---\n\n**Project approved for execution.**\n`;
    fs.writeFileSync(briefPath, briefTemplate);
    created.push('BRIEF.md');
  }

  if (writeIfMissing(path.join(PLANNING_DIR, 'STACK.md'), '# Tech Stack\n')) created.push('STACK.md');
  if (writeIfMissing(path.join(PLANNING_DIR, 'REQUIREMENTS.md'), '# Requirements\n')) created.push('REQUIREMENTS.md');
  if (writeIfMissing(path.join(PLANNING_DIR, 'ROADMAP.md'), '# Roadmap\n')) created.push('ROADMAP.md');
  if (writeIfMissing(path.join(PLANNING_DIR, 'STATE.md'), '# Project State\n')) created.push('STATE.md');
  if (writeIfMissing(path.join(PLANNING_DIR, 'DECISIONS.md'), '# Decision Log\n')) created.push('DECISIONS.md');

  const idsPath = path.join(PLANNING_DIR, 'PROJECT_IDS.json');
  if (!fs.existsSync(idsPath)) {
    fs.writeFileSync(idsPath, JSON.stringify({
      projectName: '',
      archetype: '',
      createdAt: '',
      github: { id: null, nodeId: null, url: null },
      linear: { projectId: null, teamId: null, projectUrl: null },
      vercel: { projectId: null, url: null },
      tasks: {},
      webhooks: {}
    }, null, 2));
    created.push('PROJECT_IDS.json');
  }

  const progressPath = path.join(PLANNING_DIR, 'progress.json');
  if (!fs.existsSync(progressPath)) {
    fs.writeFileSync(progressPath, JSON.stringify({
      project: '',
      version: '1.0.0',
      status: 'initialized',
      current_milestone: null,
      current_shard: null,
      progress_percent: 0,
      milestones: [],
      lastUpdate: ''
    }, null, 2));
    created.push('progress.json');
  } else if (migrateProgress(progressPath)) {
    updated.push('progress.json (schema migrated)');
  }

  console.log('Migration complete.');
  if (created.length) console.log('Created:', created.join(', '));
  if (updated.length) console.log('Updated:', updated.join(', '));
}

main();
