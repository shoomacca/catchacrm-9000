
/**
 * AntiGravity Genesis v1.0 - Report Export Tool
 *
 * Uses context/BRIEF.md + context/STACK.md + PLAN.md + status/progress.json
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_PROJECT_PATH = process.cwd();
const TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'reports');
const REPORTS_OUTPUT_DIR = 'reports';

function parseArgs() {
  const args = process.argv.slice(2);
  const config = { projectPath: DEFAULT_PROJECT_PATH };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project-path' && args[i + 1]) {
      config.projectPath = args[i + 1];
      i++;
    }
  }
  return config;
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

function exportReports(config) {
  const projectPath = config.projectPath;
  const agPath = path.join(projectPath, '.antigravity');

  const brief = readFile(path.join(agPath, 'context', 'BRIEF.md')) || '';
  const stack = readFile(path.join(agPath, 'context', 'STACK.md')) || '';
  const plan = readFile(path.join(agPath, 'PLAN.md')) || '';
  const progress = readFile(path.join(agPath, 'status', 'progress.json')) || '';

  const templates = {
    summary: readFile(path.join(TEMPLATE_PATH, 'project-summary-template.md')),
    time: readFile(path.join(TEMPLATE_PATH, 'time-cost-breakdown-template.md')),
    architecture: readFile(path.join(TEMPLATE_PATH, 'architecture-documentation-template.md')),
    handoff: readFile(path.join(TEMPLATE_PATH, 'handoff-document-template.md'))
  };

  if (!templates.summary) {
    console.error('Report templates not found.');
    process.exit(1);
  }

  const reports = {
    'project-summary.md': templates.summary.replace(/{{PROJECT_NAME}}/g, 'Unknown Project'),
    'time-cost-breakdown.md': templates.time || '',
    'architecture-documentation.md': templates.architecture || '',
    'handoff-document.md': templates.handoff || ''
  };

  const reportsPath = path.join(projectPath, REPORTS_OUTPUT_DIR);
  Object.entries(reports).forEach(([filename, content]) => {
    writeFile(path.join(reportsPath, filename), content);
  });

  console.log('AntiGravity Genesis v1.0 - Report Export Tool');
  console.log('Reports generated in:', reportsPath);
}

const config = parseArgs();
exportReports(config);
