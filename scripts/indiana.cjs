const fs = require('fs');

const INDIANA_WEBHOOK = "https://ai.bsbsbs.au/webhook/indiana-genesis";
const RESEARCH_WEBHOOK_URL = process.env.RESEARCH_WEBHOOK_URL || 'https://ai.bsbsbs.au/webhook/research_role';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const LINEAR_TOKEN = process.env.LINEAR_API_KEY;
const GITHUB_ORG = process.env.GITHUB_ORG || 'shoomacca';
const LINEAR_TEAM_ID = process.env.LINEAR_TEAM_ID || '2782310d-ec67-461f-ac02-6e3c87f83a04';
const DRY_RUN = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true';

async function fetchWithRetry(url, options = {}, retries = 3, timeout = 30000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    let timeoutId;
    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), timeout);
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      if (attempt === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
    }
  }
}

function validateBrief(brief) {
  const errors = [];
  if (!brief.includes('PROJECT BRIEF')) errors.push('Missing PROJECT BRIEF header');
  if (!brief.includes('Archetype')) errors.push('Missing Archetype field');
  return { valid: errors.length === 0, errors };
}

function sanitizeValue(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
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

async function createGitHubRepo(projectName, archetype, brief) {
  if (!GITHUB_TOKEN) {
    console.warn('⚠️  GITHUB_TOKEN not set, skipping GitHub repo creation');
    return { success: false, error: 'No token' };
  }

  console.log('📦 Creating GitHub repository...');

  try {
    const response = await fetchWithRetry('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: projectName,
        description: `${archetype} - Created by New Genesis`,
        private: true,
        auto_init: true
      })
    }, 3, 30000);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `GitHub API error: ${response.status}`);
    }

    const repo = await response.json();

    // Create README with BRIEF content
    console.log('📝 Adding README with project brief...');
    await createGitHubFile(projectName, 'README.md', brief);

    return {
      success: true,
      id: repo.id,
      nodeId: repo.node_id,
      url: repo.html_url
    };
  } catch (error) {
    console.error('❌ GitHub repo creation failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function createGitHubFile(repo, path, content) {
  if (!GITHUB_TOKEN) return;

  try {
    const response = await fetchWithRetry(
      `https://api.github.com/repos/${GITHUB_ORG}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'docs: Add project brief',
          content: Buffer.from(content).toString('base64')
        })
      },
      3,
      30000
    );

    if (response.ok) {
      console.log('✅ README created successfully');
    }
  } catch (error) {
    console.warn('⚠️  README creation failed:', error.message);
  }
}

async function createLinearProject(projectName, archetype, brief) {
  if (!LINEAR_TOKEN) {
    console.warn('⚠️  LINEAR_API_KEY not set, skipping Linear project creation');
    return { success: false, error: 'No token' };
  }

  console.log('📋 Creating Linear project...');

  try {
    const query = `
      mutation CreateProject($name: String!, $description: String, $teamIds: [String!]!) {
        projectCreate(input: {
          name: $name,
          description: $description,
          teamIds: $teamIds
        }) {
          success
          project {
            id
            name
            url
          }
        }
      }
    `;

    const response = await fetchWithRetry('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Authorization': LINEAR_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        variables: {
          name: projectName,
          description: `${archetype} - Created by New Genesis\n\n${brief}`,
          teamIds: [LINEAR_TEAM_ID]
        }
      })
    }, 3, 30000);

    if (!response.ok) {
      throw new Error(`Linear API error: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    if (!result.data?.projectCreate?.success) {
      throw new Error('Project creation failed');
    }

    const project = result.data.projectCreate.project;

    // Add initial project update/comment
    console.log('💬 Adding initial project update...');
    await addLinearProjectComment(project.id, '🚀 Project initialized by New Genesis\n\nReady to begin milestone execution.');

    return {
      success: true,
      projectId: project.id,
      url: project.url
    };
  } catch (error) {
    console.error('❌ Linear project creation failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function addLinearProjectComment(projectId, comment) {
  if (!LINEAR_TOKEN) return;

  try {
    const query = `
      mutation CreateComment($projectId: String!, $body: String!) {
        commentCreate(input: {
          projectId: $projectId,
          body: $body
        }) {
          success
        }
      }
    `;

    await fetchWithRetry('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Authorization': LINEAR_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        variables: { projectId, body: comment }
      })
    }, 2, 15000);

    console.log('✅ Project update added successfully');
  } catch (error) {
    console.warn('⚠️  Project update failed:', error.message);
  }
}

async function createLinearTasks(projectId, tasks) {
  if (!LINEAR_TOKEN) {
    console.warn('⚠️  LINEAR_API_KEY not set, skipping task creation');
    return [];
  }

  console.log(`📝 Creating ${tasks.length} Linear tasks...`);

  const createdTasks = [];
  let successCount = 0;
  let failCount = 0;

  const query = `
    mutation CreateIssue($title: String!, $description: String, $teamId: String!, $projectId: String) {
      issueCreate(input: {
        title: $title,
        description: $description,
        teamId: $teamId,
        projectId: $projectId
      }) {
        success
        issue {
          id
          identifier
          title
          url
        }
      }
    }
  `;

  // Create tasks in batches of 5 to avoid rate limiting
  for (let i = 0; i < tasks.length; i += 5) {
    const batch = tasks.slice(i, i + 5);

    await Promise.all(batch.map(async (task) => {
      try {
        const response = await fetchWithRetry('https://api.linear.app/graphql', {
          method: 'POST',
          headers: {
            'Authorization': LINEAR_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query,
            variables: {
              title: `${task.id}: ${task.title}`,
              description: 'Task created by New Genesis',
              teamId: LINEAR_TEAM_ID,
              projectId: projectId
            }
          })
        }, 2, 15000);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if (result.errors) {
          throw new Error(result.errors[0].message);
        }

        if (result.data?.issueCreate?.success) {
          const issue = result.data.issueCreate.issue;
          createdTasks.push({
            taskId: task.id,
            linear: {
              id: issue.id,
              identifier: issue.identifier,
              url: issue.url
            }
          });
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.warn(`⚠️  Failed to create task ${task.id}:`, error.message);
        failCount++;
      }
    }));

    // Progress indicator
    console.log(`   Created ${Math.min(i + 5, tasks.length)}/${tasks.length} tasks...`);

    // Small delay between batches
    if (i + 5 < tasks.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log(`✅ Task creation complete: ${successCount} succeeded, ${failCount} failed`);

  return createdTasks;
}

async function triggerIndiana() {
  console.log('\n🚀 NEW GENESIS - Project Genesis Initialization\n');
  console.log('='.repeat(60));

  const briefPath = './.antigravity/context/BRIEF.md';
  if (!fs.existsSync(briefPath)) {
    console.error('❌ No BRIEF.md found at .antigravity/context/BRIEF.md');
    process.exit(1);
  }

  const brief = fs.readFileSync(briefPath, 'utf8');
  const validation = validateBrief(brief);
  if (!validation.valid) {
    console.error('❌ BRIEF validation failed:');
    validation.errors.forEach(e => console.error('  -', e));
    process.exit(1);
  }

  const nameMatch = brief.match(/# PROJECT BRIEF: (.*)/i) || brief.match(/# (.*)/);
  const projectName = nameMatch
    ? nameMatch[1].trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase()
    : 'project-' + Date.now();

  const taskRegex = /- \[ \] (TASK-\d+): (.+)/g;
  const tasks = [];
  let match;
  while ((match = taskRegex.exec(brief)) !== null) {
    tasks.push({ id: match[1], title: match[2].trim() });
  }

  const archetypeMatch = brief.match(/Archetype.*?TYPE (\d+)/i);
  const archetype = archetypeMatch ? 'TYPE ' + archetypeMatch[1] : 'Unknown';

  console.log(`\n📋 Project: ${projectName}`);
  console.log(`📦 Archetype: ${archetype}`);
  console.log(`📝 Tasks: ${tasks.length}`);
  console.log('\n' + '='.repeat(60) + '\n');

  if (DRY_RUN) {
    console.log('🧪 DRY RUN MODE - No changes will be made\n');
    console.log('Would create:');
    console.log(`  - GitHub repo: ${GITHUB_ORG}/${projectName}`);
    console.log(`  - Linear project with ${tasks.length} tasks`);
    console.log(`  - Vercel project`);
    return;
  }

  let githubResult = { success: false };
  let linearResult = { success: false };
  let linearTasks = [];

  // Strategy: Use direct API calls for reliability
  // The webhook can be used for Telegram notifications, but we create resources directly

  // Step 1: Create GitHub repo with README
  githubResult = await createGitHubRepo(projectName, archetype, brief);

  // Step 2: Create Linear project with initial update
  linearResult = await createLinearProject(projectName, archetype, brief);

  // Step 3: Create all Linear tasks
  if (linearResult.success && linearResult.projectId) {
    linearTasks = await createLinearTasks(linearResult.projectId, tasks);
  }

  // Step 4: Build PROJECT_IDS.json
  const projectIds = {
    projectName: projectName,
    archetype: archetype,
    createdAt: new Date().toISOString(),
    github: {
      id: githubResult.id || null,
      nodeId: githubResult.nodeId || null,
      url: githubResult.url || null
    },
    linear: {
      projectId: linearResult.projectId || null,
      teamId: LINEAR_TEAM_ID,
      projectUrl: linearResult.url || null
    },
    vercel: {
      projectId: null,
      url: null
    },
    tasks: {},
    webhooks: {
      research: RESEARCH_WEBHOOK_URL
    }
  };

  // Map Linear task results
  if (linearTasks.length > 0) {
    linearTasks.forEach(task => {
      projectIds.tasks[task.taskId] = {
        linearId: task.linear.id,
        linearIdentifier: task.linear.identifier,
        linearUrl: task.linear.url,
        title: tasks.find(t => t.id === task.taskId)?.title || ''
      };
    });
  }

  // Add any unmapped tasks as placeholders
  tasks.forEach(task => {
    if (!projectIds.tasks[task.id]) {
      projectIds.tasks[task.id] = {
        linearId: null,
        linearIdentifier: null,
        linearUrl: null,
        title: task.title
      };
    }
  });

  // Step 5: Save PROJECT_IDS.json
  const idsPath = './.antigravity/PROJECT_IDS.json';
  if (!fs.existsSync('./.antigravity')) {
    fs.mkdirSync('./.antigravity', { recursive: true });
  }

  fs.writeFileSync(idsPath, JSON.stringify(projectIds, null, 2));

  // Step 6: Trigger webhook for Telegram notification (best effort)
  try {
    console.log('\n📡 Sending notification webhook...');
    await fetchWithRetry(INDIANA_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectName,
        archetype,
        brief,
        tasks,
        researchWebhookUrl: RESEARCH_WEBHOOK_URL,
        timestamp: new Date().toISOString()
      })
    }, 1, 10000);
  } catch (error) {
    console.warn('⚠️  Notification webhook failed (non-critical):', error.message);
  }

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ PROJECT GENESIS COMPLETE\n');
  console.log(`📁 Project IDs saved: ${idsPath}\n`);

  if (githubResult.success) {
    console.log(`✅ GitHub: ${projectIds.github.url}`);
  } else {
    console.log(`❌ GitHub: Failed - ${githubResult.error || 'Unknown error'}`);
  }

  if (linearResult.success) {
    console.log(`✅ Linear: ${projectIds.linear.projectUrl}`);
    console.log(`✅ Tasks: ${linearTasks.length}/${tasks.length} created`);
  } else {
    console.log(`❌ Linear: Failed - ${linearResult.error || 'Unknown error'}`);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Exit with error if critical resources failed
  if (!githubResult.success || !linearResult.success) {
    console.error('⚠️  WARNING: Some resources failed to create. Check errors above.');
    process.exit(1);
  }
}

triggerIndiana();
