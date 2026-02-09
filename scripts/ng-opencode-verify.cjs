const { execSync } = require('child_process');

function run(command, options = {}) {
  execSync(command, { stdio: 'inherit', ...options });
}

function getChangedFiles() {
  try {
    const output = execSync('git diff --name-only', {
      stdio: ['ignore', 'pipe', 'ignore']
    }).toString();
    return output
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean);
  } catch (error) {
    return [];
  }
}

function filterScriptFiles(files) {
  return files.filter((file) => /\.(ts|tsx|js|jsx)$/.test(file));
}

const changedFiles = filterScriptFiles(getChangedFiles());

if (changedFiles.length > 0) {
  const fileList = changedFiles.map((file) => `"${file}"`).join(' ');
  run(`npx prettier --write ${fileList}`);
  run(`npx eslint --fix ${fileList}`);
} else {
  console.log('No changed JS/TS files detected.');
}

run('npx tsc --noEmit --pretty false');
