
/**
 * THE SCRIBE - Genesis Milestone Summarizer
 *
 * Purpose: Automatically generates release notes from git commits
 * Trigger: Called by genesis.js when milestone completes
 * Intelligence: Uses fast LLM (Claude Haiku / GPT-4o-mini) to summarize commits
 * Output: Posts rich summary to indiana_milestone.js → n8n → Slack/Telegram
 *
 * Usage:
 *   node scripts/scribe.js M01 "@Developer"
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// --- CONFIGURATION ---
const ANTIGRAVITY_DIR = './.antigravity';
const STATUS_FILE = path.join(ANTIGRAVITY_DIR, 'status/progress.json');
const MILESTONES_DIR = path.join(ANTIGRAVITY_DIR, 'milestones');

// LLM Configuration
const LLM_PROVIDER = process.env.SCRIBE_LLM_PROVIDER || 'anthropic'; // 'anthropic' or 'openai'
const ANTHROPIC_API_KEY = process.env.SCRIBE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.SCRIBE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

// Model selection (fast, cheap models)
const ANTHROPIC_MODEL = 'claude-3-5-haiku-20241022';
const OPENAI_MODEL = 'gpt-4o-mini';
// ---------------------

function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadProgressFile() {
  if (!fs.existsSync(STATUS_FILE)) {
    throw new Error('progress.json not found');
  }
  return JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
}

function findMilestone(milestoneId, progress) {
  if (!progress.milestones) {
    throw new Error('progress.json does not contain milestones structure');
  }

  const milestone = progress.milestones.find((m) => m.id === milestoneId);
  if (!milestone) {
    throw new Error(`Milestone ${milestoneId} not found in progress.json`);
  }

  return milestone;
}

function getGitLog(sinceCommit = null, format = 'oneline') {
  try {
    let command = 'git log --oneline --no-merges';

    if (sinceCommit) {
      command += ` ${sinceCommit}..HEAD`;
    } else {
      // Get last 50 commits if no range specified
      command += ' -n 50';
    }

    const output = execSync(command, {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe']
    }).toString();

    return output.trim();
  } catch (error) {
    console.warn('⚠️  Warning: Could not read git log:', error.message);
    return '';
  }
}

function findMilestoneCommitRange(milestoneId) {
  try {
    // Try to find commits for this milestone by searching commit messages
    const pattern = milestoneId.replace('M', 'M0*'); // M01 or M1
    const command = `git log --oneline --no-merges --grep="\\[.*${milestoneId}" --grep="feat(${pattern}_" --grep="fix(${pattern}_"`;

    const output = execSync(command, {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe']
    }).toString();

    return output.trim();
  } catch (error) {
    console.warn('⚠️  Warning: Could not find milestone commits:', error.message);
    return '';
  }
}

function parseCommits(gitLogOutput) {
  if (!gitLogOutput) return [];

  const lines = gitLogOutput.split('\n').filter(Boolean);
  const commits = [];

  lines.forEach((line) => {
    const match = line.match(/^([a-f0-9]+)\s+(.+)$/);
    if (match) {
      commits.push({
        hash: match[1],
        message: match[2]
      });
    }
  });

  return commits;
}

function buildPromptForSummarization(milestoneId, milestoneName, commits) {
  const commitList = commits.map((c) => `- ${c.message}`).join('\n');

  return `You are a technical writer creating release notes for a software project milestone.

# Context
Milestone: ${milestoneId} - ${milestoneName}
Number of commits: ${commits.length}

# Git Commits
${commitList}

# Task
Generate a concise, professional release note summary in markdown format.

# Requirements
1. Group commits by category (Features, Fixes, Infrastructure, etc.)
2. Use bullet points
3. Be technical but clear
4. Max 300 words
5. Focus on WHAT was built, not HOW

# Output Format
## ${milestoneId}: ${milestoneName}

### 🎯 What Was Built
[Bulleted list of features and changes]

### 🐛 Fixes
[Bulleted list of bug fixes, if any]

### 🔧 Infrastructure
[Bulleted list of tooling/infrastructure changes, if any]

### 📊 Stats
- Commits: ${commits.length}
- [Any other relevant stats]

Generate the release notes now:`;
}

async function callAnthropicAPI(prompt) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not set. Set SCRIBE_ANTHROPIC_API_KEY or ANTHROPIC_API_KEY environment variable.');
  }

  const payload = {
    model: ANTHROPIC_MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  };

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result.content[0].text;
}

async function callOpenAIAPI(prompt) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not set. Set SCRIBE_OPENAI_API_KEY or OPENAI_API_KEY environment variable.');
  }

  const payload = {
    model: OPENAI_MODEL,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 1024,
    temperature: 0.3
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result.choices[0].message.content;
}

async function generateSummary(milestoneId, milestoneName, commits) {
  console.log(`🤖 Generating summary using ${LLM_PROVIDER.toUpperCase()} (${LLM_PROVIDER === 'anthropic' ? ANTHROPIC_MODEL : OPENAI_MODEL})...`);

  const prompt = buildPromptForSummarization(milestoneId, milestoneName, commits);

  try {
    if (LLM_PROVIDER === 'anthropic') {
      return await callAnthropicAPI(prompt);
    } else if (LLM_PROVIDER === 'openai') {
      return await callOpenAIAPI(prompt);
    } else {
      throw new Error(`Unknown LLM provider: ${LLM_PROVIDER}. Use 'anthropic' or 'openai'.`);
    }
  } catch (error) {
    console.warn('⚠️  Warning: LLM summarization failed:', error.message);
    console.warn('   Falling back to basic summary...');

    // Fallback: Generate a basic summary
    return generateBasicSummary(milestoneId, milestoneName, commits);
  }
}

function generateBasicSummary(milestoneId, milestoneName, commits) {
  const lines = [
    `## ${milestoneId}: ${milestoneName}`,
    '',
    '### 📦 Changes',
    ''
  ];

  commits.forEach((commit) => {
    lines.push(`- ${commit.message}`);
  });

  lines.push('');
  lines.push('### 📊 Stats');
  lines.push(`- Commits: ${commits.length}`);

  return lines.join('\n');
}

function saveSummary(milestoneId, summary) {
  ensureDirExists(MILESTONES_DIR);

  const summaryPath = path.join(MILESTONES_DIR, `${milestoneId}_SUMMARY.md`);
  fs.writeFileSync(summaryPath, summary);

  console.log(`✅ Summary saved to: ${summaryPath}`);
  return summaryPath;
}

// REMOVED: extractCompletedTasks() and callMilestoneReporter() are no longer used
// Scribe only generates summaries - it does NOT call indiana_milestone.js
// If you need to update Linear/n8n, run indiana_milestone.js manually

async function executeScribe() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                     THE SCRIBE v1.1                               ║');
  console.log('║              Milestone Summary Generator                          ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('❌ Usage: node scripts/scribe.js <milestone-id> [agent]');
    console.error('   Example: node scripts/scribe.js M01 "@Developer"');
    process.exit(1);
  }

  const milestoneId = args[0];
  const agent = args[1] || '@Developer';

  console.log(`📋 Milestone: ${milestoneId}`);
  console.log(`👤 Agent: ${agent}\n`);

  // 1. Load progress.json and find milestone
  console.log('📖 Loading progress.json...');
  const progress = loadProgressFile();
  const milestone = findMilestone(milestoneId, progress);

  console.log(`✅ Found milestone: ${milestone.name}`);
  console.log(`   Status: ${milestone.status}`);
  console.log(`   Shards: ${milestone.shards?.length || 0}\n`);

  // 2. Get git commits for this milestone
  console.log('📜 Reading git log...');
  let gitLog = findMilestoneCommitRange(milestoneId);

  if (!gitLog) {
    console.warn('⚠️  No milestone-specific commits found, using recent commits...');
    gitLog = getGitLog(null);
  }

  const commits = parseCommits(gitLog);

  if (commits.length === 0) {
    console.warn('⚠️  No commits found. Generating empty summary...');
  } else {
    console.log(`✅ Found ${commits.length} commits\n`);
    console.log('Sample commits:');
    commits.slice(0, 5).forEach((c) => {
      console.log(`   ${c.hash} ${c.message}`);
    });
    if (commits.length > 5) {
      console.log(`   ... and ${commits.length - 5} more\n`);
    } else {
      console.log('');
    }
  }

  // 3. Generate summary using LLM
  const summary = await generateSummary(milestoneId, milestone.name, commits);

  console.log('\n📝 Generated Summary:');
  console.log('─────────────────────────────────────────────────────────────────');
  console.log(summary);
  console.log('─────────────────────────────────────────────────────────────────\n');

  // 4. Save summary to file
  const summaryPath = saveSummary(milestoneId, summary);

  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                    ✨ SCRIBE COMPLETE ✨                          ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');
  console.log('📋 Summary saved to:', summaryPath);
  console.log('🎉 Milestone summary generation complete!');
  console.log('\n💡 Next: Run indiana_milestone.js to update Linear/n8n if needed');
}

executeScribe().catch((error) => {
  console.error('\n💥 SCRIBE FAILED:', error.message);
  process.exit(1);
});
