/**
 * Identity Validation for New Genesis
 * Validates PROJECT_IDS.json exists and has required fields
 */

const fs = require('fs');
const { resolveProjectIdsPath } = require('./paths.js');

/**
 * Validate PROJECT_IDS.json
 * Exits with error if invalid
 */
function validateProjectIds() {
  const { path: idsPath, missing } = resolveProjectIdsPath();

  if (missing || !fs.existsSync(idsPath)) {
    console.error('PROJECT_IDS.json not found.');
    console.error('Run /ng:new-project first to create infrastructure.');
    process.exit(1);
  }

  let ids;
  try {
    ids = JSON.parse(fs.readFileSync(idsPath, 'utf8'));
  } catch (error) {
    console.error('PROJECT_IDS.json is invalid JSON:', error.message);
    process.exit(1);
  }

  // Check required fields
  const required = [
    ['projectName'],
    ['github', 'id'],
    ['linear', 'projectId'],
    ['vercel', 'projectId'],
    ['tasks']
  ];

  const errors = [];
  for (const pathParts of required) {
    let current = ids;
    for (const part of pathParts) {
      if (!current || !Object.prototype.hasOwnProperty.call(current, part)) {
        errors.push(`Missing: ${pathParts.join('.')}`);
        break;
      }
      current = current[part];
    }
  }

  // Tasks must be an object
  if (ids.tasks && typeof ids.tasks !== 'object') {
    errors.push('tasks must be an object');
  }

  if (errors.length > 0) {
    console.error('PROJECT_IDS.json validation failed:');
    errors.forEach(e => console.error('  -', e));
    process.exit(1);
  }

  console.log('Identity valid:', ids.projectName);
  return ids;
}

module.exports = { validateProjectIds };

// Run if called directly
if (require.main === module) {
  validateProjectIds();
}
